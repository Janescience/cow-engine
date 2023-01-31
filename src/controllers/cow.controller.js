const db = require("../models");
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const cows = await Cow.find(filter).exec();
    res.json({cows});
};

exports.getAllDDL = async (req, res) => {
    const ObjectID = require('mongodb').ObjectId;
    const filter = req.query
    const farmId = req.farmId
    const cows = await Cow.aggregate([
        {
          $project: {
            "code": 1,
            "name": 1,
            "_id": 1,
            "farm" : 1
          }
        },
        {
          $match: { 'farm' : ObjectID(farmId) }
        }
    ])
    res.json({cows});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const cow = await Cow.findById(id).exec();;
    res.status(200).send({cow});
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farm = req.farmId;
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