
module.exports = (sequelize, Sequelize) => {
    
    const MilkDetail = sequelize.define("milkDetail", {
        qty : Sequelize.INTEGER,
        amount : Sequelize.DOUBLE,
    });

    return MilkDetail;
};



