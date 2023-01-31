
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
    lineApi.notify(req.body.message,'T',req.farmId,req.body.lineToken)
    return res.status(200).send({ message: "Notify Successfully." });
  } catch (error) {
    return res.json({ error: error.response.data.message });  
  }
};

