
module.exports = (sequelize, Sequelize) => {
    
    const Notification = sequelize.define("notification", {
        statusBefore : {
            type: Sequelize.STRING,
            comment : 'W=Wait, S=Success, N=Not Alert'
        },
        statusAfter : {
            type: Sequelize.STRING,
            comment : 'W=Wait, S=Success, N=Not Alert'
        },
        dataId : {
            type: Sequelize.INTEGER,
            comment : 'เก็บ ID ของตารางต่างๆ'
        },

    });

    return Notification;
};

