const express = require('express');
const router = express.Router()
const cors = require('cors')
const { test, registerUser, loginUser, getProfile, forgotPassword, verifyOtp, resetPassword, verifyEmail, logout } = require('../controllers/authController')
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware')
const { getGoldRate, scrapeRate, setManualRate } = require('../controllers/goldRateController')
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController')
const { upload } = require('../middleware/upload')

// middleware
router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
)

// Auth routes
router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)

// Gold rate routes
router.get('/gold-rate', getGoldRate)
router.post('/gold-rate/scrape', requireAdmin, scrapeRate)
router.post('/gold-rate/manual', requireAdmin, setManualRate)

// Product routes — public
router.get('/products', getProducts)
router.get('/products/:id', getProduct)

// Product routes — admin only
router.post('/products', requireAdmin,
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'model', maxCount: 1 }
    ]),
    createProduct
)
router.put('/products/:id', requireAdmin,
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'model', maxCount: 1 }
    ]),
    updateProduct
)
router.delete('/products/:id', requireAdmin, deleteProduct)

module.exports = router
