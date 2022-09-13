
const { lineApi } = require("../services")

exports.lineRedirect = async (req, res) => {
  try {
    lineApi.token(req.query.code,req.query.state,req.userId)
  } catch (error) {
    return res.json({ error: error });  
  }
};

