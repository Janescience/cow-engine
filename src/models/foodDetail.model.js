module.exports = (sequelize, Sequelize) => {
    
    const FoodDetail = sequelize.define("foodDetail", {
        qty : Sequelize.INTEGER,
        amount : Sequelize.DOUBLE,
    });

    return FoodDetail;
};

