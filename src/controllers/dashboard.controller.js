const db = require("../models");
const Cow = db.cow;
const Milk = db.milking;

exports.get = async (req, res) => {
    const filter = req.query
    const farmId = req.farmId;
    const ObjectID = require('mongodb').ObjectId;

    const avgMaxMilks = await Milk.aggregate(
        [
            {
                $group: {
                    _id: {cow:"$cow",farm:"$farm"},
                    avg: { $avg: { $add : ["$morningQty","$afternoonQty"]} },
                }
            },
            {
                $sort : { avg: -1 }
            },
            { 
                $match : { '_id.farm' : ObjectID(farmId) }
            }
        ]
    );

    let avgMaxMilk = null;
    if(avgMaxMilks.length > 0){
        const cow = await Cow.findOne({_id : avgMaxMilks[0]._id.cow})
        avgMaxMilk = { cow : cow , avg :  avgMaxMilks[0].avg }
    }

    const sumMaxMilks = await Milk.aggregate(
        [
            {
                $group: {
                    _id: {cow:"$cow",farm:"$farm"},
                    sum: { $sum: { $add : ["$morningQty","$afternoonQty"]} },
                }
            },
            {
                $sort : { sum: -1 }
            },
            { 
                $match : { '_id.farm' : ObjectID(farmId) }
            }
        ]
    );

    let sumMaxMilk = null;
    if(sumMaxMilks.length > 0){
        const cow = await Cow.findOne({_id : sumMaxMilks[0]._id.cow})
        sumMaxMilk = { cow : cow , sum :  sumMaxMilks[0].sum }
    }

    const cows = await Cow.find(filter).exec();
    const cow = {
        all : cows.length,
        milk : cows.filter(c => c.status === 3).length,
        pregnant : cows.filter(c => c.status === 1).length,
        baby : cows.filter(c => c.status === 4).length,
        dry : cows.filter(c => c.status === 2).length,
        avgMaxMilk : avgMaxMilk,
        sumMaxMilk : sumMaxMilk
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

    res.json(
        {
            cow,
            milks
        }
    );
};

