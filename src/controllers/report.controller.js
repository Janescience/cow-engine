const db = require("../models");
const Excel = require('exceljs');
const path = require('path');
const Cow = db.cow;
const Milk = db.milk;
const Food = db.food;
const Salary = db.salary;
const _ = require('lodash');
const moment = require('moment');

exports.getCowAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const cows = await Cow.find(filter).exec();

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('โค');
    // add data to sheet 1
    sheet.columns = [
      { header: 'รหัส', key: 'code', width: 20 },
      { header: 'ชื่อ', key: 'name', width: 10 },
      { header: 'วันเกิด', key: 'birthDate', width: 20  ,style: { numFmt: 'dd/mm/yyyy' } },
      { header: 'คอก', key: 'corral', width: 20 },
      { header: 'สถานะ', key: 'status', width: 20 },
      { header: 'พ่อพันธู์', key: 'dad', width: 20 },
      { header: 'แม่พันธุ์', key: 'mom', width: 20 },
    ];

    sheet.addRows(cows);
  
    var fileName = 'cows.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
};

exports.getRawMilk = async (req, res) => {
  const filter = req.query
  filter.farm = req.farmId

  const year = filter.year;
  const monthFrom = filter.monthFrom;
  const monthTo = filter.monthTo;
  console.log('monthFrom : ',monthFrom)
  console.log('monthTo : ',monthTo)

  let workbook = new Excel.Workbook();

  const rangeMonths = monthTo - monthFrom
  console.log('rangeMonths : ',rangeMonths)
  for(let i = 0 ;i <= rangeMonths ; i++ ){

    let month = i + Number(monthFrom);
    console.log('month : ',month)

    let start = new Date(year,(month - 1),1)

    const startOffset = start.getTimezoneOffset();
    let startDate = new Date(start.getTime() - (startOffset*60*1000))
    console.log('startDate : ',startDate)

    const daysInMonth = new Date(year, month, 0).getDate();
    let end = new Date(year, (month - 1), daysInMonth);
    const endOffset = end.getTimezoneOffset();
    let endDate = new Date(end.getTime() - (endOffset*60*1000))
    console.log('endDate : ',endDate)

    const salaries = await Salary.find({farm:req.farmId,month:month,year:year}).exec();
    const sumMonthSalary = salaries.reduce((sum, item) => sum + item.amount, 0);

    const milks = await Milk.find({   
      date : { $gte : startDate.toISOString().split('T')[0] , $lte : endDate.toISOString().split('T')[0] },
      farm : filter.farm
    }).populate('milkDetails').sort({date:1}).exec();

    const milkGroupDates = _.groupBy(milks,'date');
    console.log('milkGroupDates : ',Object.keys(milkGroupDates).length)
    let milkFilters = [];

    for(let date of Object.keys(milkGroupDates)){
      const milkAllTimeInDay = milkGroupDates[date];// Get all time M,A in day

      const milkMorning = milkAllTimeInDay.filter(m => m.time === 'M'); // Get all cows in morning time
      if(milkMorning.length > 0){
        for(let morningDetail of milkMorning[0].milkDetails){
          const cow = await Cow.findById(morningDetail.cow).exec();
          let milk = {
            date :  milkMorning[0].date,
            morningQty : morningDetail.qty,
            morningAmount : morningDetail.amount,
            afternoonQty : 0,
            afternoonAmount : 0,
          }

          let dataFilter =  milkFilters.filter(mf => mf.cow == cow.name)
          let dataDay = {};
          if(dataFilter.length == 0){
            dataDay = {
              cow : cow.name,
              cowId : cow._id,
              cowCorral : cow.corral,
              milks : [milk]
            }
            milkFilters.push(dataDay)
          }else{
            dataFilter[0].milks.push(milk)
          }
        }
      }
      

      const milkAfternoon = milkAllTimeInDay.filter(m => m.time === 'A'); // Get all cows in morning time
      if(milkAfternoon.length > 0){
        for(let afternoonDetail of milkAfternoon[0].milkDetails){
          const cow = await Cow.findById(afternoonDetail.cow).exec();
          let cowFilter =  milkFilters.filter(mf => mf.cow == cow.name);
          if(cowFilter.length > 0){
            let dateFilter = cowFilter[0].milks.filter(m => moment(m.date).isSame(moment(milkAfternoon[0].date)));

            if(dateFilter.length > 0){
              dateFilter[0].afternoonQty = afternoonDetail.qty;
              dateFilter[0].afternoonAmount = afternoonDetail.amount;
            }
          }else{
            const dataDay = {
              cow : cow.name,
              cowId : cow._id,
              cowCorral : cow.corral,
              milks : [{
                date :  milkAfternoon[0].date,
                morningQty : 0,
                morningAmount : 0,
                afternoonQty : afternoonDetail.qty,
                afternoonAmount : afternoonDetail.amount,
              }]
            }
            milkFilters.push(dataDay)
          }
          
        }
      }
    }

    //Day Summary
    const sumDays = {};
    for (const milkFilter of milkFilters) {
      for(const milk of milkFilter.milks){
        const day = moment(milk.date).format('D');
        if(!sumDays[day]){
          sumDays[day] = {
            sumMorningQty : milk.morningQty,
            sumMorningAmount : milk.morningAmount,
            sumAfternoonQty : milk.afternoonQty ,
            sumAfternoonAmount : milk.afternoonAmount ,
            count:1
          };
        }else{
          sumDays[day].sumMorningQty += milk.morningQty
          sumDays[day].sumAfternoonQty += milk.afternoonQty
          sumDays[day].sumMorningAmount += milk.morningAmount
          sumDays[day].sumAfternoonAmount += milk.afternoonAmount
          sumDays[day].count++;
        }
      }
    }
    console.log('sumDays : ',sumDays)

    let monthStr = moment().month(month-1).format("MMMM");

    if(Object.keys(milkGroupDates).length > 0){
      const sheet = workbook.addWorksheet(monthStr);
      sheet.state = 'visible';
      // const dayColumns = Object.keys(milkGroupDates).length * 3;
      const daysInMonth = moment().month(month-1).daysInMonth()
      const dayColumns = daysInMonth * 3;

      //Header
      mergeCell(sheet,1,1,1,dayColumns + 11,'แบบบันทึกผลผลิต(น้ำนมดิบ) ประจำวัน เดือน' + monthStr + ' ' + year);
      valueCell(sheet,2,1,'ลำดับที่')
      valueCell(sheet,2,2,'โค')
      mergeCell(sheet,2,3,2,dayColumns + 2,'วันที่');
      mergeCell(sheet,2,dayColumns + 3,3,dayColumns + 4,'สรุป');
      mergeCell(sheet,2,dayColumns + 5,3,dayColumns + 6,'รายได้');
      mergeCell(sheet,2,dayColumns + 7,3,dayColumns + 8,'ค่าอาหาร');
      mergeCell(sheet,2,dayColumns + 9,3,dayColumns + 10,'ค่าจ้างคนงาน');
      mergeCell(sheet,2,dayColumns + 11,3,dayColumns + 13,'สถานภาพของโค');

      //Sub Header
      const dateKeys = Object.keys(milkGroupDates)
      for (let i = 1; i <= daysInMonth; i++) {
        // mergeCell(sheet,3,i * 3,3,(i * 3) + 2,moment(new Date(dateKeys[i-1])).format('DD'));
        mergeCell(sheet,3,i * 3,3,(i * 3) + 2,i);

        valueCell(sheet,4,i * 3,'เช้า')
        valueCell(sheet,4,i * 3 + 1,'บ่าย')
        valueCell(sheet,4,i * 3 + 2,'รวม')
      }

      valueCell(sheet,4,dayColumns + 3,'รวม')
      valueCell(sheet,4,dayColumns + 4,'เฉลี่ย')
      valueCell(sheet,4,dayColumns + 5,'ราคา/กก.')
      valueCell(sheet,4,dayColumns + 6,'เป็นเงิน')
      valueCell(sheet,4,dayColumns + 7,'ต่อวัน')
      valueCell(sheet,4,dayColumns + 8,'เป็นเงิน')
      valueCell(sheet,4,dayColumns + 9,'ต่อวัน')
      valueCell(sheet,4,dayColumns + 10,'เป็นเงิน')
      valueCell(sheet,4,dayColumns + 11,'ส่วนต่าง')
      valueCell(sheet,4,dayColumns + 12,'คิดเป็น %')
      valueCell(sheet,4,dayColumns + 13,'สถานภาพ')

      //Data
      let rowNumDataStart = 5;
      let foodSum = 0
      let foodTotal = 0
      console.log('data milkFilters : ',milkFilters)
      for (const milkFilter of milkFilters) {
        const data = milkFilter;

        const foods = await Food.find({farm:req.farmId,corral:data.cowCorral}).exec();
        foodSum = foods.reduce((sum, item) => sum + item.amountAvg, 0);

        //ชื่อโค
        valueCell(sheet,rowNumDataStart,2,data.cow)

        let totalQty = 0;
        let totalAmount = 0;

        for (let j = 0; j < data.milks.length; j++) {

          const milk = data.milks[j];
          console.log('data milk : ',milk)
          const day = moment(milk.date).format('D');
          console.log('data day : ',day)

          const morningQty = milk.morningQty;
          const afternoonQty = milk.afternoonQty;
          const sumQty = morningQty + afternoonQty;
          totalQty += sumQty

          const morningAmount = milk.morningAmount;
          const afternoonAmount = milk.afternoonAmount;
          const sumAmount = morningAmount + afternoonAmount;
          totalAmount += sumAmount

          valueCell(sheet,rowNumDataStart,day*3,morningQty)
          valueCell(sheet,rowNumDataStart,day*3+1,afternoonQty)
          valueCell(sheet,rowNumDataStart,day*3+2,sumQty)
          
        }

        const numMilking = data.milks.length;

        valueCell(sheet,rowNumDataStart,dayColumns+3,totalQty)
        valueCell(sheet,rowNumDataStart,dayColumns+4,totalQty/numMilking)
        valueCell(sheet,rowNumDataStart,dayColumns+5,totalAmount/totalQty)
        valueCell(sheet,rowNumDataStart,dayColumns+6,totalAmount)
        valueCell(sheet,rowNumDataStart,dayColumns+7,foodSum)
        valueCell(sheet,rowNumDataStart,dayColumns+8,foodSum*numMilking)
        valueCell(sheet,rowNumDataStart,dayColumns+9,sumMonthSalary/daysInMonth)
        valueCell(sheet,rowNumDataStart,dayColumns+10,sumMonthSalary/milkFilters.length)

        foodTotal +=  (foodSum*numMilking)
        rowNumDataStart++;
        console.log('rowNum : ',rowNumDataStart)
      }

      rowNumDataStart++;
      //Summary day
      valueCell(sheet,rowNumDataStart,2,'รวม')
      valueCell(sheet,rowNumDataStart+1,2,'ค่าเฉลี่ย')
      let sumTotalQty = 0;
      let sumTotalAmount = 0;
      for(let sumDay of Object.keys(sumDays)){
        const sum = sumDays[sumDay];
        valueCell(sheet,rowNumDataStart,Number(sumDay)*3,sum.sumMorningQty)
        valueCell(sheet,rowNumDataStart,Number(sumDay)*3+1,sum.sumAfternoonQty)
        valueCell(sheet,rowNumDataStart,Number(sumDay)*3+2,sum.sumMorningQty + sum.sumAfternoonQty)
        valueCell(sheet,rowNumDataStart+1,Number(sumDay)*3+2,(sum.sumMorningQty + sum.sumAfternoonQty)/sum.count)
        sumTotalQty += sum.sumMorningQty + sum.sumAfternoonQty;
        sumTotalAmount += sum.sumMorningAmount + sum.sumAfternoonAmount;
      }
      valueCell(sheet,rowNumDataStart,dayColumns+3,sumTotalQty)
      valueCell(sheet,rowNumDataStart,dayColumns+4,sumTotalQty/Object.keys(sumDays).length)
      valueCell(sheet,rowNumDataStart,dayColumns+5,sumTotalAmount/sumTotalQty)
      valueCell(sheet,rowNumDataStart,dayColumns+6,sumTotalAmount)
      valueCell(sheet,rowNumDataStart,dayColumns+8,foodTotal)
    }
    
  }
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=raw-milks.xlsx");

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
};

const mergeCell = (sheet,startRow,startColumn,endRow,endColumn,value) => {
    sheet.mergeCells(startRow,startColumn,endRow,endColumn);
    sheet.getCell(startRow,startColumn).value = value
    sheet.getCell(startRow,startColumn).alignment = { horizontal: 'center' };
}

const valueCell = (sheet,startRow,startColumn,value) => {
  sheet.getCell(startRow,startColumn).value = value
}
