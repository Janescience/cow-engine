const db = require("../models");
const Excel = require('exceljs');
const path = require('path');
const Cow = db.cow;
const Milk = db.milk;
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
            afternoonQty : 0
          }

          let dataFilter =  milkFilters.filter(mf => mf.cow == cow.name)
          let dataDay = {};
          if(dataFilter.length == 0){
            dataDay = {
              cow : cow.name,
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
            }
          }else{
            const dataDay = {
              cow : cow.name,
              milks : [{
                date :  milkAfternoon[0].date,
                morningQty : 0,
                afternoonQty : afternoonDetail.qty
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
          sumDays[day] = {sumMorning : milk.morningQty,sumAfternoon : milk.afternoonQty ,count:1};
        }else{
          sumDays[day].sumMorning += milk.morningQty
          sumDays[day].sumAfternoon += milk.afternoonQty
          sumDays[day].count++;
        }
      }
    }

    let monthStr = moment().month(month-1).format("MMMM");

    const sheet = workbook.addWorksheet(monthStr);
    sheet.state = 'visible';
    const dayColumns = Object.keys(milkGroupDates).length * 3;

    //Header
    mergeCell(sheet,1,1,1,dayColumns + 11,'แบบบันทึกผลผลิต(น้ำนมดิบ) ประจำวัน เดือน' + monthStr + ' ' + year);
    valueCell(sheet,2,1,'ลำดับที่')
    valueCell(sheet,2,2,'โค')
    mergeCell(sheet,2,3,2,dayColumns + 2,'วันที่');
    mergeCell(sheet,2,dayColumns + 3,3,dayColumns + 4,'สรุป');
    mergeCell(sheet,2,dayColumns + 5,3,dayColumns + 6,'รายได้');
    mergeCell(sheet,2,dayColumns + 7,3,dayColumns + 8,'ค่าอาหาร');
    mergeCell(sheet,2,dayColumns + 9,3,dayColumns + 11,'สถานภาพของโค');

    //Sub Header
    const dateKeys = Object.keys(milkGroupDates)
    for (let i = 1; i <= Object.keys(milkGroupDates).length; i++) {
      mergeCell(sheet,3,i * 3,3,(i * 3) + 2,moment(new Date(dateKeys[i-1])).format('DD'));

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
    valueCell(sheet,4,dayColumns + 9,'ส่วนต่าง')
    valueCell(sheet,4,dayColumns + 10,'คิดเป็น %')
    valueCell(sheet,4,dayColumns + 11,'สถานภาพ')

    //Data
    let rowNumDataStart = 5;
    for (const milkFilter of milkFilters) {
      const data = milkFilter;

      valueCell(sheet,rowNumDataStart,2,data.cow)

      let total = 0;

      for (let j = 0; j < data.milks.length; j++) {

        const milk = data.milks[j];

        const day = moment(milk.date).format('D');

        const morning = milk.morningQty;
        const afternoon = milk.afternoonQty;
        const sum = morning + afternoon;
        total += sum

        valueCell(sheet,rowNumDataStart,day*3,morning)
        valueCell(sheet,rowNumDataStart,day*3+1,afternoon)
        valueCell(sheet,rowNumDataStart,day*3+2,sum)
        
      }
      valueCell(sheet,rowNumDataStart,dayColumns+3,total)
      valueCell(sheet,rowNumDataStart,dayColumns+4,total/data.milks.length)

      rowNumDataStart++;
    }

    rowNumDataStart++;
    //Summary day
    valueCell(sheet,rowNumDataStart,2,'รวม')
    valueCell(sheet,rowNumDataStart+1,2,'ค่าเฉลี่ย')
    let sumTotal = 0;
    for(let sumDay of Object.keys(sumDays)){
      const sum = sumDays[sumDay];
      valueCell(sheet,rowNumDataStart,Number(sumDay)*3,sum.sumMorning)
      valueCell(sheet,rowNumDataStart,Number(sumDay)*3+1,sum.sumAfternoon)
      valueCell(sheet,rowNumDataStart,Number(sumDay)*3+2,sum.sumMorning + sum.sumAfternoon)
      valueCell(sheet,rowNumDataStart+1,Number(sumDay)*3+2,(sum.sumMorning + sum.sumAfternoon)/sum.count)
      sumTotal += sum.sumMorning + sum.sumAfternoon;
    }
    valueCell(sheet,rowNumDataStart,dayColumns+3,sumTotal)
    valueCell(sheet,rowNumDataStart,dayColumns+4,sumTotal/Object.keys(sumDays).length)
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
