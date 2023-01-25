const db = require("../models");
const Cow = db.cow;
const Milk = db.milking;

exports.get = async (req, res) => {
    const filter = req.query
    const farmId = filter.farm;
    const ObjectID = require('mongodb').ObjectId;
    const cows = await Cow.find(filter).exec();
    const maxMilks = await Milk.aggregate(
        [
            {
                $group: {
                    _id: {cow:"$cow",farm:"$farm"},
                    totalQty: { $avg: { $add : ["$morningQty","$afternoonQty"]} }
                }
            },
            {
                $sort : { totalQty: -1 }
            },
            { 
                $match : { '_id.farm' : ObjectID(farmId) }
            }
        ]
    );

    let maxMilk = null;
    if(maxMilks.length > 0){
        const cow = await Cow.findOne({_id : maxMilks[0]._id.cow})
        maxMilk = { cow : cow , qty :  maxMilks[0].totalQty }
    }

    const cow = {
        all : cows.length,
        milk : cows.filter(c => c.status === 3).length,
        pregnant : cows.filter(c => c.status === 1).length,
        baby : cows.filter(c => c.status === 4).length,
        dry : cows.filter(c => c.status === 2).length,
        maxMilk : maxMilk
    }

    const milks = await Milk.find({farm : farmId})
    res.json(
        {
            cow,
            milks
        }
    );
};

