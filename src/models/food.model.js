module.exports = (sequelize, Sequelize) => {
    
    const Food = sequelize.define("food", {
        corral : Sequelize.STRING,
        numCow : Sequelize.INTEGER,
        month : {
            type: Sequelize.INTEGER,
        },
        year : {
            type: Sequelize.INTEGER,
        },
    });

    return Food;
};
