const mongoose = require("mongoose")

const Protection = mongoose.model(
    'protection',
    new mongoose.Schema({
        date:{
            type:Date,
            required:true
        },
        remark:{
            type: String,
        },
        amount:{
            type: Number,
        },
        qty:{
            type: Number,
        },
        vaccine:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "vaccine",
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
