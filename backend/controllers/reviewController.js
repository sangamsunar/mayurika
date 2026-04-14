const Review  = require('../models/review')
const Product = require('../models/product')
const Order   = require('../models/order')

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
        res.json(reviews)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const addReview = async (req, res) => {
    try {
        const { rating, title, body } = req.body
        const productId = req.params.productId

        if (!rating || !title || !body) return res.json({ error: 'Rating, title and body are required' })
        if (rating < 1 || rating > 5)   return res.json({ error: 'Rating must be between 1 and 5' })

        // Check if user already reviewed this product
        const existing = await Review.findOne({ product: productId, user: req.user.id })
        if (existing) return res.json({ error: 'You have already reviewed this product' })

        // Check if user actually ordered this product (verified purchase)
        const order = await Order.findOne({
            user: req.user.id,
            'items.product': productId,
            status: 'delivered'
        })

        const review = await Review.create({
            product:  productId,
            user:     req.user.id,
            rating,
            title,
            body,
            verified: !!order
        })

        // Update product average rating
        const allReviews = await Review.find({ product: productId })
        const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await Product.findByIdAndUpdate(productId, {
            rating:  Math.round(avgRating * 10) / 10,
            reviews: allReviews.length
        })

        const populated = await review.populate('user', 'name')
        res.json(populated)
    } catch (error) {
        if (error.code === 11000) return res.json({ error: 'You have already reviewed this product' })
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId)
        if (!review) return res.json({ error: 'Review not found' })
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.json({ error: 'Not authorized' })
        }
        await Review.findByIdAndDelete(req.params.reviewId)

        // Recalculate rating
        const allReviews = await Review.find({ product: review.product })
        const avgRating  = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0
        await Product.findByIdAndUpdate(review.product, {
            rating:  Math.round(avgRating * 10) / 10,
            reviews: allReviews.length
        })

        res.json({ message: 'Review deleted' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

module.exports = { getReviews, addReview, deleteReview }