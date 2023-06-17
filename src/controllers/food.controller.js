const db = require("../models");
const Food = db.food;
const Recipe = db.recipe;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const foods = await Food.find(filter).sort({corral:1}).exec();
    for(let food of foods){
        food.recipe = await Recipe.findOne({_id:food.recipe});
    }
    console.log('Foods : ',foods);
    res.json({foods});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const food = await Food.findById(id).exec();
    res.status(200).send({food});
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farm = req.farmId

    const numCow = await Cow.find({corral:data.corral,farm:data.farm}).countDocuments();
    data.numCow = numCow;
    data.amountAvg = data.amount/numCow;
    data.recipe = data.recipe._id

    const newFood = new Food(data);
    await newFood.save((err, food) => {
        if (err) {
            console.error("Food save error : ",err)
            res.status(500).send({ message: err });
            return;
        }
    })
    
    console.log("Food saved : ",newFood);

    res.status(200).send(newFood);
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    data.farm = req.farmId

    const numCow = await Cow.find({corral:data.corral,farm:data.farm}).countDocuments();
    data.numCow = numCow;
    data.amountAvg = data.amount/numCow;
    data.recipe = data.recipe._id

    const updatedFood = await Food.updateOne({_id:id},data).exec();
    console.log("Food updated : ",updatedFood);

    res.status(200).send({updatedFood});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedFood = await Food.deleteOne({_id:id});
    console.log("Food deleted : ",deletedFood);

    res.status(200).send({deletedFood});
};

exports.deletes = async (req, res) => {
    const datas = req.body;
    await Food.deleteMany({_id:{$in:datas}});
    res.status(200).send('Delete selected successfully.');
};
