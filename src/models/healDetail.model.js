

module.exports = (sequelize, Sequelize) => {
    
    const HealDetail = sequelize.define("healDetail", {
        healer : Sequelize.STRING,
        method : Sequelize.STRING,
        disease : Sequelize.STRING,
        date : Sequelize.DATE,
        seq : Sequelize.INTEGER,
        amount : Sequelize.DOUBLE,
    });

    return HealDetail;
};

