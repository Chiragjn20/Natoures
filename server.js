const app = require('./app');
const mongoose = require('mongoose');

require('dotenv').config()


mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('Db connection successful'));


 

  // const  testTour = new Tour({
  //   name : ' The Himalayas',
  //   rating : 4.5,
  //   price : 50000
  // })

  // testTour.save().then(doc =>{
  //   console.log(doc)
  // }).catch(err =>{
  //   console.log("Error occured" , err)
  // })

const port = 3000;
app.listen(port, () => {
  console.log(`Listening to port ${port} `);
});
