const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }
  console.log('jwt verify token error : ',err)  
  return res.status(401).send({ message: "Unauthorized!" });
}

const verifyToken =  (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.farmId = decoded.id;
    console.log("decoded : ",decoded)
    console.log("farm id : ",req.farmId)
    next();
  });

};

const authJwt = {
    verifyToken
};

module.exports = authJwt;