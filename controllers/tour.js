const Tour = require('../models/tour')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=> {
    if(!file.mimetype.startsWith('image')) {
        return cb(new Error('Please upload only images'), false)
    }
    cb(undefined, true)
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

const uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

const resizeTourImages = async (req,res,next)=> {
    if(!req.files || !req.files.imageCover || !req.files.images )
    {
        return next()
    }
    req.body.imageCover = `tour-${req.params.id}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg')
        .jpeg({quality: 90}).toFile(`public/img/tours/${req.body.imageCover}`)

    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i)=> {
        const filename = `tour-${req.params.id}-${i+1}.jpeg`
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${filename}`)
        req.body.images.push(filename)
        })
    )
    next()
}

const getAllTours = factory.getAll(Tour, 'tours/tour')
const createTour = factory.createOne(Tour)
const getTour = factory.getOne(Tour, 'tours/show')
const updateTour = factory.updateOne(Tour)
const deleteTour = factory.deleteOne(Tour)

// get all tours within a specific distance
const getToursWithin = async (req,res)=> {
    try {
        const {distance, latlng, unit} = req.params
        const [lat, lng] = latlng.split(',')
        const radius = unit === 'mi'? distance/3963.2 : distance/6378.1
        if(!lat || !lng)
        {
            throw ('Please provide latitude and longitude in the format lat,lng')
        }
        const tours = await Tour.find({
            startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
        })
        res.send({
            status: 'success',
            results: tours.length,
            data: {
                data: tours
            }
        })
    }
    catch(e) {
        res.status(400).send(e)
    }
}

// get distances of all tours frrom a certain point
const getDistances = async(req,res)=> {
    try
    {
        const {latlng, unit} = req.params
        const [lat, lng] = latlng.split(',')
        const multiplier = unit === 'mi'? 0.000621371 : 0.001
        if(!lat || !lng)
        {
            throw ('Please provide latitude and longitude in the format lat,lng')
        }
        const distances = await Tour.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng*1, lat*1]
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
        ])
        res.send({
            status: 'success',
            results: distances.length,
            data: {
                data: distances
            }
        })
    }
    catch(e) {
        res.status(400).send(e)
    }
}

module.exports = {
    getTour,
    createTour,
    getToursWithin,
    getDistances,
    updateTour,
    deleteTour,
    getAllTours,
    uploadTourImages,
    resizeTourImages
}