const db = require("../models");
const Bill = db.bill;

exports.getAll = async (req, res) => {
    const filter = req.query
    filter.farmId = req.farmId
    const bills = await Bill.findAll({where:filter});
    res.json({bills});
};

exports.get = async (req, res) => {
    const id = req.params.id
    const bill = await Bill.findByPk(id);
    res.status(200).send({bill});
};

exports.create = async (req, res) => {
    const data = req.body;
    data.farmId = req.farmId
    const newBill = await Bill.create(data);
    res.status(200).send({newBill});
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedBill = await Bill.update(data,{where:{id:id}});
    res.status(200).send({updatedBill});
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    const deletedBill = await Bill.destroy({where:{id:id}});
    res.status(200).send({deletedBill});
};

exports.deletes = async (req, res) => {
    const datas = req.body;
    await Bill.destroy({where:{id:datas}});
    res.status(200).send('Delete selected successfully.');
};
