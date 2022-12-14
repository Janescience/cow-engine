const db = require("../models");
const Cow = db.cow;
const Protection = db.protection;

exports.getAll = async (req, res) => {
    const filter = req.query
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

    const newProtection = new Protection(data);
    await newProtection.save((err, protection) => {
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
    const updatedProtection = await Protection.updateOne({_id:id},data).exec();
    res.status(200).send({updatedProtection});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedProtection = await Protection.deleteOne({_id:id});
    res.status(200).send({deletedProtection});
};