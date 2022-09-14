const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const app = express();
//require('dotenv').config()
const cors = require('cors');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const viewRouter = require('./Routes/viewRoutes')


app.use(cors({
  origin: '*'
}))

const cookieParser = require('cookie-parser')

// app.use(cors())
// app.options('*',cors())
app.use(express.static(path.join(__dirname, 'public')))

app.use(helmet())

// body parser
app.use(express.json({limit : '10kb'}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true, limit:'10kb'}))

app.set('view engine' , 'pug')
app.set('views' , path.join(__dirname , 'views') )

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
const reviewRoute = require('./Routes/reviewroute')
const bookingRoute = require('./Routes/bookingRoutes')

const authController = require("./Controller/authController")

app.use('/api' , limiter)



//app.use(morgan('dev'));



app.use((req, res, next) => {
  req.requetTime = new Date().toISOString();
 // console.log(req.cookies);
  next();
});



// creating a seperate route for tours

app.use('/', viewRouter);
app.use ('/api/v1/tours' , tourRoute);
app.use ('/api/v1/users' , userRoute);
app.use ('/api/v1/reviews' , reviewRoute);
app.use ('/api/v1/bookings' , bookingRoute);

module.exports = app;