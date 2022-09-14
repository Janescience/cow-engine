
const { lineApi } = require("../services")
const db = require("../models");
const User = db.user;

exports.redirect = (req, res) => {
  try {
    lineApi.token(req.query.code,req.query.state)
    return res.status(200).send({ message: "Created Line Access Token Successfully." });
  } catch (error) {
    return res.json({ error: error.response.data.message });  
  }
};

exports.notify = (req, res) => {
  try {
      if(!req.user){
        return res.status(404).send({ message: "User Not found." });
      }
      
      lineApi.notify(req.body.message,req.user.lineToken)

      return res.status(200).send({ message: "Notify Successfully." });
  } catch (error) {
    return res.json({ error: error.response.data.message });  
  }
};

