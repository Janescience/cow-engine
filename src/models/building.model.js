module.exports = (sequelize, Sequelize) => {
    
    const Building = sequelize.define("building", {
        code : Sequelize.STRING,
        name : Sequelize.STRING,
        date : {
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
        builder : { 
            type : Sequelize.STRING, 
        },
    });

    return Building;
};
