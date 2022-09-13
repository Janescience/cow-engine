const db = require("../models");
const Transaction = db.transaction;

exports.getTransactions = async (req, res) => {
    const filter = req.query
    const transactions = await Transaction.find(filter).exec();
    res.json({transactions});
};

exports.getTransaction = async (req, res) => {
    const id = req.params.id
    const transaction = await Transaction.findById(id).exec();;
    res.status(200).send({transaction});
};

exports.createTransaction = async (req, res) => {
    const data = req.body.newTransaction;
    const newTransaction = new Transaction(data);
    await newTransaction.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
    })
    res.status(200).send({newTransaction});
};

exports.updateTransaction = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updatedTransaction = await Transaction.updateOne({_id:id},data).exec();
    await updatedTransaction.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
    })
    res.status(200).send({updatedTransaction});
};

exports.deleteTransaction = async (req, res) => {
    const id = req.params.id;
    const deletedTransaction = await Transaction.deleteOne({_id:id});
    res.status(200).send({deletedTransaction});
};