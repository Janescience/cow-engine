const db = require("../models");
const Cow = db.cow;
const Milking = db.milking;
const Reproduction = db.reproduction;

cowCheckDup = (req, res, next) => {

    Cow.findOne({
      code: req.body.code,
      farm : req.body.farm
    }).exec((err, cow) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
  
      if (cow) {
        res.status(400).send({ message: "รหัสโคซ้ำ กรุณาใช้รหัสอื่น" });
        return;
      }

      next();
    });
};

milkingCheckDup = (req, res, next) => {

  Milking.findOne({
    date: req.body.date,
    cow : req.body.cow
  }).exec((err, cow) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (cow) {
      res.status(400).send({ message: "ข้อมูลการรีดนมซ้ำ" });
      return;
    }

    next();
  });
};

reproCheckDup = (req, res, next) => {

  Reproduction.findOne({
    loginDate: req.body.loginDate,
    cow : req.body.cow
  }).exec((err, cow) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (cow) {
      res.status(400).send({ message: "ข้อมูลการสืบพันธุ์ซ้ำ" });
      return;
    }

    next();
  });
};
  
const verifyCreate = {
  cowCheckDup,
  milkingCheckDup,
  reproCheckDup
};

module.exports = verifyCreate;