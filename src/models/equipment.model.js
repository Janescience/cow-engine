module.exports = (sequelize, Sequelize) => {
    
    const Equipment = sequelize.define("equipment", {
        code : Sequelize.STRING,
        name : Sequelize.STRING,
        startDate : {
            type: Sequelize.DATE,
        },
        endDate : {
            type: Sequelize.DATE,
        },
        status : { 
            type : Sequelize.STRING, 
            comment : 'A = ใช้งาน, I = ไม่ใช้งาน'
        },
        remark : Sequelize.STRING,
        amount : {
            type: Sequelize.DOUBLE,
        },
    });

    return Equipment;
};
