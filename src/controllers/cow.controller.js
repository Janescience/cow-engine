const db = require("../models");
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    const cows = await Cow.find(filter).exec();
    res.json({cows});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const cow = await Cow.findById(id).exec();;
    res.status(200).send({cow});
};

exports.create = async (req, res) => {
    const data = req.body;
    const newCow = new Cow(data);
    await newCow.save((err, cow) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
    })
    res.status(200).send({newCow});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedCow = await Cow.updateOne({_id:id},data).exec();
    res.status(200).send({updatedCow});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedCow = await Cow.deleteOne({_id:id});
    res.status(200).send({deletedCow});
};