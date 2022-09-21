const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
    const user = new User({
      username: req.body.username,
      name: req.body.name,
      password: bcrypt.hashSync(req.body.password, 8),
      lineToken : null,
    });

    await user.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        console.log("Registered : ",req.body.username)
        res.send({ message: "ลงทะเบียนเรียบร้อยแล้ว" });
    })
};

exports.signin =  (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
          console.error(err)
          res.status(500).send({ message: err });
          return;
        }
  
        if (!user) {
          console.log("Username not found : ",req.body.username)
          return res.status(401).send({ message: "ชื่อผู้ใช้ไม่ถูกต้อง กรุณาลองอีกครั้ง" });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
  
        if (!passwordIsValid) {
          console.log("Invalid password : ",req.body.username)
          return res.status(401).send({
            accessToken: null,
            message: "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
          });
        }
  
        var accessToken = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });
        
        console.log("Signined : ",req.body.username)

        res
          .cookie('cookieToken',accessToken)
          .status(200)
          .send({
            id: user._id,
            username: user.username,
            name : user.name,
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
    return res.json({user:user})
  } catch (error) {
    return res.json({ error: error });  
  }
}