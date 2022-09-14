const db = {};

db.user = require("./user.model");
db.transaction = require("./transaction.model");

module.exports = db;