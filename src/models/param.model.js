

module.exports = (sequelize, Sequelize) => {
    
    const Param = sequelize.define("param", {
        group : Sequelize.STRING,
        code : Sequelize.STRING,
        name : Sequelize.STRING,
        valueNumber : Sequelize.DOUBLE,
        valueString : Sequelize.STRING,
    });

    return Param;
};

