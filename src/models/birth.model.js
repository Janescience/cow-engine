const mongoose = require("mongoose")

const Birth = mongoose.model(
    'birth',
    new mongoose.Schema({
        sex:{
            type:String,
            required:false
        },
        date:{
            type:Date,
            required:false
        },
        overgrown:{
            type:String,
            required:false
        },
        drugDate:{
            type:Date,
            required:false
        },
        washDate:{
            type:Date,
            required:false
        },
        reproduction : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reproduction",
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

module.exports = Birth
