const express = require('express');
const router = express.Router() //Router() is a function that allows us to use with epxress framework
const cors = require('cors')
const { test, registerUser, loginUser, getProfile, forgotPassword, verifyOtp, resetPassword, verifyEmail } = require('../controllers/authController')
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware')

//middleware
router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
)

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)

// Protected routes
// router.post('/cart', requireAuth, addToCart)           // logged in users only
// router.post('/wishlist', requireAuth, addToWishlist)   // logged in users only
// router.get('/admin', requireAdmin, getAdminData)       // admins only
module.exports = router