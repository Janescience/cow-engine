const mongoose = require("mongoose")

const Notification = mongoose.model(
    'notification',
    new mongoose.Schema({
        status:{ // W : Wait , S : Success
            type:String,
            required:true
        },
        dataId:{ 
            type:String,
            required:true
        },
        notificationParam:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "notificationParam",
            required:true,
        },
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm",
            required:true,
        },
    }, { timestamps: true })
)

module.exports = Notification
