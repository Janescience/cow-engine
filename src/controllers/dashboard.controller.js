const db = require("../models");
const moment = require("moment");
const Cow = db.cow;
const Milk = db.milk;
const Heal = db.heal;
const Noti = db.notification;
const Bill = db.bill;
const Equipment = db.equipment;
const Building = db.building;
const Maintenance = db.maintenance;
const Worker = db.worker;
const Food = db.food;
const Reproduction = db.reproduction;
const Birth = db.birth;
const Protection = db.protection;

const { notiService } = require("../services");

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

        const data = await notiService.filterData(notiParam,noti);

        if(data != null){
            const dueDate = notiService.filterDueDate(notiParam,data);
            if(dueDate != null){
                if(today.isSameOrBefore(dueDate)){
                    const event = {
                        title : notiParam.name ,
                        date : dueDate,
                        cow : data.cow?.name
                    }
                    if(events.length < 10){
                        events.push(event);
                    }
                }
            }
            
            
        }
    }

    //Expense
    const bills = await Bill.find(filter).exec();
    let sumBills = 0;
    if(bills.length > 0){
        for(let bill of bills){
            sumBills += bill.amount
        }
    }

    const equipments = await Equipment.find(filter).exec();
    let sumEquipments = 0;
    if(equipments.length > 0){
        for(let equipment of equipments){
            sumEquipments += equipment.amount
        }
    }

    const buildings = await Building.find(filter).exec();
    let sumBuildings = 0;
    if(equipments.length > 0){
        for(let building of buildings){
            sumBuildings += building.amount
        }
    }
    const maintenances = await Maintenance.find(filter).exec();
    let sumMaintenances = 0;
    for(let maintenance of maintenances){
        sumMaintenances += maintenance.amount
    }
    

    const workers = await Worker.find(filter).exec();
    let sumWorkers = 0;
    for(let worker of workers){
        const endDate = worker.endDate ? new Date(worker.endDate) : new Date()
        const diffMonth = moment(endDate).startOf('day').diff(moment(new Date(worker.startDate)).startOf('day'),'months',true)
        sumWorkers += (worker.salary * diffMonth.toFixed(2))
    }

    const foods = await Food.find(filter).exec();
    let sumFoods = 0;
    for(let food of foods){
        sumFoods += food.amount
    }
    

    let sumHeals = 0;
    if(heals.length > 0){
        for(let heal of heals){
            sumHeals += heal.amount
        }
    }

    const protections = await Protection.find(filter).exec();
    let sumProtections = 0;
    for(let protection of protections){
        sumProtections += protection.amount
    }

    //Expense
    const expense = {
        fluctuate : {
            food:sumFoods,
            worker:sumWorkers
        },
        cost : {
            bill :sumBills,
            equipment:sumEquipments,
            building:sumBuildings,
            maintenance:sumMaintenances,
        },
        care : {
            heal:sumHeals,
            protection:sumProtections
        }
    }
    const rawMilks = await Milk.find({filter}).populate('milkDetails').exec();
    let sumRawMilks = 0;
    for(let rawMilk of rawMilks){
        for(let detail of rawMilk.milkDetails){

        }
    }
    //Income
    const income = {
        rawMilk : 
    }
    res.json(
        {
            cow,
            milks,
            events,
            expense
        }
    );
};

