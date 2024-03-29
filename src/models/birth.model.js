// const mongoose = require("mongoose")

// const Birth = mongoose.model(
//     'birth',
//     new mongoose.Schema({
//         seq:{
//             type:Number,
//             required:true
//         },
//         pregnantDate:{
//             type:Date,
//             required:true
//         },
//         sex:{
//             type:String,
//             required:false
//         },
//         status:{//B:Born, P:Pregnant
//             type:String,
//             required:true
//         },
//         birthDate:{
//             type:Date,
//             required:false
//         },
//         overgrown:{
//             type:String,
//             required:false
//         },
//         drugDate:{
//             type:Date,
//             required:false
//         },
//         washDate:{
//             type:Date,
//             required:false
//         },
//         reproduction : {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "reproduction",
//             required:true,
//         },
//         cow:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "cow",
//             required:true,
//         },
//         calf:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "cow",
//             required:false,
//         },
//         farm:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "farm",
//             required:true,
//         },
//     }, { timestamps: true })
// )

// module.exports = Birth

module.exports = (sequelize, Sequelize) => {
    
    const Birth = sequelize.define("birth", {
        seq : Sequelize.INTEGER,
        pregnantDate : {
            type: Sequelize.DATE,
            comment: 'วันที่ตั้งท้อง'
        },
        sex : Sequelize.STRING,
        status : { 
            type : Sequelize.STRING, 
            comment : 'B = คลอด, P = ตั้งท้อง'
        },
        birthDate : Sequelize.DATE,
        overgrown : {
            type: Sequelize.STRING,
            comment : 'Y = รกค้าง, N = รกไม่ค้าง' 
        },
        drugDate : { 
            type : Sequelize.DATE, 
            comment : 'วันที่ให้ยาขับรก'
        },
        washDate : { 
            type : Sequelize.DATE, 
            comment : 'วันที่ล้างท้อง'
        }
    });

    return Birth;
};


