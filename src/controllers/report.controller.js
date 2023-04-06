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
  const month = filter.month;

  let start = new Date(year,month - 1,1)
  const startOffset = start.getTimezoneOffset();
  let startDate = new Date(start.getTime() - (startOffset*60*1000))

  const daysInMonth = new Date(year, month, 0).getDate();
  let end = new Date(year, month - 1, daysInMonth);
  const endOffset = end.getTimezoneOffset();
  let endDate = new Date(end.getTime() - (endOffset*60*1000))

  const milks = await Milk.find({   
    date : { $gte : startDate.toISOString().split('T')[0] , $lte : endDate.toISOString().split('T')[0] },
    farm : filter.farm
  }).populate('milkDetails').sort({date:1}).exec();
  console.log(milks.length)
  if(milks.length == 0){
    return res.json(null)
  }

  const milkGroupDates = _.groupBy(milks,'date');
  console.log('milkGroupDates : ',milkGroupDates)
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
  
        let dateFilter = cowFilter[0].milks.filter(m => moment(m.date).isSame(moment(milkAfternoon[0].date)));
        if(dateFilter.length > 0){
          dateFilter[0].afternoonQty = afternoonDetail.qty;
        }
      }
    }
  }

  const workbook = new Excel.Workbook();
  let monthStr = moment().month(month-1).format("MMMM");

  const sheet = workbook.addWorksheet(monthStr);

  // 65 = A
  sheet.mergeCells(`A1:${String.fromCharCode(64 + ((Object.keys(milkGroupDates).length * 3) + 5))}1`);
  sheet.getCell(`A1`).value = 'แบบบันทึกผลผลิต(น้ำนมดิบ) ประจำวัน เดือน' + monthStr + ' ' + year
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.getCell(`A2`).value = 'ลำดับที่';
  sheet.getCell(`B2`).value = 'โค';

  sheet.mergeCells(`C2:${String.fromCharCode(66 + (Object.keys(milkGroupDates).length * 3))}2`);
  sheet.getCell(`C2`).value = 'วันที่';
  sheet.getCell('C2').alignment = { horizontal: 'center' };

  sheet.mergeCells(`${String.fromCharCode(67 + (Object.keys(milkGroupDates).length * 3))}2:${String.fromCharCode(68 + (Object.keys(milkGroupDates).length * 3))}2`);
  sheet.getCell(`${String.fromCharCode(67 + (Object.keys(milkGroupDates).length * 3))}2`).value = 'สรุป';
  sheet.getCell(`${String.fromCharCode(67 + (Object.keys(milkGroupDates).length * 3))}2`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`${String.fromCharCode(69 + (Object.keys(milkGroupDates).length * 3))}2:${String.fromCharCode(70 + (Object.keys(milkGroupDates).length * 3))}2`);
  sheet.getCell(`${String.fromCharCode(69 + (Object.keys(milkGroupDates).length * 3))}2`).value = 'รายได้';
  sheet.getCell(`${String.fromCharCode(69 + (Object.keys(milkGroupDates).length * 3))}2`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`${String.fromCharCode(71 + (Object.keys(milkGroupDates).length * 3))}2:${String.fromCharCode(72 + (Object.keys(milkGroupDates).length * 3))}2`);
  sheet.getCell(`${String.fromCharCode(71 + (Object.keys(milkGroupDates).length * 3))}2`).value = 'ค่าอาหาร';
  sheet.getCell(`${String.fromCharCode(71 + (Object.keys(milkGroupDates).length * 3))}2`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`${String.fromCharCode(73 + (Object.keys(milkGroupDates).length * 3))}2:${String.fromCharCode(75 + (Object.keys(milkGroupDates).length * 3))}2`);
  sheet.getCell(`${String.fromCharCode(73 + (Object.keys(milkGroupDates).length * 3))}2`).value = 'สถานภาพของโค';
  sheet.getCell(`${String.fromCharCode(73 + (Object.keys(milkGroupDates).length * 3))}2`).alignment = { horizontal: 'center' };

  const dateKeys = Object.keys(milkGroupDates)
  for (let i = 1; i <= Object.keys(milkGroupDates).length; i++) {
    
    sheet.mergeCells(`${String.fromCharCode(64 + (i*3))}3:${String.fromCharCode(66 + (i*3))}3`);
    sheet.getCell(`${String.fromCharCode(64 + (i*3))}3`).alignment = { horizontal: 'center' };
    sheet.getCell(`${String.fromCharCode(64 + (i*3))}3`).value = moment(new Date(dateKeys[i-1])).format('DD');

    sheet.getCell(`${String.fromCharCode(64 + (i*3))}4`).value = 'เช้า';
    sheet.getCell(`${String.fromCharCode(65 + (i*3))}4`).value = 'บ่าย';
    sheet.getCell(`${String.fromCharCode(66 + (i*3))}4`).value = 'รวม';
  }

  sheet.getCell(`${String.fromCharCode(67 + (Object.keys(milkGroupDates).length*3))}4`).value = 'รวม';
  sheet.getCell(`${String.fromCharCode(68 + (Object.keys(milkGroupDates).length*3))}4`).value = 'เฉลี่ย';

  sheet.getCell(`${String.fromCharCode(69 + (Object.keys(milkGroupDates).length*3))}4`).value = 'ราคา/กก.';
  sheet.getCell(`${String.fromCharCode(70 + (Object.keys(milkGroupDates).length*3))}4`).value = 'เป็นเงิน';

  sheet.getCell(`${String.fromCharCode(71 + (Object.keys(milkGroupDates).length*3))}4`).value = 'ต่อวัน';
  sheet.getCell(`${String.fromCharCode(72 + (Object.keys(milkGroupDates).length*3))}4`).value = 'เป็นเงิน';

  sheet.getCell(`${String.fromCharCode(73 + (Object.keys(milkGroupDates).length*3))}4`).value = 'ส่วนต่าง';
  sheet.getCell(`${String.fromCharCode(74 + (Object.keys(milkGroupDates).length*3))}4`).value = 'คิดเป็น %';
  sheet.getCell(`${String.fromCharCode(75 + (Object.keys(milkGroupDates).length*3))}4`).value = 'สถานภาพ';

  let rowNumDataStart = 5;
  for (const milkFilter of milkFilters) {
    const data = milkFilter;

    sheet.getCell('B'+rowNumDataStart).value = data.cow;

    let total = 0;
    for (let j = 0; j < data.milks.length; j++) {

      const milk = data.milks[j];
      const morning = milk.morningQty;
      const afternoon = milk.afternoonQty;
      const sum = morning + afternoon;
      total += sum

      sheet.getCell(`${String.fromCharCode(64 + ((j+1)*3))}${rowNumDataStart}`).value = morning;
      sheet.getCell(`${String.fromCharCode(65 + ((j+1)*3))}${rowNumDataStart}`).value = afternoon;
      sheet.getCell(`${String.fromCharCode(66 + ((j+1)*3))}${rowNumDataStart}`).value = sum;

    }

    sheet.getCell(`${String.fromCharCode(67 + (data.milks.length*3))}${rowNumDataStart}`).value = total;
    sheet.getCell(`${String.fromCharCode(68 + (data.milks.length*3))}${rowNumDataStart}`).value = total/data.milks.length;

    rowNumDataStart++;
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=raw-milks.xlsx");

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
};
