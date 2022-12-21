const db = require("../models");
const Food = db.food;

exports.getAll = async (req, res) => {
    const filter = req.query
    const foods = await Food.find(filter).exec();
    res.json({foods});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const food = await Food.findById(id).exec();
    res.status(200).send({food});
};

exports.create = async (req, res) => {
    const data = req.body;

    const newFood = new Food(data);
    await newFood.save((err, food) => {
        if (err) {
        res.status(500).send({ message: err });
        return;
        }
    })
    
    res.status(200);
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedFood = await Food.updateOne({_id:id},data).exec();
    res.status(200).send({updatedFood});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedFood = await Food.deleteOne({_id:id});
    res.status(200).send({deletedFood});
};