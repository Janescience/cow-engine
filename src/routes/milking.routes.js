const { verifyMilkingCreate,authJwt } = require("../middlewares");
const controller = require("../controllers/milking.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/milking',[authJwt.verifyToken],controller.getAll);
  app.get('/milking/:id',[authJwt.verifyToken],controller.get);

  app.post("/milking",
    [
      authJwt.verifyToken,
      verifyMilkingCreate.checkDuplicate,
    ],
    controller.create
  );

  app.put("/milking/:id",[authJwt.verifyToken],controller.update);
  app.delete("/milking/:id",[authJwt.verifyToken],controller.delete);
};