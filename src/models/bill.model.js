const { DataTypes } = require('sequelize')

module.exports = (sequelize, Sequelize) => {
    const Bill = sequelize.define("bill", {
        remark : Sequelize.STRING,
        code : Sequelize.STRING,
        name : Sequelize.STRING,
        date : Sequelize.DATE,
        amount : Sequelize.DOUBLE,
    });
    return Bill;
};

