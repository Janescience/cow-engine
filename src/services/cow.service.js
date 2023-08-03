const db = require("../models");

const Cow = db.cow;
const Protection = db.protection;
const Heal = db.heal;
const Food = db.food;
const RawMilkDetail = db.milkDetail;


const quality =  async (id) => {
  let expenseSum = 0;
  let protectionSum = 0;
  let healSum = 0;
  let incomeSum = 0;
  let sumFoodAmountAvg = 0;

  const cow = await Cow.findById(id).exec();

  if(cow){
    const rawMilkDetails = await RawMilkDetail.find({cow:cow._id}).exec();
    incomeSum =  rawMilkDetails.reduce((sum, item) => sum + item.amount, 0);//รายรับ

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

    //ต้นทุนต่างๆ สิ่งก่อสร้าง อุปกรณ์ ซ่อมบำรุง

    

    expenseSum += sumFoodAmountAvg + healSum + protectionSum ;
  }

  const profitPercent = ((incomeSum - expenseSum)/incomeSum) * 100
  const profitAmount = incomeSum - expenseSum;

  const result = {
    profit:{
      percent:profitPercent,
      amount:profitAmount
    },
    income:incomeSum,
    expense:{
      heal : healSum,
      protection : protectionSum,
      food : sumFoodAmountAvg,
      sum:expenseSum
    }
  }

  if(profitPercent < 0){
    result.quality = 'D'
    result.description = 'แย่มาก';
  }else if(profitPercent >= 0 && profitPercent < 30){
    result.quality = 'C';
    result.description = 'แย่';
  }else if(profitPercent >= 30 && profitPercent <=50){
    result.quality = 'B'
    result.description = 'ปกติ';
  }else if(profitPercent > 50 && profitPercent < 80){
    result.quality = 'A'
    result.description = 'ดี';
  }else if(profitPercent >= 80){
    result.quality = 'A+'
    result.description = 'ดีมาก';
  }

  return result;
  
}

const cow = {
  quality
};

module.exports = cow;
