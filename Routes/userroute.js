const express = require('express')
const fs = require('fs');
const authController = require('./../Controller/authController')
// const Users = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
//   );
  
const getAllUsers = (req, res) => {
    const time = req.requetTime;
    res.status(200).json({
      requestedat: time,
      status: 'success',
      results: Users.length,
      data: {
        Users,
      },
    });
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

  module.exports = router