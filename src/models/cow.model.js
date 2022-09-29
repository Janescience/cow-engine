const mongoose = require("mongoose")

const Cow = mongoose.model(
    'cow',
    new mongoose.Schema({
        image:{
            type:String,
            required:false
        },
        code:{
            type:String,
            required:true
        },
        name:{
            type:String,
            required:true
        },
        birthDate:{
            type:Date,
            required:true
        },
        corral:{
            type:String,
            required:false
        },
        status:{
            type:Number,
            required:true
        },
        flag:{
            type:String,
            required:true,
            default : "Y"
        },
        dad:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "breederDad"
        },
        mom:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "cow"
        },
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm",
            required:true,
        },
    })
)

module.exports = Cow
