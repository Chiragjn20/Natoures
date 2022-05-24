const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
      type : String ,
      required : [true , 'Tour must have a name'],
      minlength: [4 , 'Tour atleast have length of 5']
    } ,
    email :{
        type : String,
        required : [true , 'Tour must have a email'],
        unique : true,
        lowercase : true
    },
    password :{
        type : String,
        min :[6 , 'password too short'],
        required : [true , 'Please provide a password']
    },
    passwordConfirm :{
        type : String,
        required : true,
        //this only work on create and save
        validate : {
            validator : function(el){
                return el === this.password;
            },
            message : 'Password cannot be different'
        }

    },
    photo : String
    
  })

  const User = mongoose.model('User' , userSchema);

  module.exports = User;