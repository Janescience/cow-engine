
const db = require("../models");
const NotificationLog = db.notificationLogs;
const Notification = db.notification;

const saveLog =  async (text,type,status,responseMsg,farm,notiIds) => {
    const newNotiLog = new NotificationLog({
        message : text,
        type : type,
        status : status,
        respMessage : responseMsg,
        farm : farm,
        notification : notiIds
    });
    await newNotiLog.save();
    console.log('Notification log saved : ',text);
}

const updateStatusBefore =  async (notiIds,status) => {
    await Notification.updateMany({_id:{'$in':notiIds}},{statusBefore : status}).exec();
}

const updateStatusAfter =  async (notiIds,status) => {
    await Notification.updateMany({_id:{'$in':notiIds}},{statusAfter : status}).exec();
}

const notification = {
    saveLog,
    updateStatusBefore,
    updateStatusAfter
};

module.exports = notification;