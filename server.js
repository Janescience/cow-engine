const express = require('express');
const cors = require("cors")
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const httpLogger = require('./http-logger')

//Configure dotenv files above using any other library and files
dotenv.config(); 
require('./src/config/conn');
// require('./src/schedule/notify-cron');

const app = express();
 
// var corsOptions = {
//     origin: "http://localhost:3000"
// };

// app.use(httpLogger)
app.use(cors())
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({limit: '50mb', extended:true }))
app.use(cookieParser())
app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

// routes
require('./src/routes/auth.routes')(app);
require('./src/routes/line.routes')(app);
require('./src/routes/cow.routes')(app);
require('./src/routes/milking.routes')(app);
require('./src/routes/reproduction.routes')(app);

// basic route
app.get("/",(req,res) => {
    res.send("Welcome Cow Application.") 
})
app.all("*", (req,res) => {
    res.send("404 not found.")
})

app.get('/errorhandler', (req, res, next) => {
    try {
      throw new Error('Wowza!')
    } catch (error) {
      next(error)
    }
})

app.use(logErrors)
app.use(errorHandler)

function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}
function errorHandler (err, req, res, next) {
  res.status(500).send({ message : err.message })
}

app.listen(process.env.PORT, () => {
    console.log("Server is running on port : ",process.env.PORT);
})


