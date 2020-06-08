const express = require('express')
const {isLoggedIn, userRole} = require('../middlewares/auth')
const router = express.Router({mergeParams: true})
const reviewController = require('../controllers/reviews')

// route for admin
router.use(isLoggedIn)
router.get('/', reviewController.addTourId, reviewController.getAllReviews)

// routes for user
router.use(userRole('user'))
router.post('/', reviewController.reviewMiddleware, reviewController.createReview)
router.get('/:id', reviewController.getReview)
router.patch('/:id', reviewController.updateReview)
router.delete('/:id', reviewController.deleteReview)

module.exports = router