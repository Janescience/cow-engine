

module.exports = (sequelize, Sequelize) => {
    
    const Salary = sequelize.define("salary", {
        month : Sequelize.INTEGER,
        year : Sequelize.INTEGER,
        amount : Sequelize.DOUBLE,
        remark : Sequelize.STRING,
    });

    return Salary;
};

