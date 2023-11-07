// const mongoose = require("mongoose")

// const User = mongoose.model(
//     'users',
//     new mongoose.Schema({
//         username:{
//             type:String,
//             required:true,
//             unique:true
//         },
//         password:{
//             type:String,
//             required:true,
//             select: false
//         },
//         farm:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "farm"
//         },
//     }, { timestamps: true })
// )

// module.exports = User

const { DataTypes } = require('sequelize')
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        _id : {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        username:{
            type: Sequelize.STRING,
        },
        password:{
            type:Sequelize.STRING,
        },
        farmId:{
            type: DataTypes.UUID,
        },
    })
    return User;
}
