
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
            type: Sequelize.INTEGER,
            comment : '1=โคท้อง,2=โคดราย,3=โครีดนม,4=โคเด็ก'
        },
        quality: {
            type: Sequelize.INTEGER,
            comment : '1=คุณภาพดี,2=ปกติ,3=แย่,4=ไม่ได้ตรวจ'
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
