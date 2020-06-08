const mongoose = require('mongoose')
const Tour = require('./tour')

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        required: [true, "review can't be empty"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'review must belong to a user']
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tour',
        required: [true, 'review must belong to a tour']
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// ensuring that user can't review same tour multiple times
reviewSchema.index({tour: 1, user: 1}, { unique: true})

// calc average ratings of a tour
reviewSchema.statics.calcAvgRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        }, 
        {
            $group: {
                _id: '$tour',
                nRatings: {$sum: 1},
                avgRatings: {$avg: '$rating'}
            }
        }
    ])
    if(stats.length>0)
    {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRatings
        })
    }
    else
    {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save', async function() { 
    // this refers to object that we get after creating document(response)
    Review.calcAvgRatings(this.tour)
})

reviewSchema.post(/^findOneAnd/, async function(doc) {
    Review.calcAvgRatings(doc.tour)
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

const Review = mongoose.model('review', reviewSchema)
module.exports = Review