
module.exports = (sequelize, Sequelize) => {
    const Cow = sequelize.define("cow", {
        image: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        birthDate: {
            type: Sequelize.DATE
        },
        adopDate: {
            type: Sequelize.DATE
        },
        corral: {
            type: Sequelize.STRING
        },
        weight: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.INTEGER
        },
        quality: {
            type: Sequelize.INTEGER
        },
        flag: {
            type: Sequelize.STRING,
            default : 'Y'
        },
        dad: {
            type: Sequelize.STRING,
        },
        mom: {
            type: Sequelize.STRING,
        },
        remark: {
            type: Sequelize.STRING,
        },
    });
  
    return Cow;
  };
