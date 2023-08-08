const db = require("../models");

const Cow = db.cow;
const Protection = db.protection;
const Heal = db.heal;
const Food = db.food;
const RawMilkDetail = db.milkDetail;
const Salary = db.salary;
const Equipment = db.equipment;
const Maintenance = db.maintenance;
const Building = db.building;
const Bill = db.bill;

const quality =  async (id) => {
  let expenseSum = 0;
  let incomeSum = 0;
  let farmSum = 0;
  let protectionSum = 0;
  let healSum = 0;
  let equipmentSum = 0;
  let maintenanceSum = 0;
  let buildingSum = 0;
  let billSum = 0;
  let salarySumAvg = 0;
  let rawmilkSum = 0;
  let sumFoodAmountAvg = 0;

  const cow = await Cow.findById(id).exec();

  if(cow){
    //รายรับ
    const rawMilkDetails = await RawMilkDetail.find({cow:cow._id}).exec();
    // น้ำนมดิบ
    rawmilkSum =  rawMilkDetails.reduce((sum, item) => sum + item.amount, 0);

    //ค่าอาหาร
    const foods = await Food.find({ farm: cow.farm, corral: cow.corral }).populate('foodDetails').exec();
    for(let food of foods){
      const sumAmount = food.foodDetails.reduce((sum,detail) => sum + detail.amount,0) * new Date(food.year,food.month,0).getDate()
      console.log('sumAmount : ',sumAmount)

      sumFoodAmountAvg += (sumAmount / food.numCow)
    }

    //ค่ารักษา
    const heals = await Heal.find({
      cow: cow._id
    }).exec();
    healSum = heals.reduce((sum, item) => sum + item.amount, 0);


    //ค่าป้องกัน/บำรุง
    const protections = await Protection.find({
      cows: { $in: [cow._id] }
    }).exec();
    protectionSum = protections.reduce((sum, item) => sum + item.amount, 0);

    //เงินเดือนพนักงาน
    const cowsCount = await Cow.count({farm:cow.farm}).exec();
    const salaries = await Salary.find({farm:cow.farm}).exec();
    const salarySum = salaries.reduce((sum, item) => sum + item.amount, 0);
    salarySumAvg = salarySum / cowsCount

    //อุปกรณ์
    const equipments = await Equipment.find({farm:cow.farm}).exec();
    equipmentSum = equipments.reduce((sum, item) => sum + item.amount, 0) / cowsCount;

    //ซ่อมบำรุง
    const maintenances = await Maintenance.find({farm:cow.farm}).exec();
    maintenanceSum = maintenances.reduce((sum, item) => sum + item.amount, 0) / cowsCount;

    //สิ่งก่อสร้าง
    const buildings = await Building.find({farm:cow.farm}).exec();
    buildingSum = buildings.reduce((sum, item) => sum + item.amount, 0) / cowsCount;

    //ค่าใช้จ่ายอื่นๆ
    const bills = await Bill.find({farm:cow.farm}).exec();
    billSum = bills.reduce((sum, item) => sum + item.amount, 0) / cowsCount;

    
    expenseSum += sumFoodAmountAvg + healSum + protectionSum + salarySumAvg + billSum;
    incomeSum += rawmilkSum
    farmSum += equipmentSum + maintenanceSum + buildingSum
  }
  const profit = incomeSum - expenseSum
  const profitPercent = (profit/incomeSum) * 100
  const profitAmount = incomeSum - expenseSum;

  const result = {
    profit:{
      percent : profitPercent,
      amount : profitAmount
    },
    income:{
      rawmilk : rawmilkSum,
      sum : incomeSum
    },
    expense:{
      heal : healSum,
      protection : protectionSum,
      food : sumFoodAmountAvg,
      salary : salarySumAvg,
      bill : billSum,
      sum : expenseSum
    },
    farm : {
      equipment : equipmentSum,
      maintenance : maintenanceSum,
      building : buildingSum,
      sum : farmSum
    }
  }

  if(profitPercent < 0){
    result.grade = 'D'
    result.description = 'แย่มาก';
  }else if(profitPercent >= 0 && profitPercent <= 30){
    result.grade = 'C';
    result.description = 'แย่';
  }else if(profitPercent > 30 && profitPercent <= 50){
    result.grade = 'B'
    result.description = 'ปกติ';
  }else if(profitPercent > 50 && profitPercent <= 80){
    result.grade = 'A'
    result.description = 'ดี';
  }else if(profitPercent > 80){
    result.grade = 'A+'
    result.description = 'ดีมาก';
  }

  return result;
  
}

const cow = {
  quality
};

module.exports = cow;
