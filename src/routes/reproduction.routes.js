const { verifyCreate,authJwt } = require("../middlewares");
const controller = require("../controllers/reproduction.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/reproduction',[authJwt.verifyToken],controller.getAll);
  app.get('/reproduction/:id',[authJwt.verifyToken],controller.get);
  app.post("/reproduction",[authJwt.verifyToken,verifyCreate.reproCheckDup,],controller.create);
  app.put("/reproduction/:id",[authJwt.verifyToken],controller.update);
  app.delete("/reproduction/:id",[authJwt.verifyToken],controller.delete);
};