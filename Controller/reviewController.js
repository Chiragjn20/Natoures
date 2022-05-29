const Review = require('./../models/reviewModel')
const catchAsync = require('./../utils/catchAsync')

exports.getAllReviews = async(req, res ,next)=>{

    const reviews = await Review.find()

    res.status(200).json({
        stauts : "success",
        results : reviews.length,
        data :{
            reviews
        }
    })

}

exports.createReview = catchAsync (async(req , res, next)=>{
    const newReview = await Review.create(req.body)

    res.status(201).json({
        stauts : "success",
        data :{
            reviews : newReview
        }
    })
})