module.exports = (sequelize, Sequelize) => {
    const Bill = sequelize.define("bill", {
        remark : Sequelize.STRING,
        code : {
            type:Sequelize.STRING,
            comment:'WATER,ELECTRIC,ACCOM,RENT,INTERNET,WASTE,OTH'
        },
        name : {
            type:Sequelize.STRING,
            comment:'ค่าน้ำ,ค่าไฟ,ค่าที่พักคนงาน,ค่าเช่า,ค่าอินเทอร์เน็ต,ค่าของเสีย,อื่นๆ'
        },
        date : Sequelize.DATE,
        amount : Sequelize.DOUBLE,
    });
    return Bill;
};

