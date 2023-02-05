const db = require("../models");
const Logs = db.notificationLogs;

exports.get = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const notifications = await Logs.find(filter).sort({createdAt:-1}).exec();
    res.json({notifications});
};

