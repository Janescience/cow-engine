
const db = require("../models");
const moment = require('moment');

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

const filterDueDate = (notiParam,data) => {

    if(notiParam.code === 'REPRO_ESTRUST'){
        return moment(new Date(data.estrusDate));
    }else if(notiParam.code === 'REPRO_MATING'){
        return moment(new Date(data.matingDate));
    }else if(notiParam.code === 'REPRO_CHECK'){
        return moment(new Date(data.checkDate));
    }else if(notiParam.code === 'BIRTH'){
        return moment(new Date(data.birthDate));
    }

    return null;
}

const filterData = async (notiParam) => {

    if(notiParam.code === 'REPRO_ESTRUST' || notiParam.code === 'REPRO_MATING' || notiParam.code === 'REPRO_CHECK'){
        return await Reproduction.findById(noti.dataId).populate('cow').exec();
    }else if(notiParam.code === 'BIRTH'){
        return await Birth.findById(noti.dataId).populate('cow').exec();
    }

    return null;
}

const notification = {
    saveLog,
    updateStatusBefore,
    updateStatusAfter,
    filterDueDate,
    filterData
};

module.exports = notification;
