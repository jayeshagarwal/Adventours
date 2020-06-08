const Review = require('../models/review')
const factory = require('./handlerFactory')


const reviewMiddleware = (req,res,next)=> {
    req.body.tour = req.params.tourId
    req.body.user = req.user._id
    next()
}

const addTourId = (req,res,next)=> {
    req.query.tour = req.params.tourId
    next()
}

const getAllReviews = factory.getAll(Review)
const createReview = factory.createOne(Review)
const getReview = factory.getOne(Review)
const updateReview = factory.updateOne(Review)
const deleteReview = factory.deleteOne(Review)

module.exports = {
    createReview,
    getAllReviews,
    getReview,
    updateReview,
    deleteReview,
    reviewMiddleware,
    addTourId
}