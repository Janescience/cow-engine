const { verifyCreate,authJwt } = require("../middlewares");
const controller = require("../controllers/food.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/food',[authJwt.verifyToken],controller.getAll);
  app.get('/food/:id',[authJwt.verifyToken],controller.get);
  app.post("/food",[authJwt.verifyToken,verifyCreate.foodCheckDup],controller.create);
  app.put("/food/:id",[authJwt.verifyToken],controller.update);
  app.delete("/food",[authJwt.verifyToken],controller.delete);
};