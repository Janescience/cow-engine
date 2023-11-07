// const db = {};

// db.user = require("./user.model");
// db.cow = require("./cow.model");
// db.farm = require("./farm.model");
// db.milk = require("./milk.model");
// db.milkDetail = require("./milkDetail.model");
// db.reproduction = require("./reproduction.model");
// db.birth = require("./birth.model");
// db.heal = require("./heal.model");
// db.protection = require("./protection.model");
// db.food = require("./food.model");
// db.foodDetail = require("./foodDetail.model");
// db.notificationLogs = require("./notificationLogs.model");
// db.recipe = require("./recipe.model");
// db.recipeDetail = require("./recipeDetail.model");
// db.refreshToken = require("./refreshToken.model");
// db.param = require("./param.model");
// db.notificationParam = require("./notificationParam.model");
// db.notification = require("./notification.model");
// db.bill = require("./bill.model");
// db.building = require("./building.model");
// db.equipment = require("./equipment.model");
// db.maintenance = require("./maintenance.model");
// db.worker = require("./worker.model");
// db.vaccine = require("./vaccine.model");
// db.salary = require("./salary.model");
// db.historyChange = require("./historyChange.model");

const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
  },
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.user = require("./user.model")(sequelize, Sequelize);
db.farm = require("./farm.model")(sequelize, Sequelize);
db.cow = require("./cow.model")(sequelize, Sequelize);
// db.milk = require("./milk.model")(sequelize, Sequelize);
// db.milkDetail = require("./milkDetail.model")(sequelize, Sequelize);
// db.reproduction = require("./reproduction.model")(sequelize, Sequelize);
// db.birth = require("./birth.model")(sequelize, Sequelize);
// db.heal = require("./heal.model")(sequelize, Sequelize);
// db.protection = require("./protection.model")(sequelize, Sequelize);
// db.food = require("./food.model")(sequelize, Sequelize);
// db.foodDetail = require("./foodDetail.model")(sequelize, Sequelize);
// db.notificationLogs = require("./notificationLogs.model")(sequelize, Sequelize);
// db.recipe = require("./recipe.model")(sequelize, Sequelize);
// db.recipeDetail = require("./recipeDetail.model")(sequelize, Sequelize);
// db.refreshToken = require("./refreshToken.model")(sequelize, Sequelize);
// db.param = require("./param.model")(sequelize, Sequelize);
// db.notificationParam = require("./notificationParam.model")(sequelize, Sequelize);
// db.notification = require("./notification.model")(sequelize, Sequelize);
// db.bill = require("./bill.model")(sequelize, Sequelize);
// db.building = require("./building.model")(sequelize, Sequelize);
// db.equipment = require("./equipment.model")(sequelize, Sequelize);
// db.maintenance = require("./maintenance.model")(sequelize, Sequelize);
// db.worker = require("./worker.model")(sequelize, Sequelize);
// db.vaccine = require("./vaccine.model")(sequelize, Sequelize);
// db.salary = require("./salary.model")(sequelize, Sequelize);
// db.historyChange = require("./historyChange.model")(sequelize, Sequelize);

// db.user = require("./user.model");
db.milk = require("./milk.model");
db.milkDetail = require("./milkDetail.model");
db.reproduction = require("./reproduction.model");
db.birth = require("./birth.model");
db.heal = require("./heal.model");
db.protection = require("./protection.model");
db.food = require("./food.model");
db.foodDetail = require("./foodDetail.model");
db.notificationLogs = require("./notificationLogs.model");
db.recipe = require("./recipe.model");
db.recipeDetail = require("./recipeDetail.model");
db.refreshToken = require("./refreshToken.model");
db.param = require("./param.model");
db.notificationParam = require("./notificationParam.model");
db.notification = require("./notification.model");
db.bill = require("./bill.model");
db.building = require("./building.model");
db.equipment = require("./equipment.model");
db.maintenance = require("./maintenance.model");
db.worker = require("./worker.model");
db.vaccine = require("./vaccine.model");
db.salary = require("./salary.model");
db.historyChange = require("./historyChange.model");

module.exports = db;
