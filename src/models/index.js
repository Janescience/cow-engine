const db = {};

db.user = require("./user.model");
db.cow = require("./cow.model");
db.farm = require("./farm.model");
db.milking = require("./milking.model");
db.reproduction = require("./reproduction.model");

module.exports = db;