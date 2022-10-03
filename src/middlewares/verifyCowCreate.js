const db = require("../models");
const Cow = db.cow;

checkDuplicate = (req, res, next) => {
    // Username
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
  
const verifyCowCreate = {
  checkDuplicate
};

module.exports = verifyCowCreate;