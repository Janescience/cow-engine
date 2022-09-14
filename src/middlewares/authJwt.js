const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user

verifyToken =  (req, res, next) => {
    let token = "";
    const {cookieToken} = req.cookies;

    if(!cookieToken){
      let headerToken = !req.headers["authorization"] ? req.body.headers["authorization"] : req.headers["authorization"];
      
      if (!headerToken) {
        return res.status(403).send({ message: "No token provided!" });
      }

      token = headerToken.split(" ")[1];
      if(!token){
        return res.status(403).send({ message: "No token provided!" });
      }

    }else{
      token = cookieToken
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      req.userId = decoded.id;
      req.user = User.findById(req.userId)
      next();
    });

};

const authJwt = {
    verifyToken
};

module.exports = authJwt;