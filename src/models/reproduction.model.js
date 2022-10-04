const mongoose = require("mongoose")

const Reproduction = mongoose.model(
    'reproduction',
    new mongoose.Schema({
        seq:{
            type:Number,
            required:true
        },
        dad:{
            type:String,
            required:false
        },
        loginDate:{
            type:Date,
            required:true
        },
        estrusDate:{
            type:Date,
            required:false
        },
        matingDate:{
            type:Date,
            required:false
        },
        checkDate:{
            type:Date,
            required:false
        },
        result:{
            type:Number,
            required:false
        },
        status:{
            type:Number,
            required:true
        },
        howTo:{
            type:String,
            required:false
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

module.exports = Reproduction
