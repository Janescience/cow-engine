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
      farm : req.farmId
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
    cow : req.body.cow,
    farm : req.farmId
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
    cow : req.body.cow,
    farm : req.farmId
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
    farm : req.farmId
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
  console.log('Food check dup : ',req.body)
  console.log('Food check dup , farm id : ',req.farmId)
  Food.findOne({
    corral: req.body.corral,
    recipe : req.body.recipe,
    farm : req.farmId
  }).exec((err, food) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (food) {
      res.status(400).send({ message: "การให้อาหารซ้ำ" });
      return;
    }

  });

  Cow.find({
    corral : req.body.corral,
    farm : req.farmId
  }).exec((err , cow) => {
    if (cow.length == 0) {
      res.status(400).send({ message: "คอก " + req.body.corral +" ไม่มีโค" });
      return;
    }

    next();
  });
};

recipeCheckDup = (req, res, next) => {

  Recipe.findOne({
    name: req.body.recipe.name,
    farm: req.farmId,
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