const { verifyCreate,authJwt } = require("../middlewares");
const controller = require("../controllers/protection.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/protection',[authJwt.verifyToken],controller.getAll);
  app.get('/protection/:id',[authJwt.verifyToken],controller.get);
  app.post("/protection",[authJwt.verifyToken,verifyCreate.protectionCheckDup],controller.create);
  app.put("/protection/:id",[authJwt.verifyToken],controller.update);
  app.delete("/protection",[authJwt.verifyToken],controller.delete);
};