
const db = require("../models");
const moment = require('moment');
const _ = require('lodash');

const NotificationLog = db.notificationLogs;
const Notification = db.notification;
const Reproduction = db.reproduction;
const Farm = db.farm;

const lineApi = require("./line-api")

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

const notifyToLine =  async () => {
    console.log('=======> Start schedule line notify <=======')
    console.log('-------> '+new Date()+' <-------')

    try {
        // Add 1 day because alert at 09.00 PM everyday but data is next day. 
        const today = moment(new Date()).startOf('day').add(1,'days');

        console.log('today : ',today);

        const notis = await Notification.find({'$or':[{statusBefore : 'W'},{statusAfter : 'W'}]}).populate('notificationParam').exec();
        const notiGroupFarms = _.groupBy(notis,'farm');

        console.log('notification size : ',notis.length);

        for(let key of Object.keys(notiGroupFarms)){
            const notis =  notiGroupFarms[key];

            const farm = await Farm.findOne({_id:key}).exec();

            let textAlert = '\nแจ้งเตือนวันนี้ ('+today.format('dddd DD MMMM yyyy')+')\n';
            let textAlertBefore = '\nแจ้งเตือนก่อนครบกำหนด ('+today.format('dddd DD MMMM yyyy')+')\n';
            let textAlertAfter = '\nแจ้งเตือนหลังครบกำหนด ('+today.format('dddd DD MMMM yyyy')+')\n';

            let notiIdToday = [];
            let notiIdBefores = [];
            let notiIdAfters = [];

            console.log('\n---------------------------------------------------------');
            console.log('=======> Farm : '+ farm.code +' - ' + farm.name +' <=======');
            
            for(let noti of notis){
                if(farm.lineToken != null){

                    const notiParam = noti.notificationParam;

                    if(notiParam != null){

                        console.log('\n##################################################');
                        console.log('=======> Notification : '+ notiParam.code +' - ' + notiParam.name +' <=======');

                        let data = null;
                        if(notiParam.code === 'REPRO_ESTRUST' || notiParam.code === 'REPRO_MATING' || notiParam.code === 'REPRO_CHECK'){
                            data = await Reproduction.findById(noti.dataId).populate('cow').exec();
                        }

                        if(data != null){
                            
                            const alertToday = notiParam.dueDate;
                            const numBefore = notiParam.before;
                            const numAfter = notiParam.after;

                            if(alertToday){
                                console.log('\n////// Today //////');
                                const dueDate = filterDueDate(notiParam,data);
                                console.log('dueDate : ',dueDate);
                                console.log('alert : ',today.isSame(dueDate.startOf('day')));

                                if(today.isSame(dueDate.startOf('day'))){
                                    notiIdToday.push(noti._id);
                                    textAlert += '\nเรื่อง : '+notiParam.name;
                                    textAlert += '\nโค : ' + data.cow.name ;
                                    textAlert += '\nครบกำหนด : วันนี้ !!';
                                    textAlert += '\n*************************************';
                                }
                            }

                            if(noti.statusBefore === 'W' && numBefore){
                                console.log('\n////// Before //////');

                                const dueDate = filterDueDate(notiParam,data);
                                const dueDateBefore = filterDueDate(notiParam,data).startOf('day').subtract(numBefore,'days')

                                console.log('dueDate : ',dueDate);
                                console.log('dueDateBefore : ',dueDateBefore);
                                console.log('alert : ',dueDateBefore.isSame(today));

                                if(dueDateBefore.isSame(today)){
                                    notiIdBefores.push(noti._id);
                                    textAlertBefore += '\nเรื่อง : '+notiParam.name;
                                    textAlertBefore += '\nโค : ' + data.cow.name ;
                                    textAlertBefore += '\nครบกำหนด : ' + moment(dueDate).format('dddd DD MMMM yyyy');
                                    textAlertBefore += '\nระยะเวลา : อีก ' +numBefore + ' วัน ';
                                    textAlertBefore += '\n*************************************';
                                }
                            }

                            if(noti.statusAfter === 'W' && numAfter){
                                console.log('////// After //////');

                                const dueDate = filterDueDate(notiParam,data);
                                const dueDateAfter = filterDueDate(notiParam,data).startOf('day').add(numAfter,'days')

                                console.log('dueDate : ',dueDate);
                                console.log('dueDateAfter : ',dueDateAfter);
                                console.log('alert : ',dueDateAfter.isSame(today));

                                if(dueDateAfter.isSame(today)){
                                    notiIdAfters.push(noti._id);
                                    textAlertAfter += '\nเรื่อง : '+notiParam.name;
                                    textAlertAfter += '\nโค : ' + data.cow.name ;
                                    textAlertAfter += '\nครบกำหนด : ' + moment(dueDate).format('dddd DD MMMM yyyy');
                                    textAlertAfter += '\nระยะเวลา : ผ่านมาแล้ว ' +numBefore + ' วัน ';
                                    textAlertAfter += '\n*************************************';
                                }
                            }
                        }
                        
                    }
                }else{
                    await saveLog('Farm value of lineToken is empty','B','F',null,farm._id,[noti._id])
                }
            }

            if(notiIdToday.length > 0){
                await lineApi.notify(textAlert,'B',farm._id,farm.lineToken,notiIdToday,'Today');
            }
            
            if(notiIdBefores.length > 0){
                await lineApi.notify(textAlertBefore,'B',farm._id,farm.lineToken,notiIdBefores,'Before');
            }

            if(notiIdAfters.length > 0){
                await lineApi.notify(textAlertAfter,'B',farm._id,farm.lineToken,notiIdAfters,'After');
            }

            console.log('\n---------------------------------------------------------');
        }
    } catch (error) {
        console.error('Error , schedule line notify : ',error)
    }

    console.log('-------x '+new Date()+' x-------')
    console.log('=======x End schedule line notify x=======')
}

const filterDueDate = (notiParam,data) => {

    if(notiParam.code === 'REPRO_ESTRUST'){
        return moment(new Date(data.estrusDate));
    }else if(notiParam.code === 'REPRO_MATING'){
        return moment(new Date(data.matingDate));
    }else if(notiParam.code === 'REPRO_CHECK'){
        return moment(new Date(data.checkDate));
    }

    return null;
}

const notification = {
    saveLog,
    updateStatusBefore,
    updateStatusAfter,
    notifyToLine,
    filterDueDate
};

module.exports = notification;