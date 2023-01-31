const { verifyCreate,authJwt } = require("../middlewares");
const { logger } = require("../middlewares/log-events");
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
  app.post("/milking",[authJwt.verifyToken,verifyCreate.milkingCheckDup,logger],controller.create);
  app.put("/milking/:id",[authJwt.verifyToken],controller.update);
  app.delete("/milking/:id",[authJwt.verifyToken],controller.delete);
};