const db = require("../models");
const Reproduct = db.reproduction;
const Birth = db.birth;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    const reproducts = await Reproduct.find(filter).sort({"status":1,"checkDate":1,'seq':-1}).exec();

    for(let reproduct of reproducts){
        let cow = await Cow.findOne({_id:reproduct.cow})
        reproduct.cow = cow    
    }

    res.status(200).send({reproducts});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const Reproduct = await Reproduct.findById(id).exec();
    res.status(200).send({Reproduct});
};

exports.create = async (req, res) => {
    const data = req.body;

    const count = await Reproduct.find({cow:data.cow,farm:data.farm}).countDocuments();
    data.seq = (count+1)

    if(data.result == "1"){//ผิดปกติ
        data.estrusDate = null
        data.matingDate = null
        data.checkDate = null
    }
    
    const newReproduct = new Reproduct(data);
    await newReproduct.save((err, cow) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
    })
    res.status(200).send({newReproduct});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    if(data.status == "2"){//ตั้งครร
        const count = await Birth.find({cow:data.cow,farm:data.farm}).countDocuments();
        const newBirth = new Birth({
            seq:(count+1),
            pregnantDate:data.estrusDate,
            cow:data.cow,
            farm:data.farm,
            reproduction:id
        });
        await newBirth.save((err, birth) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
        })
    }

    if(data.result == "1"){//ผิดปกติ
        data.estrusDate = null
        data.matingDate = null
        data.checkDate = null
    }

    const updatedReproduct = await Reproduct.updateOne({_id:id},data).exec();

    res.status(200).send({updatedReproduct});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedReproduct = await Reproduct.deleteOne({_id:id});
    res.status(200).send({deletedReproduct});
};