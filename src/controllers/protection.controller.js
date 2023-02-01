const db = require("../models");
const Cow = db.cow;
const Protection = db.protection;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    if(filter.vaccine && filter.vaccine != ''){
        let vaccine = filter.vaccine
        filter.vaccine = {'$regex' :  vaccine , '$options' : 'i'}
    }
    const protections = await Protection.find(filter).exec();
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
    await newProtection.save((err, protection) => {
        if (err) {
            console.error("Protection save error : ",err)
            res.status(500).send({ message: err });
            return;
        }

        console.log("Protection saved : ",protection)
    })
    
    res.status(200);
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