const db = require("../models");
const Milking = db.milking;

checkDuplicate = (req, res, next) => {
    // Username
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
  
const verifyMilkingCreate = {
  checkDuplicate
};

module.exports = verifyMilkingCreate;