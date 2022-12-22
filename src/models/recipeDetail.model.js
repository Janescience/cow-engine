const mongoose = require("mongoose")

const RecipeDetail = mongoose.model(
    'recipeDetail',
    new mongoose.Schema({
        food:{
            type: String,
            required:true,
        },
        cost:{
            type:Number,
            required:true
        },
        qty:{
            type: Number,
            required:true,
        },
        amount:{
            type: Number,
            required:true,
        },
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

module.exports = RecipeDetail
