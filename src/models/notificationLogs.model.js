
module.exports = (sequelize, Sequelize) => {
    
    const NotificationLogs = sequelize.define("notificationLogs", {
        respMessage : {
            type: Sequelize.STRING,
            comment : 'Logs ในระบบ'
        },
        status : {
            type: Sequelize.STRING,
            comment : 'S=Success , F=Fail'
        },
        type : {
            type: Sequelize.STRING,
            comment : 'B=ระบบ(ตามเงื่อนไข), T=ทดสอบจากผู้ใช้, S=ระบบ(อัตโนมัติ)'
        },
        message : {
            type: Sequelize.STRING,
            comment : 'ข้อความที่แจ้งเตือน'
        },

    });

    return NotificationLogs;
};

