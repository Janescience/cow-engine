const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken =  (req, res, next) => {
    const token = "";
    const {cookiesToken} = req.cookies;

    if(!cookiesToken){
      let headerToken = !req.headers["authorization"] ? req.body.headers["authorization"] : req.headers["authorization"];
      
      if (!headerToken) {
        return res.status(403).send({ message: "No token provided!" });
      }

      token = headerToken.split(" ")[1];
      if(!token){
        return res.status(403).send({ message: "No token provided!" });
      }
      
    }else{
      token = cookiesToken
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      req.userId = decoded._id;
      next();
    });

};

const authJwt = {
    verifyToken
};

module.exports = authJwt;