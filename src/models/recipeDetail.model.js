module.exports = (sequelize, Sequelize) => {
    
    const RecipeDetail = sequelize.define("recipeDetail", {
        food : {
            type : Sequelize.STRING,
            comment : 'ชื่อวัตถุดิบ'
        },
        cost : {
            type : Sequelize.DOUBLE,
            comment : 'ราคา/หน่วย'
        } ,
        qty : {
            type: Sequelize.INTEGER,
            comment : 'จำนวน'
        },
        amount : {
            type: Sequelize.DOUBLE,
            comment : 'ราคารวม'
        },
    });

    return RecipeDetail;
};


