const User = require('./../models/users');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { decode } = require('punycode');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
 
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken=(user , statusCode , res )=>{
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
    httpOnly : true
  }
if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions )


    user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    createSendToken(newUser , 201 , res);
    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      messgae: err,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  //1 check if email and password exist
  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      messgae: 'please provide email or password',
    });
  }
  //2 Check if user exist and password is correct

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(400).json({
      status: 'fail',
      messgae: 'Wrong email or password',
    });
  }
  const connect = await user.correctPassword(password, user.password);
  if (!connect) {
    return res.status(400).json({
      status: 'fail',
      messgae: 'Incorrect connect',
    });
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
};

exports.protect = async (req, res, next) => {
  try {
    // 1 get token and check if it exists

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(400).json({
        status: 'fail',
        messgae: 'Token is undefined',
      });
    }

    //  console.log(token)
    // 2 verification token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3 Check if user still exist
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return res.status(400).json({
        status: 'fail',
        messgae: 'User token does not exist',
      });
    }

    // 4 check if user changed the password after token is issued
    // if(freshUser.changePasswordAfter(decoded.iat)){
    //     return res.status(400).json({
    //         status: 'fail',
    //         messgae: 'User password changed'
    //       });
    // }
    req.user = freshUser;
    next();
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      messgae: err,
    });
  }
};

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

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1 Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2 Generate random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3 send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

    const message =`forgot your password? submit a patch request  and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

    try{
      await sendEmail({
        email : user.email,
        subject : 'Password reset token valid for 10 mins',
        message
      })
  
        res.status(200).json({
          state : "success",
          message : 'Token is sent to email'
        })
    }catch(err){

      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'fail',
        messgae: err,
      });

    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

