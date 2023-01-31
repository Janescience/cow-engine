const db = require("../models");
const Heal = db.heal;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const heals = await Heal.find(filter).sort({'seq':-1}).exec();

    for(let heal of heals){
        let cow = await Cow.findOne({_id:heal.cow})
        heal.cow = cow    
    }

    res.json({heals});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const heal = await Heal.findById(id).exec();;
    res.status(200).send({heal});
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farm = req.farmId
    const count = await Heal.find({cow:data.cow,farm:data.farm}).countDocuments();
    data.seq = (count+1)

    const newHeal = new Heal(data);
    await newHeal.save((err, heal) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
    })
    res.status(200).send({newHeal});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedHeal = await Heal.updateOne({_id:id},data).exec();
    res.status(200).send({updatedHeal});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedHeal = await Heal.deleteOne({_id:id});
    res.status(200).send({deletedHeal});
};