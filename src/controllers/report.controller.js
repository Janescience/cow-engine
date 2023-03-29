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
  }).populate('milkDetails').exec();

  const milkGroupDate = _.groupBy(milks,'date');
  let milkFilters = [];

  for(let date of Object.keys(milkGroupDate)){
    const milkAllTimeInDay = milkGroupDate[date];// Get all time M,A in day

    const milkMorning = milkAllTimeInDay.filter(m => m.time === 'M'); // Get all cows in morning time
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

    const milkAfternoon = milkAllTimeInDay.filter(m => m.time === 'A'); // Get all cows in morning time
    for(let afternoonDetail of milkAfternoon[0].milkDetails){
      const cow = await Cow.findById(afternoonDetail.cow).exec();
      let cowFilter =  milkFilters.filter(mf => mf.cow == cow.name);

      let dateFilter = cowFilter[0].milks.filter(m => moment(m.date).isSame(moment(milkAfternoon[0].date)));
      if(dateFilter.length > 0){
        dateFilter[0].afternoonQty = afternoonDetail.qty;
      }
    }
  }

  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('น้ำนมดิบ');

  const columns = [{ header: 'โค', key: 'cow' }];
  const row = { cow : ''};
  for (let i = 1; i <= Object.keys(milkGroupDate).length; i++) {
    columns.push(
      { header: moment(year+'-'+month+'-'+i,'YYYY-MM-DD').format('dddd/DD'), key: 'day_' + i },
      { header: '', key: 'empty1_' + i },
      { header: '', key: 'empty2_' + i }
    );

    // sheet.mergeCells(`${String.fromCharCode(63 + (i*3))}1:${String.fromCharCode(65 + (i*3))}1`);
    // sheet.getCell(`${String.fromCharCode(63 + (i*3))}1`).alignment = { horizontal: 'center' };
    // sheet.getCell(`${String.fromCharCode(63 + (i*3))}1`).value = i;

    row['day_' + (i)] = 'เช้า';
    row['empty1_' + (i)] = 'บ่าย';
    row['empty2_' + (i)] = 'รวม';
  }
  columns.push(
    { header: 'รวม', key: 'summaryTotal'  },
    { header: 'เฉลี่ย', key: 'summaryAvg' },
    { header: 'ราคา/กก.', key: 'incomePrice'  },
    { header: 'เป็นเงิน', key: 'incomeTotal' }
  );
  sheet.columns = columns;
  sheet.addRow(row)

  for (let i = 0; i < milkFilters.length; i++) {
    const data = milkFilters[i];

    const row = {
      cow: data.cow
    };
  
    let total = 0;
    for (let j = 0; j < data.milks.length; j++) {

      const milk = data.milks[j];
      const morning = milk.morningQty;
      const afternoon = milk.afternoonQty;
      const sum = morning + afternoon;
      total += sum
      row['day_' + (j+1)] = morning;
      row['empty1_' + (j+1)] = afternoon;
      row['empty2_' + (j+1)] = sum;

      row['summaryTotal'] = total;
      row['summaryAvg'] = total/data.milks.length;
    }
  
    sheet.addRow(row);
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=raw-milks.xlsx");

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });

  // const workbook = new Excel.Workbook();
  // const sheet = workbook.addWorksheet('โค');
  // // add data to sheet 1
  // sheet.columns = [
  //   { header: 'รหัส', key: 'code', width: 20 },
  //   { header: 'ชื่อ', key: 'name', width: 10 },
  //   { header: 'วันเกิด', key: 'birthDate', width: 20  ,style: { numFmt: 'dd/mm/yyyy' } },
  //   { header: 'คอก', key: 'corral', width: 20 },
  //   { header: 'สถานะ', key: 'status', width: 20 },
  //   { header: 'พ่อพันธู์', key: 'dad', width: 20 },
  //   { header: 'แม่พันธุ์', key: 'mom', width: 20 },
  // ];

  // sheet.addRows(cows);

  // var fileName = 'cows.xlsx';

  // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  // res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

  // return workbook.xlsx.write(res).then(function () {
  //   res.status(200).end();
  // });
};
