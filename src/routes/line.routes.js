const controller = require("../controllers/line.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.get("/line/redirect",[authJwt.verifyToken], controller.lineRedirect);
};