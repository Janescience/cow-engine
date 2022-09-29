const db = require("../models");
const Cow = db.cow;

checkDuplicate = (req, res, next) => {
    // Username
    Cow.findOne({
      name: req.body.name,
      farm : req.body.farm
    }).exec((err, cow) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
  
      if (cow) {
        res.status(400).send({ message: "Failed! Cow name is already in use!" });
        return;
      }

      next();
    });
};
  
const verifyCowCreate = {
  checkDuplicate
};

module.exports = verifyCowCreate;