const mongoose = require("mongoose")

const Milking = mongoose.model(
    'milking',
    new mongoose.Schema({
        morningQty:{
            type:Number,
            required:true
        },
        afternoonQty:{
            type:Number,
            required:true
        },
        date:{
            type:Date,
            required:true
        },
        amount:{
            type:Number,
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

module.exports = Milking
