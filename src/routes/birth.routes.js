const { verifyCreate,authJwt } = require("../middlewares");
const controller = require("../controllers/birth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/birth',[authJwt.verifyToken],controller.getAll);
  app.get('/birth/:id',[authJwt.verifyToken],controller.get);
  app.put("/birth/:id",[authJwt.verifyToken],controller.update);
  app.delete("/birth/:id",[authJwt.verifyToken],controller.delete);
};