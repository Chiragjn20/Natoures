const express = require('express');
const reviewController = require('./../Controller/reviewController');
const authController = require('./../Controller/authController');

const router = express.Router();

router
  .route('/')
  .get( reviewController.getAllReviews)
  .post(authController.protect, authController.restrictTo('user'),reviewController.createReview);

module.exports = router;
