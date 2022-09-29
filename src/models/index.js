const db = {};

db.user = require("./user.model");
db.transaction = require("./transaction.model");
db.cow = require("./cow.model");
db.farm = require("./farm.model");

module.exports = db;