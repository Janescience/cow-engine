const db = require("../models");
const Cow = db.cow;
const Protection = db.protection;
const Vaccine = db.vaccine;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const protections = await Protection.find(filter).populate('vaccine').exec();
    console.log('Protections : ',protections)
    res.json({protections});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const cow = await Protection.findById(id).exec();
    res.status(200).send({cow});
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farm = req.farmId

    const newProtection = new Protection(data);
    await newProtection.save();

    const vaccine = await Vaccine.findOne({_id:data.vaccine._id}).populate('protections').exec();
    const protections = vaccine.protections;
    protections.push(newProtection);
    await Vaccine.updateOne({_id:data.vaccine._id},{protections:protections}).exec();
    
    res.status(200).send({newProtection});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedProtection = await Protection.updateOne({_id:id},data).exec();
    console.log("Protection updated : ",updatedProtection)

    res.status(200).send({updatedProtection});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedProtection = await Protection.deleteOne({_id:id});
    console.log("Protection deleted : ",deletedProtection)

    res.status(200).send({deletedProtection});
};
