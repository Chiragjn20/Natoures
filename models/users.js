const mongoose = require('mongoose');
//const validator = require('validator')
const bcrypt = require('bcryptjs') 

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

  userSchema.pre('save' , async function(next){
      // only run if passowrd is actually modified
      if(!this.isModified('password') )return next();

      this.password = await bcrypt.hash(this.password, 12);
      this.passwordConfirm = undefined

    next()
  })



  const User = mongoose.model('User' , userSchema);

  module.exports = User;