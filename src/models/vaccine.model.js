const mongoose = require("mongoose")

const Vaccine = mongoose.model(
    'vaccine',
    new mongoose.Schema({
        frequency:{
            type:Number,
            required:true
        },
        code:{
            type: String,
            required:true,
        },
        name:{
            type: String,
            required:true,
        },
        remark:{
            type: String,
            required:false,
        },
        price:{
            type: Number,
            required:true,
        },
        use:{
            type: Number,
            required:true,
        },
        amount:{
            type: Number,
            required:true,
        },
        nextDate:{
            type: Date,
        },
        currentDate:{
            type: Date,
        },
        protections:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "protection",
        }],
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm",
            required:true,
        },
    }, { timestamps: true })
)

module.exports = Vaccine
