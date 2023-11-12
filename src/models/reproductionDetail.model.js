


module.exports = (sequelize, Sequelize) => {
    
    const ReproductionDetail = sequelize.define("reproductionDetail", {
        seq : Sequelize.INTEGER,
        dad : Sequelize.STRING,
        mom : Sequelize.STRING,
        loginDate : {
            type : Sequelize.DATE,
            comment : 'วันที่เข้าระบบสืบพันธฺุ'
        },
        loginDate : {
            type : Sequelize.DATE,
            comment : 'วันที่เข้าระบบสืบพันธฺุ'
        },
        estrusDate : {
            type : Sequelize.DATE,
            comment : 'วันที่เป็นสัด'
        },
        matingDate : {
            type : Sequelize.DATE,
            comment : 'วันที่ผสม'
        },
        checkDate : {
            type : Sequelize.DATE,
            comment : 'วันที่ตรวจท้อง'
        },
        result : {
            type : Sequelize.INTEGER,
            comment : 'ผลการตรวจก่อนเข้าระบบสืบพันธุ์ 1=ผิดปกติ, 2=ปกติ'
        },
        howTo : {
            type : Sequelize.STRING,
            comment : 'แก้ไขหรือรักษาอย่างไรเมื่อผลตรวจผิดปกติ'
        },
        status : {
            type : Sequelize.STRING,
            comment : '1=อยู่ในกระบวนการสืบพันธุ์ , 2=ตั้งครร 3=คลอดลูกแล้ว 4=สืบพันธุ์ไม่สำเร็จ'
        },
    });

    return ReproductionDetail;
};


