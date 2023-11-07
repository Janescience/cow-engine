// const mongoose = require("mongoose")

// const Farm = mongoose.model(
//     'farm',
//     new mongoose.Schema({
//         code:{
//             type:String,
//             required:true,
//             unique:true,
//         },
//         name:{
//             type:String,
//             required:true
//         },
//         lineToken:{
//             type:String,
//             required:false
//         }
//     }, { timestamps: true })
// )

// module.exports = Farm
const { DataTypes } = require('sequelize')

module.exports = (sequelize, Sequelize) => {
    const Farm = sequelize.define("farm", {
        _id : {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        code: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        lineToken: {
            type: Sequelize.STRING
        }
    });
  
    return Farm;
  };
