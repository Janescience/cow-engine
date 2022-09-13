const { authJwt } = require("../middlewares");
const controller = require("../controllers/transaction.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/expTrackEngine/transactions",[authJwt.verifyToken],controller.getTransactions);
  app.get("/expTrackEngine/transaction/:id",[authJwt.verifyToken], controller.getTransaction);
  app.post("/expTrackEngine/transaction", [authJwt.verifyToken],controller.createTransaction);
  app.put("/expTrackEngine/transaction/:id",[authJwt.verifyToken], controller.updateTransaction);
  app.delete("/expTrackEngine/transaction/:id",[authJwt.verifyToken], controller.deleteTransaction);
};