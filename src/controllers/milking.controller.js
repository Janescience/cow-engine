const db = require("../models");
const Milking = db.milking;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    const milkings = await Milking.find(filter).exec();

    for(let milk of milkings){
        let cow = await Cow.findOne({_id:milk.cow})
        milk.cow = cow    
    }

    res.status(200).send({milkings});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const milking = await Milking.findById(id).exec();
    res.status(200).send({milking});
};

exports.create = async (req, res) => {
    const data = req.body;
    const newMilking = new Milking(data);
    await newMilking.save((err, cow) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
    })
    res.status(200).send({newMilking});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedMilking = await Milking.updateOne({_id:id},data).exec();
    res.status(200).send({updatedMilking});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedMilking = await Milking.deleteOne({_id:id});
    res.status(200).send({deletedMilking});
};