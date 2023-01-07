const db = require("../models");
const Cow = db.cow;
const Milking = db.milking;
const Reproduction = db.reproduction;
const Protection = db.protection;
const Food = db.food;
const Recipe = db.recipe;

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

protectionCheckDup = (req, res, next) => {

  Protection.findOne({
    vaccine: req.body.vaccine,
    farm : req.body.farm
  }).exec((err, protection) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (protection) {
      res.status(400).send({ message: "วัคซีนซ้ำ" });
      return;
    }

    next();
  });
};


foodCheckDup = (req, res, next) => {

  Food.findOne({
    corral: req.body.corral,
  }).exec((err, food) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (food) {
      res.status(400).send({ message: "คอกซ้ำ" });
      return;
    }

    next();
  });
};

recipeCheckDup = (req, res, next) => {

  Recipe.findOne({
    name: req.body.name,
    farm: req.body.farm,
  }).exec((err, food) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (food) {
      res.status(400).send({ message: "ชื่อสูตรอาหารซ้ำ" });
      return;
    }

    next();
  });
};

const verifyCreate = {
  cowCheckDup,
  milkingCheckDup,
  reproCheckDup,
  protectionCheckDup,
  foodCheckDup,
  recipeCheckDup
};

module.exports = verifyCreate;