const mongoose = require("mongoose")

const User = mongoose.model(
    'users',
    new mongoose.Schema({
        username:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
        },
        farm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "farm"
        },
    })
)

module.exports = User
