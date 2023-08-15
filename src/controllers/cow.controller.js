const db = require("../models");
const Cow = db.cow;
const Birth = db.birth;
const Food = db.food;
const Heal = db.heal;
const MilkDetail = db.milkDetail;
const Milk = db.milk;
const Protection = db.protection;
const Reproduction = db.reproduction;

const Promise = require('bluebird');

const { cowService } = require("../services");

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const cows = await Cow.find(filter).select('_id image code name birthDate status corral').sort({corral:1}).exec();
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
    const quality = await cowService.quality(id);
    res.status(200).send({cow,quality});
};

exports.getDetails = async (req, res) => {
  const id = req.params.id
  const quality = await cowService.quality(id);

  const rawmilks = await MilkDetail.find({cow:id}).exec();
  const sumRawmilk = rawmilks.reduce((sum,item) => sum + item.qty,0);
  const sum = {
    rawmilk : sumRawmilk
  }

  res.status(200).send({
    quality,
    sum
  });
  
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farm = req.farmId;
    const newCow = new Cow(data);
    await newCow.save();
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
