const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
      type : String ,
      required : [true , 'Tour must have a name'],
      unique: true,
      minlength: [5 , 'Tour atleast have length of 5']
    } ,
    duration :{
        type : Number,
        required : [true , 'Tour must have a duration']

    },
    maxGroupSize :{
        type : Number,
        required : [true , 'Tour must have a grp size']
    },
    difficulty: {
        type : String ,
        required : [true , 'Tour must have a difficulty level'],
        enum :{
          values :[ 'easy' , 'medium' , 'difficult' ],
          message : 'Either easy medium or difficult'
        }
      },
    rating :{
      type: Number ,
      default : 4.5,
      min :[1 , "It must be atleast 1"],
      max :[5 , "It must be less than 5 "]
    },
    ratingQuantity:{
        type: Number ,
        default : 0
      },
    price : {
      type : Number,
      required: [true , 'Tour must have a price']
    }, 
    priceDiscount :{
      type: Number ,
      //custom validator
      validate :{
          validator: function(val){
            //this only points to current doc on NEW Document creation
            return val < this.price
      },
      message : 'Discount must be less than actual price'  

      }

    },
    summary:{
        type : String , 
        trim : true,
        required: true
    },
    discription:{
        type : String ,
        trim : true
    },
    imageCover :{
        type : String
    },
    images : [String],
    createdAT:{
        type : Date,
        defalut : Date.now()
    },
    startDates:[Date]
  })

  const Tour = mongoose.model('Tour' , tourSchema);

  module.exports = Tour;