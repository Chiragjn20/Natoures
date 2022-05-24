const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
      type : String ,
      required : [true , 'Tour must have a name'],
      minlength: [4 , 'Tour atleast have length of 5']
    } ,
    email :{
        type : email,
        required : [true , 'Tour must have a email'],
        unique : true,
        lowercase : true,
        validate :[validator.isEmail , 'please provide a valid email']

    },
    password :{
        type : password,
        min :[6 , 'password too short'],
        required : [true , 'Please provide a password']
    },
    passwordConfirm :{
        type : String,
        required : true
    },
    photo : String
    
  })

  const User = mongoose.model('User' , userSchema);

  module.exports = User;