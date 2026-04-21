const express = require('express')
const router = express.Router()
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const { test, registerUser, loginUser, getProfile, getFullProfile, updateProfile, uploadAvatar, forgotPassword, verifyOtp, resetPassword, verifyEmail, logout, getSizeProfile, updateSizeProfile, saveAddress, deleteAddress } = require('../controllers/authController')
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware')
const { getGoldRate, scrapeRate, setManualRate } = require('../controllers/goldRateController')
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController')
const { addToCart, removeFromCart, getCart, addToWishlist, getWishlist } = require('../controllers/cartWishlistController')
const { createOrder, getUserOrders, getOrder, getAllOrders, updateOrderStatus, cancelOrder, getAdminCustomers } = require('../controllers/orderController')
const { getReviews, addReview, deleteReview } = require('../controllers/reviewController')
const { createStripeSession, verifyStripeSession, stripeWebhook, initiateEsewa, esewaSuccess } = require('../controllers/paymentController')
const { upload, avatarUpload } = require('../middleware/upload')
const { getAnalytics } = require('../controllers/analyticsController')
const { chat, getChatHistory } = require('../controllers/chatbotController')

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    message: { error: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
})
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 120,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
})

router.use(cors({ credentials: true, origin: 'http://localhost:5173' }))
router.use(generalLimiter)

// ── Auth ─────────────────────────────────────────────────
router.get('/', test)
router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/profile', getProfile)
router.post('/logout', logout)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/verify-otp', authLimiter, verifyOtp)
router.post('/reset-password', authLimiter, resetPassword)
router.post('/verify-email', authLimiter, verifyEmail)

// ── Avatar ────────────────────────────────────────────────
router.post('/account/avatar', requireAuth, avatarUpload.single('avatar'), uploadAvatar)

// ── Full Profile & Account ────────────────────────────────
router.get('/account', requireAuth, getFullProfile)
router.put('/account', requireAuth, updateProfile)
router.post('/account/addresses', requireAuth, saveAddress)
router.put('/account/addresses/:addressId', requireAuth, saveAddress)
router.delete('/account/addresses/:addressId', requireAuth, deleteAddress)

// ── Size Profile ─────────────────────────────────────────
router.get('/size-profile', requireAuth, getSizeProfile)
router.put('/size-profile', requireAuth, updateSizeProfile)

// ── Gold Rate ─────────────────────────────────────────────
router.get('/gold-rate', getGoldRate)
router.post('/gold-rate/scrape', requireAdmin, scrapeRate)
router.post('/gold-rate/manual', requireAdmin, setManualRate)

// ── Products ──────────────────────────────────────────────
router.get('/products', getProducts)
router.get('/products/:id', getProduct)
router.post('/products', requireAdmin, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'model', maxCount: 1 }]), createProduct)
router.put('/products/:id', requireAdmin, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'model', maxCount: 1 }]), updateProduct)
router.delete('/products/:id', requireAdmin, deleteProduct)

// ── Reviews ───────────────────────────────────────────────
router.get('/products/:productId/reviews', getReviews)
router.post('/products/:productId/reviews', requireAuth, addReview)
router.delete('/products/:productId/reviews/:reviewId', requireAuth, deleteReview)

// ── Cart ──────────────────────────────────────────────────
router.get('/cart', requireAuth, getCart)
router.post('/cart', requireAuth, addToCart)
router.delete('/cart/:itemId', requireAuth, removeFromCart)

// ── Wishlist ──────────────────────────────────────────────
router.get('/wishlist', requireAuth, getWishlist)
router.post('/wishlist', requireAuth, addToWishlist)

// ── Orders ────────────────────────────────────────────────
router.post('/orders', requireAuth, createOrder)
router.get('/orders', requireAuth, getUserOrders)
router.get('/orders/:id', requireAuth, getOrder)
router.post('/orders/:id/cancel', requireAuth, cancelOrder)
router.get('/admin/orders', requireAdmin, getAllOrders)
router.put('/admin/orders/:id/status', requireAdmin, updateOrderStatus)
router.get('/admin/analytics', requireAdmin, getAnalytics)
router.get('/admin/customers', requireAdmin, getAdminCustomers)

// ── Payments ─────────────────────────────────────────────
router.post('/stripe/create-session', requireAuth, createStripeSession)
router.post('/stripe/verify-session', requireAuth, verifyStripeSession)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
router.post('/esewa/initiate', requireAuth, initiateEsewa)
router.get('/esewa/success', esewaSuccess)

// ── Chatbot ───────────────────────────────────────────────
router.post('/api/chatbot/chat', chat)
router.get('/api/chatbot/history/:sessionId', getChatHistory)

module.exports = router