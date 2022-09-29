const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Farm = db.farm;

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

    await farm.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    })

    await user.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        console.info("Registered : "+req.body.username)
        res.send({ message: "ลงทะเบียนเรียบร้อยแล้ว" });
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
  
        var accessToken = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });
        
        console.info("Signined : "+req.body.username)

        const farm = await Farm.findById(user.farm).exec();

        res
          .cookie('cookieToken',accessToken)
          .status(200)
          .send({
            id: user._id,
            username: user.username,
            farm : farm,
            accessToken: accessToken,
            lineToken : user.lineToken
          });

    });
};

exports.user = async (req,res) => {
  try {
    const user = await User.findOne({_id:req.userId});
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