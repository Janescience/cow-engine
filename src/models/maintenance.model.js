
module.exports = (sequelize, Sequelize) => {
    
    const Maintenance = sequelize.define("maintenance", {
        code : Sequelize.STRING,
        name : Sequelize.STRING,
        category : {
            type:Sequelize.STRING,
            comment:'E = อุปกรณ์, B = สิ่งก่อสร้าง'
        },
        date : Sequelize.DATE,
        reason : Sequelize.STRING,
        amount : Sequelize.DOUBLE,
        maintenancer : Sequelize.STRING,
    });

    return Maintenance;
};

