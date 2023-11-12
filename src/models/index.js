const pg = require("pg")

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.POSTGRES_DB, 
  process.env.POSTGRES_USER, 
  process.env.POSTGRES_PASSWORD, 
  {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
          require: true,
          rejectUnauthorized: false
      }
    },
    dialectModule: pg, 
    operatorsAliases: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    } 
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.farm = require("./farm.model")(sequelize, Sequelize);
db.user = require("./user.model")(sequelize, Sequelize);
db.cow = require("./cow.model")(sequelize, Sequelize);
db.bill = require("./bill.model")(sequelize, Sequelize);
db.birth = require("./birth.model")(sequelize, Sequelize);
db.building = require("./building.model")(sequelize, Sequelize);
db.equipment = require("./equipment.model")(sequelize, Sequelize);
db.food = require("./food.model")(sequelize, Sequelize);
db.foodDetail = require("./foodDetail.model")(sequelize, Sequelize);
db.recipe = require("./recipe.model")(sequelize, Sequelize);
db.recipeDetail = require("./recipeDetail.model")(sequelize, Sequelize);
db.heal = require("./heal.model")(sequelize, Sequelize);
db.healDetail = require("./healDetail.model")(sequelize, Sequelize);
db.maintenance = require("./maintenance.model")(sequelize, Sequelize);
db.milk = require("./milk.model")(sequelize, Sequelize);
db.milkDetail = require("./milkDetail.model")(sequelize, Sequelize);
db.notification = require("./notification.model")(sequelize, Sequelize);
db.notificationParam = require("./notificationParam.model")(sequelize, Sequelize);
db.notificationLogs = require("./notificationLogs.model")(sequelize, Sequelize);
db.param = require("./param.model")(sequelize, Sequelize);
db.protection = require("./protection.model")(sequelize, Sequelize);
db.protectionDetail = require("./protectionDetail.model")(sequelize, Sequelize);
db.reproduction = require("./reproduction.model")(sequelize, Sequelize);
db.reproductionDetail = require("./reproductionDetail.model")(sequelize, Sequelize);
db.salary = require("./salary.model")(sequelize, Sequelize);
db.worker = require("./worker.model")(sequelize, Sequelize);
db.vaccine = require("./vaccine.model")(sequelize, Sequelize);
db.refreshToken = require("./refreshToken.model")(sequelize, Sequelize);


db.farm.hasOne(db.user)
db.user.belongsTo(db.farm)

db.user.hasMany(db.refreshToken)

db.farm.hasMany(db.cow)
db.farm.hasMany(db.bill)
db.farm.hasMany(db.building)
db.farm.hasMany(db.equipment)
db.farm.hasMany(db.food)
db.farm.hasMany(db.foodDetail)
db.farm.hasMany(db.recipe)
db.farm.hasMany(db.recipeDetail)
db.farm.hasMany(db.birth)
db.farm.hasMany(db.heal)
db.farm.hasMany(db.maintenance)
db.farm.hasMany(db.milk)
db.farm.hasMany(db.notification)
db.farm.hasMany(db.notificationParam)
db.farm.hasMany(db.notificationLogs)
db.farm.hasMany(db.param)
db.farm.hasMany(db.protection)
db.farm.hasMany(db.reproduction)
db.farm.hasMany(db.salary)
db.farm.hasMany(db.worker)
db.farm.hasMany(db.vaccine)

db.cow.hasMany(db.birth)
db.cow.hasMany(db.heal)
db.cow.hasMany(db.protectionDetail)
db.cow.hasMany(db.reproduction)
db.cow.hasMany(db.milkDetail)

db.food.hasMany(db.foodDetail)
db.foodDetail.belongsTo(db.food)
db.foodDetail.hasOne(db.recipe)

db.milk.hasMany(db.milkDetail)
db.milkDetail.belongsTo(db.milk)

db.recipe.hasMany(db.recipeDetail)
db.recipeDetail.belongsTo(db.recipe)

db.heal.hasMany(db.healDetail)
db.healDetail.belongsTo(db.heal)

db.notification.hasMany(db.notificationParam)

db.notificationLogs.hasMany(db.notification)

db.protection.hasMany(db.protectionDetail)

db.vaccine.hasMany(db.protection)

db.reproduction.hasMany(db.reproductionDetail)

db.worker.hasMany(db.salary);

module.exports = db;
