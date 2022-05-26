const mongoose = require('mongoose');
//const validator = require('validator')
const bcrypt = require('bcryptjs') 
const crypto = require('crypto');

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
        required : [true , 'Please provide a password'],
        select : false
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
        },
        select : false

    },
    role :{
      type : String,
      enum : ['user', 'guide' ,'lead-guide' , 'admin'],
      default : 'user'
    },
    photo : String,
    passwordChangedAt : Date,
    passwordResetToken: String,
    active :{
      type : Boolean,
      default : true,
      select : false
    }

    
  })

  userSchema.pre('save' , async function(next){
      // only run if passowrd is actually modified
      if(!this.isModified('password') )return next();

      this.password = await bcrypt.hash(this.password, 12);
      this.passwordConfirm = undefined

    next()
  })

  userSchema.pre('save' ,  function(next){
    // only run if passowrd is actually modified
    if(!this.isModified('password') || this.isNew )return next();

    this.passwordChangedAt = Date.now() - 1000;

     next()
})

  userSchema.pre(/^find/ , function(next){

    this.find({active : { $ne : false}})
    next()

  })



  userSchema.methods.correctPassword = async function(candidatePassword , userPassword){

    return await bcrypt.compare(candidatePassword , userPassword);
  }

  userSchema.methods.changePasswordAfter = async function(JWTTimeStamp){

    if(this.passwordChnagedAt){
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimeStamp < changedTimestamp;
    }

    return false;
  
  }

  userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  }; 



  const User = mongoose.model('User' , userSchema);

  module.exports = User;