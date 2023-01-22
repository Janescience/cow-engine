const db = require("../models");
const Cow = db.cow;
const Milk = db.milking;

exports.get = async (req, res) => {
    const filter = req.query
    const farmId = filter.farm;
    const cows = await Cow.find(filter).exec();
    const cow = {
        all : cows.length,
        milk : cows.filter(c => c.status === 3).length,
        pregnant : cows.filter(c => c.status === 1).length,
        baby : cows.filter(c => c.status === 4).length,
        dry : cows.filter(c => c.status === 2).length
    }

    const milks = await Milk.find()
    res.json(
        {
            cow
        }
    );
};

