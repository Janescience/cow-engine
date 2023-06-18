const db = require("../models");
const Milk = db.milk;
const MilkDetail = db.milkDetail;
const Cow = db.cow;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId

    const year = filter?.year; 
    const month = filter?.month;
    const days = new Date(year, month-1, 0).getDate()

    let start = new Date(year,month-1,1)
    const startOffset = start.getTimezoneOffset();
    let startDate = new Date(start.getTime() - (startOffset*60*1000))

    let end = new Date(year, month-1, days);
    const endOffset = end.getTimezoneOffset();
    let endDate = new Date(end.getTime() - (endOffset*60*1000))

    const milks = await Milk.find(
        {   
            date : { $gte : startDate.toISOString().split('T')[0] , $lte : endDate.toISOString().split('T')[0] },
            farm : filter.farm
        }
    ).populate('milkDetails').sort({time:-1}).exec();

    // const milks = await Milk.find(filter).populate('milkDetails').sort({date:-1}).exec();

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
    const farmId = req.farmId;
    const milks = await Milk.find({farm:farmId}).populate({path:'milkDetails',match : { cow : filter.cow }}).exec();
    res.status(200).send({milks});
};

exports.create = async (req, res) => {
    const data = req.body;
    const farmId = req.farmId

    const milkSave = { time : data.time , date : data.date , farm : farmId };
    const newMilk = new Milk(milkSave);
    
    const milkSaved = await newMilk.save();
    console.log('milk saved.')

    const detailIds = [];
    for(let detail of data.milkDetails){
        detail.milk = milkSaved._id;
        const newMilkDetail = new MilkDetail(detail);
        const milkDetail = await newMilkDetail.save();
        detailIds.push(milkDetail._id)
    }
    console.log('deatailIds : ',detailIds)

    await Milk.updateOne({_id:milkSaved._id},{milkDetails:detailIds}).exec();
    console.log('milk updated.')

    res.status(200).send({milkSaved});
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
