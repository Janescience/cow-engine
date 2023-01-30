const db = require("../models");
const Milking = db.milking;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    const milks = await Milking.find(filter).sort({date:-1}).exec();
    let milkings = []
    for(let milk of milks){
        let cow = await Cow.findOne({_id:milk.cow,flag:'Y'})
        if(cow){
            milk.relate = { cow : {code : cow.code , name : cow.name }}   
            milkings.push(milk)
        }
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