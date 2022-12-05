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
        if(birth.calf){
            let calf = await Cow.findOne({_id:birth.calf})
            birth.calf = calf 
        }    
    }

    res.status(200).send({births});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const Birth = await Birth.findById(id).exec();
    res.status(200).send({Birth});
};

exports.create = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedBirth = await Birth.updateOne({_id:id},data).exec();
    if(data.sex === 'F'){ // เพศเมียจะสร้างวัวให้เลย
        const newCow = new Cow({
            code : 'C' + (parseInt(data.newCow.mom?.substring(1,4)) + 1),
            name : data.newCow.name,
            birthDate : new Date().setHours(0,0,0,0),
            status : 4,
            mom : data.newCow.mom,
            farm : data.newCow.farm
        });
        await newCow.save((err, cow) => {
            if(cow){
                Birth.updateOne({_id:id},{calf:cow._id}).exec();
            }
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
        })
    }
    res.status(200).send({updatedBirth});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    if(data.sex === 'M'){ // ถ้าแก้ไขเป็นเพศผู้ จะต้องลบวัวทึ่เคยสร้างตอนเลือกเป็นเพศเมีย
        const birth = await Birth.findById(id).exec();
        if(birth.calf){
            await Cow.deleteOne({_id:birth.calf});
        }
        data.birthDate = null
        data.sex = null
        data.overgrown = null
    }
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