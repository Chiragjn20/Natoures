const express = require('express');
const APIFeatures = require('./../utils/apiFeatures');
const authController = require('./../Controller/authController');

const Tour = require('./../models/tours');

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getTour = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
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

const addTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    const time = req.requetTime;
    res.status(200).json({
      data: {
        newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      messgae: err,
    });
  }
};

const getTourbyId = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
    const time = req.requetTime;
    res.status(200).json({
      requestedat: time,
      status: 'success',
      results: tour.length,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      messgae: 'error occured',
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const time = req.requetTime;
    res.status(200).json({
      requestedat: time,
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'failed',
      messgae: 'error occured',
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    const time = req.requetTime;
    res.status(204).json({
      requestedat: time,
      status: 'success',
      results: tour.length,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      messgae: err,
    });
  }
};

const getTourStates = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const router = express.Router();
router.route('/tour-states').get(getTourStates);

router.route('/best-5-trips').get(aliasTopTours, getTour);

router.route('/').get(authController.protect, getTour).post(addTour);

router
  .route('/:id')
  .get(getTourbyId)
  .patch(updateTour)
  .delete(
    authController.protect,
     authController.restrictTo('admin'),
    deleteTour
  );

module.exports = router;
