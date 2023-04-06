const db = require("../models");
const moment = require("moment");
const _ = require('lodash');

const { notiService,lineApi } = require("../services");

const Logs = db.notificationLogs;
const Noti = db.notification;
const Reproduction = db.reproduction;
const Farm = db.farm;
const Birth = db.birth;

exports.getLogs = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const notifications = await Logs.find(filter).sort({createdAt:-1}).exec();
    res.json({notifications});
};

exports.getCalendar = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const notifications = await Noti.find(filter).populate('notificationParam').sort({createdAt:-1}).exec();
    let events = []
    const today = moment(new Date()).startOf('day');
    for(let noti of notifications){
        const notiParam = noti.notificationParam;

        const data = await notiService.filterData(notiParam,noti);

        if(data != null){

            if(notiParam.before && notiParam.before > 0){
                const dueDateBefore = notiService.filterDueDate(notiParam,data).startOf('day').subtract(notiParam.before,'days')
                const event = {
                    id : noti._id+'_before',
                    title : notiParam.name + ' (ก่อน)' + ' / ' + data.cow.name ,
                    date : notiService.filterDueDate(notiParam,data).startOf('day').format("YYYY-MM-DD"),
                    time : { start : dueDateBefore.format("YYYY-MM-DD") },
                    description : 'โค : ' + data.cow.name+ ' | แจ้งเตือนก่อน ' +notiParam.before + ' วัน',
                    alert : noti.statusBefore == 'S'
                }
                events.push(event);
            }

            if(notiParam.after && notiParam.after > 0){
                const dueDateAfter = notiService.filterDueDate(notiParam,data).startOf('day').add(notiParam.after,'days')
                const event = {
                    id : noti._id+'_after',
                    title : notiParam.name+ ' (หลัง)' + ' / ' + data.cow.name,
                    date : notiService.filterDueDate(notiParam,data).startOf('day').format("YYYY-MM-DD"),
                    time : { start : dueDateAfter.format("YYYY-MM-DD") },
                    description : 'โค : ' + data.cow.name + ' | แจ้งเตือนหลัง ' +notiParam.after + ' วัน',
                    alert : noti.statusAfter == 'S'
                }
                events.push(event);
            }
            
            const event = {
                id : noti._id,
                title : notiParam.name + ' / ' + data.cow.name,
                date : notiService.filterDueDate(notiParam,data).startOf('day').format("YYYY-MM-DD"),
                time : { start : notiService.filterDueDate(notiParam,data).startOf('day').format("YYYY-MM-DD") },
                description : 'โค : ' + data.cow.name,
                alert : today.isSame(notiService.filterDueDate(notiParam,data).startOf('day')) || today.isAfter(notiService.filterDueDate(notiParam,data).startOf('day'))
            }
            events.push(event);
        }
    }
    res.json({events});
};

exports.notify = async (req, res) => {
    const data = req.query;
    try {
        if(data.key === 'dairy-farm-noti-to-line'){
            console.log('=======> Start schedule line notify <=======')
            console.log('-------> '+new Date()+' <-------')
        
            try {
                // Add 1 day because cloud server time -7 (UTC) and cron job time is 03.00 AM (Thai)
                const today = moment(new Date()).startOf('day').add(1,'days');
        
                // Timezone on server is UTC 
                console.log('today : ',today);
        
                const notis = await Noti.find({'$or':[{statusBefore : 'W'},{statusAfter : 'W'}]}).populate('notificationParam').exec();
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
        
                                const data = await notiService.filterData(notiParam,noti);

                                if(data != null){
                                    
                                    const alertToday = notiParam.dueDate;
                                    const numBefore = notiParam.before;
                                    const numAfter = notiParam.after;
        
                                    if(alertToday){
                                        console.log('\n////// Today //////');
                                        const dueDate = notiService.filterDueDate(notiParam,data);
                                        console.log('dueDate : ',dueDate);
                                        console.log('alert : ',today.isSame(dueDate.startOf('day')));
        
                                        if(today.isSame(dueDate.startOf('day'))){
                                            notiIdToday.push(noti._id);
                                            textAlert += '\nเรื่อง : '+notiParam.name;
                                            textAlert += '\nโค : ' + data.cow.name ;
                                            textAlert += '\nครบกำหนด : วันนี้ !!';
                                            textAlert += '\n*******************************';
                                        }
                                    }
        
                                    if(noti.statusBefore === 'W' && numBefore){
                                        console.log('\n////// Before //////');
        
                                        const dueDate = notiService.filterDueDate(notiParam,data);
                                        const dueDateBefore = notiService.filterDueDate(notiParam,data).startOf('day').subtract(numBefore,'days')
        
                                        console.log('dueDate : ',dueDate);
                                        console.log('dueDateBefore : ',dueDateBefore);
                                        console.log('alert : ',dueDateBefore.isSame(today));
        
                                        if(dueDateBefore.isSame(today)){
                                            notiIdBefores.push(noti._id);
                                            textAlertBefore += '\nเรื่อง : '+notiParam.name;
                                            textAlertBefore += '\nโค : ' + data.cow.name ;
                                            textAlertBefore += '\nครบกำหนด : ' + moment(dueDate).format('dddd DD MMMM yyyy');
                                            textAlertBefore += '\nระยะเวลา : อีก ' +numBefore + ' วัน ';
                                            textAlertBefore += '\n*******************************';
                                        }
                                    }
        
                                    if(noti.statusAfter === 'W' && numAfter){
                                        console.log('////// After //////');
        
                                        const dueDate = notiService.filterDueDate(notiParam,data);
                                        const dueDateAfter = notiService.filterDueDate(notiParam,data).startOf('day').add(numAfter,'days')
        
                                        console.log('dueDate : ',dueDate);
                                        console.log('dueDateAfter : ',dueDateAfter);
                                        console.log('alert : ',dueDateAfter.isSame(today));
        
                                        if(dueDateAfter.isSame(today)){
                                            notiIdAfters.push(noti._id);
                                            textAlertAfter += '\nเรื่อง : '+notiParam.name;
                                            textAlertAfter += '\nโค : ' + data.cow.name ;
                                            textAlertAfter += '\nครบกำหนด : ' + moment(dueDate).format('dddd DD MMMM yyyy');
                                            textAlertAfter += '\nระยะเวลา : ผ่านมาแล้ว ' +numBefore + ' วัน ';
                                            textAlertAfter += '\n*******************************';
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

                    if(notiIdToday.length == 0 && notiIdBefores.length == 0 && notiIdAfters.length == 0){
                        await lineApi.notify('วันนี้ไม่มีรายการแจ้งเตือน','B',farm._id,farm.lineToken,[],'Empty');
                    }
        
                    console.log('\n---------------------------------------------------------');
                }
            } catch (error) {
                console.error('Error  : ',error);
                res.status(500).end(error);
                return;
            }
        
            console.log('-------x '+new Date()+' x-------')
            console.log('=======x End schedule line notify x=======')
        }else{
            console.error('KEY is invalid !!')
            res.status(500).end('KEY is invalid !!');
            return;
        }
        res.status(200).end('Notification to line successfully.');
    } catch (error) {
        return res.json({ error: error.response.data.message });  
    }
};

