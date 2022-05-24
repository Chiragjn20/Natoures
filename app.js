const express = require('express');
const morgan = require('morgan');
const app = express();
//require('dotenv').config()


app.use(express.json());



const tourRoute = require('./Routes/tourroute')
const userRoute = require('./Routes/userroute')



app.use(morgan('dev'));



app.use((req, res, next) => {
  req.requetTime = new Date().toISOString();
  console.log('Middleare');
  next();
});



// creating a seperate route for tours
app.use ('/api/v1/tours' , tourRoute);
app.use ('/api/v1/users' , userRoute);

module.exports = app;