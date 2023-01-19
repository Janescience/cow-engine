const { verifyCreate,authJwt } = require("../middlewares");
const controller = require("../controllers/recipe.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/recipe',[authJwt.verifyToken],controller.getAll);
  app.get('/recipe/:id',[authJwt.verifyToken],controller.get);
  app.post("/recipe",[authJwt.verifyToken,verifyCreate.recipeCheckDup],controller.create);
  app.put("/recipe/:id",[authJwt.verifyToken],controller.update);
  app.delete("/recipe/:id",[authJwt.verifyToken],controller.delete);
};