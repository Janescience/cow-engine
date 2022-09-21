const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://janescience:Top2233223233@cluster0.xf552.mongodb.net/mern?retryWrites=true&w=majority', 
    { useNewUrlParser: true,
     useUnifiedTopology: true })
    .then((data) => {
        console.log(`Database connected to ${data.connection.host}`)
})