const db = require("../models");
const moment = require("moment");

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
    await Vaccine.updateOne({_id:data.vaccine._id},{
        protections:protections,
        currentDate:data.date,
        nextDate:moment(data.date).add(vaccine.frequency,'months')
    }).exec();
    
    res.status(200).send({newProtection});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedProtection = await Protection.updateOne({_id:id},data).exec();
    const protections = await Protection.find({vaccine:data.vaccine._id}).populate('vaccine').sort({date:-1}).exec();
    if(protections.length > 0){
        await Vaccine.updateOne({_id:data.vaccine._id},{
            currentDate:protections[0].date,
            nextDate:moment(protections[0].date).add(protections[0].vaccine.frequency,'months')})
    }
    console.log("Protection updated : ",updatedProtection)
    res.status(200).send({updatedProtection});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const protection = await Protection.findById(id).populate('vaccine').exec();
    const vaccine = protection.vaccine;

    const deletedProtection = await Protection.deleteOne({_id:id}).exec();;
    console.log("Protection deleted : ",deletedProtection)

    const protections = await Protection.find({vaccine:vaccine._id}).populate('vaccine').sort({date:-1}).exec();

    await Vaccine.updateOne({_id:vaccine._id},{
        protections:protections,
        currentDate:protections[0].date,
        nextDate:moment(protections[0].date).add(protections[0].vaccine.frequency,'months')
    }).exec();

    res.status(200).send({deletedProtection});
};
