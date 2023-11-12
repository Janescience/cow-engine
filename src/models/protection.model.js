

module.exports = (sequelize, Sequelize) => {
    
    const Protection = sequelize.define("protection", {
        seq : Sequelize.INTEGER,
        date : Sequelize.DATE,
        sumQty : Sequelize.INTEGER,
        sumAmount : Sequelize.DOUBLE,
    });

    return Protection;
};

