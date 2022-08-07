const express = require('express');
const viewsController = require('../Controller/viewsController');
const authController = require('../Controller/authController');

const router = express.Router();

router.use(authController.isLoggedIn)

router.get('/', viewsController.getOverview);
router.get('/tours/:id', viewsController.getTour);
router.get('/login',viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/logout',authController.logout)
router.post('/submit-user-data',viewsController.updateUserData)


router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);


module.exports = router;
