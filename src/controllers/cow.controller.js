const db = require("../models");
const Cow = db.cow;
const Birth = db.birth;
const Food = db.food;
const Heal = db.heal;
const MilkDetail = db.milkDetail;
const Milk = db.milk;
const Protection = db.protection;
const Reproduction = db.reproduction;

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

exports.getDetails = async (req, res) => {
  const id = req.params.id
  const farmId =  req.farmId
  const cow = await Cow.findById(id).exec();;
  // const births = await Birth.find({cow:id}).exec();
  const births = []
  // const heals = await Heal.find({cow:id}).exec();
  const heals = []
  // const foods = await Food.find({cow:id}).exec();
  const foods = []
  const milks = await Milk.find({farm :farmId}).populate({path:'milkDetails',match:{cow:id}}).exec();
  // const protections = await Protection.find({cow:id}).exec();
  const protections = []
  // const reproductions = await Reproduction.find({cow:id}).exec();
  const reproductions = []

  res.status(200).send({
    cow,
    births,
    heals,
    foods,
    milks,
    protections,
    reproductions
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