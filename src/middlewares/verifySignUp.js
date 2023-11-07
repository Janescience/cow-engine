const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;
const checkDuplicateUsername = (req, res, next) => {
  const username = req.body.username;

    let condition = username ? { username: { [Op.iLike]: `%${username}%` } } : null;

    // Username
    // User.findOne({
    //   username: req.body.username
    // }).exec((err, user) => {
    //   if (user) {
    //     // console.log('Failed username is already in use , ',req.body.username)
    //     res.status(400).send({ message: "Failed! Username is already in use!" });
    //     return;
    //   }
    //   next();
    // });

    User.findAll({ where: condition })
      .then(data => {
        console.log('User found : ',data)
        if (data.length > 0) {
          // console.log('Failed username is already in use , ',req.body.username)
          res.status(400).send({ message: "Failed! Username is already in use!" });
          return;
        }
        next();
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
        return
      });
};
  
const verifySignUp = {
    checkDuplicateUsername
};

module.exports = verifySignUp;
