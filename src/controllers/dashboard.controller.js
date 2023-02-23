const db = require("../models");
const Cow = db.cow;
const Milk = db.milk;
const MilkDetail = db.milkDetail;

exports.get = async (req, res) => {
    const filter = req.query
    const farmId = req.farmId;
    const ObjectID = require('mongodb').ObjectId;

    filter.farm = farmId
    const cows = await Cow.find(filter).exec();
    const cow = {
        all : cows.length,
        milk : cows.filter(c => c.status === 3).length,
        pregnant : cows.filter(c => c.status === 1).length,
        baby : cows.filter(c => c.status === 4).length,
        dry : cows.filter(c => c.status === 2).length,
        avgMaxMilk : null,
        sumMaxMilk : null
    }

    let year = new Date().getFullYear();

    let start = new Date(year,0,1)
    const startOffset = start.getTimezoneOffset();
    let startDate = new Date(start.getTime() - (startOffset*60*1000))

    let end = new Date(year, 11, 31);
    const endOffset = end.getTimezoneOffset();
    let endDate = new Date(end.getTime() - (endOffset*60*1000))

    const milks = await Milk.find(
        {   
            date : { $gte : startDate.toISOString().split('T')[0] , $lte : endDate.toISOString().split('T')[0] },
            farm : farmId
        }
    );

    const milkDetails = await MilkDetail.find({farm:farmId}).exec();
    

    res.json(
        {
            cow,
            milks,
            milkDetails
        }
    );
};

