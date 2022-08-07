const express = require('express');
const APIFeatures = require('./../utils/apiFeatures');
const authController = require('./../Controller/authController');
const Tour = require('./../models/tours');
const reviewRouter = require('./../Routes/reviewroute');
const handleFactory = require('./../Controller/handlerFactory');
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync')

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

// const getTourbyId = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id).populate('reviwes');
//     const time = req.requetTime;
//     res.status(200).json({
//       requestedat: time,
//       status: 'success',
//       results: tour.length,
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       messgae: 'error occured',
//     });
//   }
// };


const getTourbyId = handleFactory.getOne(Tour) 

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

// const deleteTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     const time = req.requetTime;
//     res.status(204).json({
//       requestedat: time,
//       status: 'success',
//       results: tour.length,
//       data: null,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       messgae: err,
//     });
//   }
// };

const deleteTour = handleFactory.deleteOne(Tour);

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



// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});


const router = express.Router({ mergeParams: true });

router.use('/:tourId/reviews', reviewRouter);
router.route('/tour-states').get(getTourStates);

router.route('/best-5-trips').get(aliasTopTours, getTour);

router
  .route('/')
  .get(getTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    addTour
  );


  
  
  router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getTourWithin)
    router.route('/distances/:latlng/unit/:unit').get(getDistances)

  router
  .route('/:id')
  .get(getTourbyId)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'guide'),
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'guide'),
    deleteTour
  );

module.exports = router;
