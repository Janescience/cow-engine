const mongoose = require("mongoose")

const Transaction = mongoose.model(
    'transaction',
    new mongoose.Schema({
        type:{
            type:String,
            required:true
        },
        category:{
            type:String,
            required:true
        },
        amount:{
            type:Number,
            required:true
        },
        desc:String,
        transactionDate : {
            type:Date,
            required:true
        },
        createdDate:{
            type : Date,
            default : new Date()
        },
        user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }
    })
)

module.exports = Transaction