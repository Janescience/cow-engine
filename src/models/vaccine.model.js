
module.exports = (sequelize, Sequelize) => {
    
    const Vaccine = sequelize.define("vaccine", {
        frequency : Sequelize.INTEGER,
        code : Sequelize.STRING,
        name : Sequelize.STRING,
        price : Sequelize.DOUBLE,
        use : {
            type:Sequelize.INTEGER,
            comment:'ใช้ได้กี่ตัว'
        },
        amount : {
            type:Sequelize.DOUBLE,
            comment:'คิดเป็นราคา/ตัว'
        },
        quantity : {
            type : Sequelize.INTEGER,
            comment : 'ปริมาณ (ลิตร)' 
        },
        nextDate : {
            type:Sequelize.DATE,            
            comment:'วันที่ให้วัคซีนครั้งต่อไป'
        },
        currentDate : {
            type:Sequelize.DATE,
            comment:'วันที่ให้วัคซีนล่าสุด'
        },
        startDate : {
            type:Sequelize.DATE,
            comment:'วันที่เริ่มให้วัคซีนล่าสุด'
        },
    });

    return Vaccine;
};


