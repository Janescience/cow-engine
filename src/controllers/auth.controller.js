const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Farm = db.farm;
const RefreshToken = db.refreshToken;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


exports.signup = async (req, res) => {

    const countF = await Farm.collection.countDocuments();
    const farm = new Farm({
      code : "F" + String(countF + 1).padStart(4,'0'),
      name : req.body.farmName,
      lineToken : null
    })
    const user = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      farm : farm,
    });

     farm.save((err, farm) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      user.save((err, user) => {

        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        console.info("Registered : "+req.body.username)
        res.send({ message: "ลงทะเบียนเรียบร้อยแล้ว" });
      })

    })
};

exports.signin = (req, res) => {

    User.findOne({
        username: req.body.username
    }).exec(async (error,user) => {
        if (!user) {
          console.info("Username not found : "+req.body.username)
          return res.status(401).send({ message: "ชื่อผู้ใช้ไม่ถูกต้อง กรุณาลองอีกครั้ง" });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
  
        if (!passwordIsValid) {
          console.info("Invalid password : "+req.body.username)
          return res.status(401).send({
            accessToken: null,
            message: "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
          });
        }
  
        var accessToken = jwt.sign({ id: user.farm }, config.secret, {
          expiresIn: config.jwtExpiration // 24 hours
        });

        const farm = await Farm.findById(user.farm).exec();

        let refreshToken = await RefreshToken.createToken(user);

        console.info("Signined : "+req.body.username)

        res
          .cookie('cookieToken',accessToken)
          .status(200)
          .send({
            id: user._id,
            username: user.username,
            farm : farm,
            accessToken: accessToken,
            lineToken : user.lineToken,
            refreshToken: refreshToken,
          });

    });
};

exports.user = async (req,res) => {
  try {
    const user = await User.findOne({farm:req.farmId});
    if(!user){
      return res.json({message:'ไม่พบผู้ใช้งานในระบบ'})
    }
    console.log("Get user : "+user.username)
    return res.json({user:user})
  } catch (error) {
    console.error("Error : ",error)
    return res.json({ error: error });  
  }
}

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
      
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    let newAccessToken = jwt.sign({ id: refreshToken.user.farm }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};