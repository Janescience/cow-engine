const db = require("../models");
const Birth = db.birth;
const Cow = db.cow;
const Reproduct = db.reproduction;

exports.getAll = async (req, res) => {
    const filter = req.query
    const births = await Birth.find(filter).sort({createdAt:-1}).exec();

    for(let birth of births){
        let cow = await Cow.findOne({_id:birth.cow})
        let reproduct = await Reproduct.findOne({_id:birth.reproduction})
        birth.cow = cow    
        birth.reproduction = reproduct    
    }

    res.status(200).send({births});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const Birth = await Birth.findById(id).exec();
    res.status(200).send({Birth});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedBirth = await Birth.updateOne({_id:id},data).exec();
    res.status(200).send({updatedBirth});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const birth = await Birth.findOne({_id:id});
    await Reproduct.updateOne({_id:birth.reproduction},{"status":"1"}).exec();
    const deletedBirth = await Birth.deleteOne({_id:id});
    res.status(200).send({deletedBirth});
};