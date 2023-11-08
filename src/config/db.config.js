// module.exports = sequelize
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // HOST: "13.250.122.106",
  HOST: process.env.HOST,
  USER: "postgres",
  PASSWORD: "postgres",
  // PASSWORD: "post123",
  DB: process.env.DB,
  dialect: "postgres",
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
