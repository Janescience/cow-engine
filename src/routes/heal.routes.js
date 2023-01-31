const { authJwt } = require("../middlewares");
const { logger } = require("../middlewares/log-events");

const controller = require("../controllers/heal.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/heal',[authJwt.verifyToken],controller.getAll);
  app.get('/heal/:id',[authJwt.verifyToken],controller.get);
  app.post("/heal",[authJwt.verifyToken,logger],controller.create);
  app.put("/heal/:id",[authJwt.verifyToken,logger],controller.update);
  app.delete("/heal/:id",[authJwt.verifyToken],controller.delete);
};