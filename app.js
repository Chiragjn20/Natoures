const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const app = express();
//require('dotenv').config()

const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

app.use(helmet())

// body parser
app.use(express.json({limit : '10kb'}));


//prevent parameter pollution
app.use(hpp({
  whitelist:[
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))


//Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against xss
app.use(xss())

const limiter = rateLimit({
  max : 100,
  windowMs : 60*60*1000,
  message : "Too many attempts"
})

const tourRoute = require('./Routes/tourroute')
const userRoute = require('./Routes/userroute')

app.use('/api' , limiter)



//app.use(morgan('dev'));



app.use((req, res, next) => {
  req.requetTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});



// creating a seperate route for tours
app.use ('/api/v1/tours' , tourRoute);
app.use ('/api/v1/users' , userRoute);

module.exports = app;