const cron = require('node-cron');
const db = require("../models");
const moment = require('moment');
const _ = require('lodash');

const { lineApi,notiService } = require("../services")

const Notification = db.notification;
const Reproduction = db.reproduction;
const Farm = db.farm;

const notify = cron.schedule('*/10 * * * * *',  async function() {
    console.log('=======> Start schedule line notify <=======')
    console.log('-------> '+new Date()+' <-------')

    try {
        const today = moment(new Date()).startOf('day');
        console.log('today : ',today);

        let textAlertBefore = 'แจ้งเตือนก่อนครบกำหนด ('+today.format('dddd DD MMMM yyyy')+')';
        let textAlertAfter = 'แจ้งเตือนหลังครบกำหนด ('+today.format('dddd DD MMMM yyyy')+')';

        const notis = await Notification.find({'$or':[{statusBefore : 'W'},{statusAfter : 'W'}]}).populate('notificationParam').exec();
        const notiGroupFarms = _.groupBy(notis,'farm');

        for(let key of Array.prototype.keys.call(notiGroupFarms)){
            const notis =  notiGroupFarms[key];

            const farm = await Farm.findById(key).exec();

            let notiIdBefores = [];
            let notiIdAfters = [];
            
            for(let noti of notis){
                const farm = noti.farm;

                if(farm.lineToken != null){

                    const notiParam = noti.notificationParam;

                    if(notiParam != null){

                        console.log('\n##################################################');
                        console.log('=======> Notification : '+ notiParam.code +' <=======');
                        console.log('noti param : ',notiParam);

                        let data = null;
                        if(notiParam.code === 'REPRO_ESTRUST' || notiParam.code === 'REPRO_MATING' || notiParam.code === 'REPRO_CHECK'){
                            data = await Reproduction.findById(noti.dataId).populate('cow').exec();
                        }

                            if(data != null){
                                
                                const numBefore = notiParam.before;
                                const numAfter = notiParam.after;

                                let dueDate = null;
                                if(notiParam.code === 'REPRO_ESTRUST'){
                                    dueDate = moment(new Date(repro.estrusDate));
                                }else if(notiParam.code === 'REPRO_MATING'){
                                    dueDate = moment(new Date(repro.matingDate));
                                }else if(notiParam.code === 'REPRO_CHECK'){
                                    dueDate = moment(new Date(repro.checkDate));
                                }

                                console.log('dueDate : ',dueDate);

                                if(noti.statusBefore === 'W'){
                                    console.log('////// Before //////');

                                    const dueDateBefore = dueDate.startOf('day').subtract(numBefore,'days')

                                    console.log('dueDateBefore : ',dueDateBefore);
                                    console.log('alert : ',dueDateBefore.isSame(today));

                                    if(dueDateBefore.isSame(today)){
                                        notiIdBefores.push(noti._id);
                                        textAlertBefore += '\nเรื่อง : '+notiParam.name;
                                        textAlertBefore += '\nโค : ' + data.cow.name ;
                                        textAlertBefore += '\nครบกำหนด : ' + moment(dueDate).format('dddd DD MMMM yyyy');
                                        textAlertBefore += '\nระยะเวลา : อีก ' +numBefore + ' วัน ';
                                        textAlertBefore += '\n***************************\n';
                                    }
                                }

                                if(noti.statusAfter === 'W'){
                                    console.log('////// After //////');

                                    const dueDateAfter = dueDate.startOf('day').add(numAfter,'days')

                                    console.log('dueDateAfter : ',dueDateAfter);
                                    console.log('alert : ',dueDateAfter.isSame(today));

                                    if(dueDateAfter.isSame(today)){
                                        notiIdAfters.push(noti._id);
                                        textAlertAfter += '\nเรื่อง : '+notiParam.name;
                                        textAlertAfter += '\nโค : ' + data.cow.name ;
                                        textAlertAfter += '\nครบกำหนด : ' + moment(dueDate).format('dddd DD MMMM yyyy');
                                        textAlertAfter += '\nระยะเวลา : ผ่านมาแล้ว ' +numBefore + ' วัน ';
                                        textAlertAfter += '\n***************************\n';
                                    }
                                }
                            }
                        
                    }
                }else{
                    await notiService.saveLog('Farm value of lineToken is empty','B','F',null,farm._id,[noti._id])
                }
            }
            
            if(notiIdBefores.length > 0){
                await lineApi.notify(textAlertBefore,'B',farm._id,farm.lineToken,notiIdBefores,'Before');
            }

            if(notiIdAfters.length > 0){
                await lineApi.notify(textAlertAfter,'B',farm._id,farm.lineToken,notiIdAfters,'After');
            }

        }


    } catch (error) {
        console.error('Error , schedule line notify : ',error)
    }

    console.log('-------x '+new Date()+' x-------')
    console.log('=======x End schedule line notify x=======')

});

const schedule = {
    notify
};

module.exports = schedule;