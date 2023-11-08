const mongoose = require('mongoose');
mongoose.connect(process.env.URI, 
    { useNewUrlParser: true,
     useUnifiedTopology: true })
    .then((data) => {
        console.log(`Database connected to ${data.connection.host}`)
})

const db = require("../models");
db.sequelize.sync({force:true})
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });
