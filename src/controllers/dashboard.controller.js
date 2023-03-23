const db = require("../models");
const moment = require("moment");
const Cow = db.cow;
const Milk = db.milk;
const Heal = db.heal;
const Noti = db.notification;
const Reproduction = db.reproduction;

exports.get = async (req, res) => {
    const filter = req.query
    const farmId = req.farmId;
    const ObjectID = require('mongodb').ObjectId;

    const today = moment(new Date()).startOf('day');

    filter.farm = farmId

    //Cow
    const cows = await Cow.find(filter).exec();
    const heals = await Heal.find(filter).exec();
    const cow = {
        all : cows.length,
        milk : cows.filter(c => c.status === 3).length,
        pregnant : cows.filter(c => c.status === 1).length,
        baby : cows.filter(c => c.status === 4).length,
        dry : cows.filter(c => c.status === 2).length,
        premiuem : cows.filter(c => c.quality === 2).length,
        sick : heals.length,
        avgMaxMilk : null,
        sumMaxMilk : null
    }

    //Milks
    let year = new Date().getFullYear();

    let start = new Date(year,0,1)
    const startOffset = start.getTimezoneOffset();
    let startDate = new Date(start.getTime() - (startOffset*60*1000))

    let end = new Date(year, 11, 31);
    const endOffset = end.getTimezoneOffset();
    let endDate = new Date(end.getTime() - (endOffset*60*1000))

    const milks = await Milk.find(
        {   
            date : { $gte : startDate.toISOString().split('T')[0] , $lte : endDate.toISOString().split('T')[0] },
            farm : farmId
        }
    ).populate('milkDetails');


    // Events    
    const notifications = await Noti.find({farm:farmId}).populate('notificationParam').sort({createdAt:-1}).exec();
    let events = []
    for(let noti of notifications){
        const notiParam = noti.notificationParam;

        let data = null;
        if(notiParam.code === 'REPRO_ESTRUST' || notiParam.code === 'REPRO_MATING' || notiParam.code === 'REPRO_CHECK'){
            data = await Reproduction.findById(noti.dataId).populate('cow').exec();
        }

        if(data != null){
            let dueDate = null;
            if(notiParam.code === 'REPRO_ESTRUST'){
                dueDate = moment(new Date(data.estrusDate)).startOf('day');
            }else if(notiParam.code === 'REPRO_MATING'){
                dueDate = moment(new Date(data.matingDate)).startOf('day');
            }else if(notiParam.code === 'REPRO_CHECK'){
                dueDate = moment(new Date(data.checkDate)).startOf('day');
            }
            if(today.isSameOrBefore(dueDate)){
                const event = {
                    title : notiParam.name + ' / ' + data.cow.name,
                    date : dueDate,
                }
                events.push(event);
            }
            
        }
    }

    res.json(
        {
            cow,
            milks,
            events
        }
    );
};

