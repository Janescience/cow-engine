const mongoose = require("mongoose")

const Protection = mongoose.model(
    'protection',
    new mongoose.Schema({
        dateCurrent:{
            type:Date,
            required:true
        },
        dateNext:{
            type:Date,
            required:true
        },
        frequency:{
            type:Number,
            required:true
        },
        vaccine:{
            type: String,
            required:true,
        },
        remark:{
            type: String,
            required:false,
        },
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm",
            required:true,
        },
    }, { timestamps: true })
)

module.exports = Protection
