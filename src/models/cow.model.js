// const mongoose = require("mongoose")

// const Cow = mongoose.model(
//     'cow',
//     new mongoose.Schema({
//         _id:{
//             type: DataTypes.UUID,
//             defaultValue: DataTypes.UUIDV1,
//             primaryKey: true
//         },
//         image:{
//             type:String,
//             required:false
//         },
//         code:{
//             type:String,
//             required:true
//         },
//         name:{
//             type:String,
//             required:true
//         },
//         birthDate:{
//             type:Date,
//             required:true
//         },
//         adopDate:{//วันที่นำเข้าฟาร์ม
//             type:Date,
//             required:true
//         },
//         corral:{
//             type:String,
//             required:false
//         },
//         weight:{
//             type:Number
//         },
//         status:{//1:ท้อง,2:นมแห้ง,3:ให้ผลผลืต,4:วัวเด็ก
//             type:Number,
//             required:true
//         },
//         quality:{
//             type:Number,
//             required:true
//         },
//         flag:{
//             type:String,
//             required:true,
//             default : "Y"
//         },
//         dad:{
//             type:String,
//             required:false
//         },
//         mom:{
//             type:String,
//             required:false
//         },
//         remark : {
//             type : String
//         },
//         farm:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "farm",
//             required:true,
//         },
//     }, { timestamps: true } , { strict: false })
// )

// module.exports = Cow
const { DataTypes } = require('sequelize')
module.exports = (sequelize, Sequelize) => {
    const Cow = sequelize.define("cow", {
        _id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        image: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        birthDate: {
            type: Sequelize.DATE
        },
        adopDate: {
            type: Sequelize.DATE
        },
        corral: {
            type: Sequelize.STRING
        },
        weight: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.INTEGER
        },
        quality: {
            type: Sequelize.INTEGER
        },
        flag: {
            type: Sequelize.STRING,
            default : 'Y'
        },
        dad: {
            type: Sequelize.STRING,
        },
        mom: {
            type: Sequelize.STRING,
        },
        remark: {
            type: Sequelize.STRING,
        },
        farmId: {
            type: DataTypes.UUID,
        }
    });
  
    return Cow;
  };
