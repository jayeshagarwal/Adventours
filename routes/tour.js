const express = require('express')
const router = express.Router()
const reviewRoutes = require('./review')
const tourController = require('../controllers/tour')
const {isLoggedIn, userRole} = require('../middlewares/auth')

router.use('/:tourId/reviews', reviewRoutes)

router.get('/', tourController.getAllTours)
router.get('/:id', tourController.getTour)
router.get('/tours-within/:distance/center/:latlng/unit/:unit', tourController.getToursWithin)
router.get('/distances/:latlng/unit/:unit', tourController.getDistances)


router.use(isLoggedIn)
router.use(userRole('admin', 'lead-guide'))

router.post('/', tourController.createTour)
router.put('/:id', tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
router.delete('/:id', tourController.deleteTour)

// router.get('/stats', async (req,res)=> {
//     try {
//         const stats = await Tour.aggregate([
//             {
//                 $match: {ratingsAverage: {$gte: 4.5}}
//             },
//             {
//                 $group: {
//                     _id: '$difficulty',
//                     num: {$sum: 1},
//                     numratings: {$sum: '$ratingsQuantity'},
//                     avgRating: {$avg: '$ratingsAverage'},
//                     avgPrice: {$avg: '$price'},
//                     minPrice: {$min: '$price'},
//                     maxPrice: {$max: '$price'}
//                 }
//             }
//         ])
//         res.status(201).send({
//             status: 'success',
//             data: {
//                 stats
//             }
//         })
//     }
//     catch(e) {
//         res.status(500).send(e)
//     }
// })


module.exports = router