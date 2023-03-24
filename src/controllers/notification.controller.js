const db = require("../models");
const moment = require("moment");

const { notiService } = require("../services");

const Logs = db.notificationLogs;
const Noti = db.notification;
const Reproduction = db.reproduction;

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

        let data = null;
        if(notiParam.code === 'REPRO_ESTRUST' || notiParam.code === 'REPRO_MATING' || notiParam.code === 'REPRO_CHECK'){
            data = await Reproduction.findById(noti.dataId).populate('cow').exec();
        }

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
                alert : today.isSame(notiService.filterDueDate(notiParam,data).startOf('day'))
            }
            events.push(event);
        }
    }
    res.json({events});
};

exports.notify = async (req, res) => {
    const data = req.query;
    if(data.key === 'dairy-farm-noti-to-line'){
        await notiService.notifyToLine();
    }else{
        console.error('KEY is invalid !!')
        res.status(500).end('KEY is invalid !!');
        return;
    }
    res.status(200).end('Notification to line successfully.');
};

