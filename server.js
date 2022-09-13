const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require("cors")
const cookieParser = require('cookie-parser');

const app = express();

var corsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(cookieParser())

const db = require("./src/models");

// routes
require('./src/routes/auth.routes')(app);
require('./src/routes/line.routes')(app);
require('./src/routes/transaction.routes')(app);

// basic route
app.get("/",(req,res) => {
    res.send("Welcome Cow Application.")
})
app.all("*", (req,res) => {
    res.send("404 not found.")
})

// connect db and start app 
db.mongoose
.connect('mongodb+srv://janescience:Top2233223233@cluster0.xf552.mongodb.net/mern?retryWrites=true&w=majority')
.then(() => {
    console.log("Successfully connect to MongoDB.")
    initial();
}).catch(err => {
    console.error("Connection error", err);
    process.exit();
})

function initial(){
    const PORT = 4000
    app.listen(PORT, () => {
        console.log("Server is running on port : ",PORT);
    })
}

