const db = require("../models");
const NotiParam = db.notificationParam;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farm = req.farmId
    const notiParams = await NotiParam.find(filter).sort({'seq':-1}).exec();
    res.json({notiParams});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const notiParam = await NotiParam.findById(id).exec();;
    res.status(200).send({notiParam});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedNotiParam = await NotiParam.updateOne({_id:id},data).exec();
    // console.log("NotiParam updated : ",updatedNotiParam);
    res.status(200).send({updatedNotiParam});
};
