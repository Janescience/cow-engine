
const db = require("../models");
const NotificationLog = db.notificationLog;

const saveLog =  async (text,type,status,response,farm,notiIds) => {
    const newNotiLog = new NotificationLog({
        message : text,
        type : type,
        status : status,
        respMessage : responseMsg,
        farm : farm,
        notification : notiIds
    });
    newNotiLog.save();
    console.log('Notification log saved : ',newNotiLog);
}

const updateStatusBefore =  async (notiIds,status) => {
    await Notification.updateOne({_id:{'$in':notiIds}},{statusBefore : status}).exec();
}

const updateStatusAfter =  async (notiIds,status) => {
    await Notification.updateOne({_id:{'$in':notiIds}},{statusAfter : status}).exec();
}

const notification = {
    saveLog,
    updateStatusBefore,
    updateStatusAfter
};

module.exports = notification;