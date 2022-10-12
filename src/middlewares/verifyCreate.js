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

  Reproduction.find({
    cow : req.body.cow
  })
  .sort({seq:-1})
  .exec((err, repros) => {
    
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (repros.length > 0) {
      if(repros[0].status != "3" && repros[0].status != "4"  ){
        res.status(400).send({ message: "การผสมพันธุ์ครั้งล่าสุด ยังไม่เสร็จสิ้น ไม่สามารถผสมพันธุ์ครั้งต่อไปได้" });
        return;
      }else if(repros[0].loginDate == req.body.loginDate && repros[0].status != "4"){
        res.status(400).send({ message: "ข้อมูลการผสมพันธุ์ซ้ำกับครั้งล่าสุด" });
        return;
      }
      
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