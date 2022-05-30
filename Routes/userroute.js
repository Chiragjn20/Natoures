const express = require('express');
const authController = require('./../Controller/authController');
const APIFeatures = require('./../utils/apiFeatures');
const User = require('./../models/users');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const reviewController = require('./../Controller/reviewController');
const factory = require('./../Controller/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
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

const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
const createUser = (req, res) => {
  const newId = Users[Users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);
  Users.push(newUser);

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(Users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          User: newUser,
        },
      });
    }
  );
  res.send('done');
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// const deleteMe = catchAsync(async (req, res, next) => {
//   await User.findByIdAndUpdate(req.user.id, { active: false });

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });







const deleteMe = factory.deleteOne(User);

const router = express.Router();

const getUser = factory.getOne(User);

router.get('/me', authController.protect, getMe, getUser);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/updateMe', authController.protect, updateMe);
router.delete('/deleteMe', authController.protect, deleteMe);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch(
  '/updateMypassword',
  authController.protect,
  authController.updatePassword
)

router.use(authController.protect, authController.restrictTo('admin'));
router
  .route('/')
  .get( getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateMe)
  .delete(deleteMe);


module.exports = router;
