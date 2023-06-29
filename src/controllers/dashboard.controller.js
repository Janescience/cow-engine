const db = require("../models");
const moment = require("moment");
const _ = require("lodash");
const Promise = require('bluebird');

const Cow = db.cow;
const Milk = db.milk;
const Heal = db.heal;
const Noti = db.notification;
const Bill = db.bill;
const Equipment = db.equipment;
const Building = db.building;
const Maintenance = db.maintenance;
const Salary = db.salary;
const Food = db.food;
const Reproduction = db.reproduction;
const Birth = db.birth;
const Protection = db.protection;

const { notiService } = require("../services");

exports.cow = async (req,res) => {
    const filter = req.query
    filter.farm = req.farmId

    const cows = await Cow.find(filter).exec();

    const cow = {
        all : cows.length,
        milk : cows.filter(c => c.status === 3).length,
        pregnant : cows.filter(c => c.status === 1).length,
        baby : cows.filter(c => c.status === 4).length,
        dry : cows.filter(c => c.status === 2).length,
        premiuem : cows.filter(c => c.quality === 2).length,
    }

    res.json(cow);
}

exports.milks = async (req,res) => {
    const filter = req.query
    filter.farm = req.farmId

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
            farm : filter.farm
        }
    ).populate('milkDetails');

    res.json(milks);
}


exports.events = async (req,res) => {
    const filter = req.query
    filter.farm = req.farmId

    const today = moment(new Date()).startOf('day');

    // Events    
    const notifications = await Noti.find({farm: filter.farm}).populate('notificationParam').sort({createdAt:-1}).exec();
    let events = []
    await Promise.map(notifications, async (noti) => {
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
    });

    res.json(events);
}

const calculateSum = (items) => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};


exports.expense = async (req, res) => {
  const filter = req.query;
  filter.farm = req.farmId;

  const [bills, equipments, buildings, maintenances, salaries, foods, heals, protections] = await Promise.all([
    Bill.find(filter).exec(),
    Equipment.find(filter).exec(),
    Building.find(filter).exec(),
    Maintenance.find(filter).exec(),
    Salary.find(filter).exec(),
    Food.find(filter).exec(),
    Heal.find(filter).exec(),
    Protection.find(filter).exec()
  ]);

  const sumBills = calculateSum(bills);
  const sumEquipments = calculateSum(equipments);
  const sumBuildings = calculateSum(buildings);
  const sumMaintenances = calculateSum(maintenances);
  const sumSalaries = calculateSum(salaries);
  const sumFoods = calculateSum(foods);
  const sumHeals = calculateSum(heals);
  const sumProtections = calculateSum(protections);

  const expense = {
    fluctuate: {
      food: sumFoods,
      worker: sumSalaries
    },
    cost: {
      bill: sumBills,
      equipment: sumEquipments,
      building: sumBuildings,
      maintenance: sumMaintenances
    },
    care: {
      heal: sumHeals,
      protection: sumProtections
    }
  };

  res.json(expense);
};

exports.income = async (req,res) => {
    const filter = req.query
    filter.farm = req.farmId

    const rawMilks = await Milk.find({filter}).populate('milkDetails').exec();
    let sumRawMilks = 0;
    for(let rawMilk of rawMilks){
        for(let detail of rawMilk.milkDetails){
            sumRawMilks += detail.amount
        }
    }

    //Income
    const income = {
        rawMilk : sumRawMilks
    }

    res.json(income);
}


exports.rawMilkSort = async (req,res) => {
    const filter = req.query
    filter.farm = req.farmId

    const rawMilks = await Milk.find({filter}).populate('milkDetails').exec();

    let rawMilkDetails = []
    for(let rawMilk of rawMilks){
        for(let detail of rawMilk.milkDetails){
            rawMilkDetails.push(detail)
        }
    }

    const cowRawMilkGroups = rawMilkDetails.reduce((groups, detail) => {
        if (!groups[detail.cow]) {
            groups[detail.cow] = [];
        }
        groups[detail.cow].push(detail);
        return groups;
    }, {});

    const cowIds = Object.keys(cowRawMilkGroups);
    const cows = await Promise.all(cowIds.map(cowId => Cow.findOne({_id: cowId}).exec()));

    let cowMilkSum = cowIds.map((key, index) => {
        const cow = cows[index];
        const milks = cowRawMilkGroups[key];
        const sumMilk = milks.reduce((sum, milk) => sum + milk.qty, 0);
        return {cow: {image: cow.image, code: cow.code, name: cow.name}, sumMilk: sumMilk};
    });

    cowMilkSum.sort((a, b) => b.sumMilk - a.sumMilk);
    const rawMilkSort = cowMilkSum.slice(0, 20);
    res.json(rawMilkSort);
}

exports.corrals = async (req,res) => {
    const filter = req.query
    filter.farm = req.farmId
    let corrals = [];
    const cows = await Cow.find({filter}).exec();
    const groupCorrals = _.groupBy(cows,'corral')
    for(let key of Object.keys(groupCorrals)){
        corrals.push({corral:key,numCows:groupCorrals[key].length})
    }
    res.json(corrals);
}
