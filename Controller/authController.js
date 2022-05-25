const User = require('./../models/users')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const { decode } = require('punycode')
const AppError = require('./../utils/appError');

const signToken = id =>{
    return jwt.sign({id} , process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES
    })
}

exports.signup = async(req, res , next)=>{
    try{
        const newUser = await User.create({
            name : req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm : req.body.passwordConfirm,
            role : req.body.role,
            passwordChangedAt : req.body.passwordChangedAt
        });

const token = signToken(newUser._id)

        res.status(201).json({
            status : 'success',
            token,
            data : {
                user : newUser
            }
        })     
    } catch(err){
        console.log(err)
    res.status(400).json({
      status: 'fail',
      messgae: err,
    });
    }
   
}

exports.login = async (req , res , next)=>{
    const {email , password} = req.body

    //1 check if email and password exist
    if(!email || !password){
        return res.status(400).json({
            status: 'fail',
            messgae: 'please provide email or password'
          });
    }
    //2 Check if user exist and password is correct

        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.status(400).json({
                status: 'fail',
                messgae: 'Wrong email or password'
              });
        }
        const connect =await user.correctPassword(password , user.password)
        if(!connect){
            return res.status(400).json({
                status: 'fail',
                messgae: 'Incorrect connect'
              });
        }

    const token = signToken(user._id);
    res.status(200).json({
        status: 'Success',
        token 
    });


}

exports.protect = async(req , res , next) => {
    try{
        // 1 get token and check if it exists

        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token){
            return res.status(400).json({
                status: 'fail',
                messgae: 'Token is undefined'
              });
        }

      //  console.log(token)
        // 2 verification token

     const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET)
        // 3 Check if user still exist
           const freshUser = await   User.findById(decoded.id)

           if(!freshUser){
            return res.status(400).json({
                status: 'fail',
                messgae: 'User token does not exist'
              });
        }

        // 4 check if user changed the password after token is issued
        // if(freshUser.changePasswordAfter(decoded.iat)){
        //     return res.status(400).json({
        //         status: 'fail',
        //         messgae: 'User password changed'
        //       });
        // }
         req.user = freshUser
      next()
    }
    catch(err){
        return res.status(400).json({
            status: 'fail',
            messgae: err
          });
    }
  }

  

  exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      next();
    };
  };


  