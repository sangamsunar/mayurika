const express = require('express')
const router = express.Router()
const cors = require('cors')

const { test, registerUser, loginUser, getProfile, forgotPassword, verifyOtp, resetPassword, verifyEmail, logout, getSizeProfile, updateSizeProfile } = require('../controllers/authController')
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware')
const { getGoldRate, scrapeRate, setManualRate } = require('../controllers/goldRateController')
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController')
const { addToCart, removeFromCart, getCart, addToWishlist, getWishlist } = require('../controllers/cartWishlistController')
const { createOrder, getUserOrders, getOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController')
const { upload } = require('../middleware/upload')

router.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

// ── Auth ─────────────────────────────────────────────────
router.get('/',                   test)
router.post('/register',          registerUser)
router.post('/login',             loginUser)
router.get('/profile',            getProfile)
router.post('/logout',            logout)
router.post('/forgot-password',   forgotPassword)
router.post('/verify-otp',        verifyOtp)
router.post('/reset-password',    resetPassword)
router.post('/verify-email',      verifyEmail)

// ── Size Profile ─────────────────────────────────────────
router.get('/size-profile',       requireAuth, getSizeProfile)
router.put('/size-profile',       requireAuth, updateSizeProfile)

// ── Gold Rate ─────────────────────────────────────────────
router.get('/gold-rate',          getGoldRate)
router.post('/gold-rate/scrape',  requireAdmin, scrapeRate)
router.post('/gold-rate/manual',  requireAdmin, setManualRate)

// ── Products — public ─────────────────────────────────────
router.get('/products',           getProducts)
router.get('/products/:id',       getProduct)

// ── Products — admin only ─────────────────────────────────
router.post('/products',          requireAdmin, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'model', maxCount: 1 }]), createProduct)
router.put('/products/:id',       requireAdmin, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'model', maxCount: 1 }]), updateProduct)
router.delete('/products/:id',    requireAdmin, deleteProduct)

// ── Cart ──────────────────────────────────────────────────
router.get('/cart',               requireAuth, getCart)
router.post('/cart',              requireAuth, addToCart)
router.delete('/cart/:itemId',    requireAuth, removeFromCart)

// ── Wishlist ──────────────────────────────────────────────
router.get('/wishlist',           requireAuth, getWishlist)
router.post('/wishlist',          requireAuth, addToWishlist)

// ── Orders ────────────────────────────────────────────────
router.post('/orders',            requireAuth, createOrder)
router.get('/orders',             requireAuth, getUserOrders)
router.get('/orders/:id',         requireAuth, getOrder)

// ── Orders — admin only ───────────────────────────────────
router.get('/admin/orders',       requireAdmin, getAllOrders)
router.put('/admin/orders/:id/status', requireAdmin, updateOrderStatus)

module.exports = router