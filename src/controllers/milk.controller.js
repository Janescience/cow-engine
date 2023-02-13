const db = require("../models");
const Milk = db.milk;
const MilkDetail = db.milkDetail;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId

    const milks = await Milk.find(filter).sort({date:-1}).exec();
    let result = [];
    for(let milk of milks){
        let milkDetails = await MilkDetail.find({milk:milk._id,...filter}).exec();
        if(milkDetails.length > 0){
            for(let milkDetail of milkDetails){
                let cow = await Cow.findOne({_id:milkDetail.cow,flag:'Y'})
                if(cow){
                    milkDetail.relate = { cow : {code : cow.code , name : cow.name , _id : cow._id }}   
                }
            }
            milk.milkDetails = milkDetails
            result.push(milk)
        }
        
    }

    res.status(200).send({milks:result});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const milk = await Milk.findById(id).exec();
    milk.milkDetails = await MilkDetail.find({milk:id}).exec();
    res.status(200).send({milk});
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farm = req.farmId

    const newMilk = new Milk(data);
    await newMilk.save();

    console.log("Milk saved : ",newMilk)

    for(let detail of data.milkDetails){
        detail.milk = newMilk._id
    }

    MilkDetail.create(data.milkDetails)
    console.log("MilkDetails saved : ",MilkDetail)

    res.status(200).send({newMilk});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    await MilkDetail.deleteMany({milk:id});

    for(let detail of data.milkDetails){
        detail.milk = id
    }
    MilkDetail.create(data.milkDetails)

    res.status(200).send({message:'Milk detail updated success.'});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    
    const deletedMilkDetail = await MilkDetail.deleteMany({milk:id});
    console.log("MilkDetail deleted : ",deletedMilkDetail)

    const deletedMilk = await Milk.deleteOne({_id:id});
    console.log("Milk deleted : ",deletedMilk)

    res.status(200).send({deletedMilk});
};