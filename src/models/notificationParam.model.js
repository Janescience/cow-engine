

module.exports = (sequelize, Sequelize) => {
    
    const NotificationParam = sequelize.define("notificationParam", {
        before : {
            type: Sequelize.INTEGER,
            comment : 'จำนวนวัน/เดือนที่อยากให้แจ้งเตือนก่อนถึงกำหนดกี่วัน'
        },
        beforeType : {
            type: Sequelize.STRING,
            comment : 'ประเภทการแจ้งเตือนก่อน D=Day, M=Month'
        },
        after : {
            type: Sequelize.INTEGER,
            comment : 'จำนวนวัน/เดือนที่อยากให้แจ้งเตือนหลังจากครบกำหนดกี่วัน'
        },
        afterType : {
            type: Sequelize.STRING,
            comment : 'ประเภทการแจ้งเตือนหลัง D=Day, M=Month'
        },
        dueDate : {
            type: Sequelize.BOOLEAN,
            comment : 'ต้องการให้แจ้งเตือนวันครบกำหนดหรือไม่ ? True or False',
            default : true
        },
        code : {
            type: Sequelize.STRING,
            comment : 'REPRO_ESTRUST=การเป็นสัด, REPRO_MATING=การผสม, REPRO_CHECK=การตรวจท้อง, BIRTH=การคลอด, VACCINE_* = วัคซีนต่างๆ',
        },
        name : Sequelize.STRING,
    });

    return NotificationParam;
};
