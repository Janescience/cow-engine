const db = require("../models");
const RecipeDetail = db.recipeDetail;
const Recipe = db.recipe;

exports.getAll = async (req, res) => {
    const filter = req.query
    const recipes = await Recipe.find(filter).exec();
    res.json({recipes});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const recipe = await Recipe.findById(id).exec();
    res.status(200).send({recipe});
};

exports.create = async (req, res) => {
    const data = req.body;

    const newRecipe = new Recipe(data.recipe);
    await newRecipe.save((err, recipe) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        for(let detail of data.recipeDetail){
            detail.recipe = recipe._id
        }

        RecipeDetail.create(data.recipeDetail)
    })
    
    res.status(200);
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedRecipe = await Recipe.updateOne({_id:id},data).exec();
    res.status(200).send({updatedRecipe});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedRecipe = await Recipe.deleteOne({_id:id});
    res.status(200).send({deletedRecipe});
};