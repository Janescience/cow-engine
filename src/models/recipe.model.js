module.exports = (sequelize, Sequelize) => {
    
    const Recipe = sequelize.define("recipe", {
        name : Sequelize.STRING,
        amount : Sequelize.DOUBLE,
        type : {
            type: Sequelize.INTEGER,
            comment : '1=อาหารหยาบ, 2=อาหารข้น ผสมเอง, 3=อาหารข้น สำเร็จรูป'
        },
    });

    return Recipe;
};

