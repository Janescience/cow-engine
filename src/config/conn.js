const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path : '../../.env'});

mongoose.connect(process.env.URI, 
    { useNewUrlParser: true,
     useUnifiedTopology: true })
    .then((data) => {
        console.log(`Database connected to ${data.connection.host}`)
})