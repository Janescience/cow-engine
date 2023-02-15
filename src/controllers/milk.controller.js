const db = require("../models");
const Milk = db.milk;
const MilkDetail = db.milkDetail;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId

    const milks = await Milk.find(filter).populate('milkDetails').sort({date:-1}).exec();
    
    for(let milk of milks){
        for(let milkDetail of milk.milkDetails){
            let cow = await Cow.findOne({_id:milkDetail.cow,flag:'Y'})
            if(cow){
                milkDetail.relate = { cow : {code : cow.code , name : cow.name , _id : cow._id }}   
            }
        }
    }

    res.status(200).send({milks});
};

exports.get = async (req, res) => {
    const filter = req.query
    const milk = await Milk.find(filter).populate('milkDetails').exec();
    res.status(200).send({milk});
};

exports.create = async (req, res) => {
    const data = req.body;
    const farmId = req.farmId

    const milkSave = { time : data.time , date : data.date , farm : farmId };
    const newMilk = new Milk(milkSave);
    
    newMilk.save(async (err,milk) => {
        const detailIds = [];
        for(let detail of data.milkDetails){
            detail.milk = milk._id;
            const newMilkDetail = new MilkDetail(detail);

            const milkDetail = await newMilkDetail.save();
            detailIds.push(milkDetail._id)
        }

        milk.milkDetails = detailIds;
        await milk.save();
    });

    res.status(200).send({newMilk});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try{
        await MilkDetail.deleteMany({milk:id});

        let detailIds = [];
        for(let detail of data.milkDetails){
            detail.milk = id
            detail.cow = detail.cow._id

            const newMilkDetail = new MilkDetail(detail);
            await newMilkDetail.save();
            detailIds.push(newMilkDetail._id)
        }

        const milk = await Milk.findById(id).exec();
        milk.milkDetails = detailIds;
        await milk.save();

        res.status(200).send({message:'Milk updated success.'});
    }catch(error){
        console.error('Milk update error : ',error);
        res.json(error);
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    
    const deletedMilkDetail = await MilkDetail.deleteMany({milk:id});
    console.log("MilkDetail deleted : ",deletedMilkDetail)

    const deletedMilk = await Milk.deleteOne({_id:id});
    console.log("Milk deleted : ",deletedMilk)

    res.status(200).send({deletedMilk});
};