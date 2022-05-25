const express = require('express')
const authController = require('./../Controller/authController')
const APIFeatures = require('./../utils/apiFeatures');
const User = require('./../models/users');


  
const getAllUsers = async (req, res , next) => {
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
    console.log(err)
    res.status(400).json({
      status: 'fail',
      messgae: err,
    });
  }
  };
  
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

 


  const router = express.Router();

  router.route('/').get(getAllUsers).post(createUser);
  router.post('/signup' , authController.signup)
  router.post('/login' , authController.login)


  module.exports = router