const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    maxGroupSize: {
        type: Number,
        required: true,
        min: 1
    },
    difficulty: {
        type: String,
        required: true,
        trim: true,
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulties must be either easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5,
        set: (val) => Math.round(val*10)/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    priceDiscount: {
        type: Number,
        min: 0,
        validate: {
            validator(value) {
                return value < this.price
            },
            message: 'Discount price should be below than price' 
        }
    },
    summary: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: true,
        trim: true
    },
    images: [String],
    startDates: [Date],
    
    // mongoose geoJSON
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    guides: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// creating gepspatial index 
tourSchema.index({startLocation: '2dsphere'})

// establishing virtual relationships b/w tour and reviews
tourSchema.virtual('reviews', {
    ref: 'review',
    foreignField: 'tour',
    localField: '_id'
})

// query middleware
tourSchema.pre(/^find/, function (next){
    this.populate('guides').populate('reviews')
    next()
})

const Tour = mongoose.model('tour', tourSchema)
module.exports = Tour


// tourSchema.indexes({price: 1, ratingsAverage: -1})

// tourSchema.post('save', function(doc,next) {
//     console.log(doc)
//     next()
// })

// tourSchema.pre('find', function(next) {
//     this.find({difficulty: 'medium'})
//     next()
// })