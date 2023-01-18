const mongoose = require("mongoose")

const Food = mongoose.model(
    'food',
    new mongoose.Schema({
        corral:{
            type:String,
            required:true
        },
        qty:{
            type:Number,
            required:true
        },
        amount:{
            type:Number,
            required:true
        },
        amountAvg:{
            type:Number,
            required:true
        },// รวมเป็นเงิน/ตัว
        recipe:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "recipe",
            required:true,
        },
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm",
            required:true,
        },
    }, { timestamps: true })
)

module.exports = Food
