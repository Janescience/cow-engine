const db = {};

db.user = require("./user.model");
db.cow = require("./cow.model");
db.farm = require("./farm.model");
db.milk = require("./milk.model");
db.milkDetail = require("./milkDetail.model");
db.reproduction = require("./reproduction.model");
db.birth = require("./birth.model");
db.heal = require("./heal.model");
db.protection = require("./protection.model");
db.food = require("./food.model");
db.notificationLogs = require("./notificationLogs.model");
db.recipe = require("./recipe.model");
db.recipeDetail = require("./recipeDetail.model");
db.refreshToken = require("./refreshToken.model");

module.exports = db;