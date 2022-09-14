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

        res.send({ message: "User was registered successfully!" });
    })
};

exports.signin =  (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
  
        if (!user) {
          return res.status(404).send({ message: "User Not found." });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
  
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }
  
        var accessToken = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });
        
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
      return res.json({message:'No user found'})
    }
    return res.json({user:user})
  } catch (error) {
    return res.json({ error: error });  
  }
}