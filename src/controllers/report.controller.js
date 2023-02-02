const db = require("../models");
const Excel = require('exceljs');
const path = require('path');
const Cow = db.cow;

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
