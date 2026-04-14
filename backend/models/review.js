const mongoose = require('mongoose')
const { Schema } = mongoose

const reviewSchema = new Schema({
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    title:    { type: String, required: true, maxlength: 100 },
    body:     { type: String, required: true, maxlength: 1000 },
    verified: { type: Boolean, default: false }, // true if user actually ordered this product
}, { timestamps: true })

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review