const db = require("../models");
const Cow = db.cow;
const Protection = db.protection;

exports.getAll = async (req, res) => {
    const filter = req.query
    const protections = await Protection.find(filter).exec();

    for(let protection of protections){
        let cow = await Cow.findOne({_id:protection.cow})
        protection.cow = cow    
    }

    res.json({protections});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const cow = await Protection.findById(id).exec();
    res.status(200).send({cow});
};

exports.create = async (req, res) => {
    const data = req.body;

    for(let cow of data.cows){
        data.cow = cow
        const newCow = new Protection(data);
        await newCow.save((err, cow) => {
            if (err) {
            res.status(500).send({ message: err });
            return;
            }
        })
    }
    
    res.status(200);
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedCow = await Protection.updateOne({_id:id},data).exec();
    res.status(200).send({updatedCow});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedCow = await Protection.deleteOne({_id:id});
    res.status(200).send({deletedCow});
};