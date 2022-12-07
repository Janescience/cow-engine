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
        vaccine:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "vaccine",
            required:true,
        },
        cow:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "cow",
            required:true,
        },
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm",
            required:true,
        },
    }, { timestamps: true })
)

module.exports = Protection
