const User = require('../models/user')
const { hashPassword, comparePassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../helpers/mailer')
const crypto = require('crypto')

const test = (req, res) => {
    res.json('test is working')
}

// Register Endpoint
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name) return res.json({ error: 'Name is required' })
        if (!password || password.length < 6) return res.json({ error: 'Password must be at least 6 characters' })

        const exist = await User.findOne({ email })
        if (exist && exist.isVerified) {
            return res.json({ error: 'Email is already taken' })
        }

        const hashedPassword = await hashPassword(password)

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString()
        const verifyOtpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

        // If user exists but not verified, update their record
        // Otherwise create a new one
        if (exist && !exist.isVerified) {
            exist.name = name
            exist.password = hashedPassword
            exist.verifyOtp = otp
            exist.verifyOtpExpiry = verifyOtpExpiry
            await exist.save()
        } else {
            await User.create({
                name, email,
                password: hashedPassword,
                verifyOtp: otp,
                verifyOtpExpiry
            })
        }

        await sendOtpEmail(email, otp, 'verify') // 'verify' flag explained in Step 3
        res.json({ message: 'OTP sent to your email. Please verify.' })

    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Login Endpoint
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) return res.json({ error: 'No user found' })

        // ✅ Add this check
        if (!user.isVerified) {
            return res.json({ error: 'Please verify your email before logging in' })
        }

        const match = await comparePassword(password, user.password)
        if (!match) return res.json({ error: 'Passwords do not match' })

        jwt.sign(
            { email: user.email, id: user._id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            {},
            (err, token) => {
                if (err) throw err
                res.cookie('token', token).json(user)
            }
        )
    } catch (error) {
        console.log(error)
    }
}

// Step 1: User submits email → generate OTP and send it
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ error: 'No account found with this email' })
        }

        // Generate 6 digit OTP
        const otp = crypto.randomInt(100000, 999999).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

        user.resetOtp = otp
        user.otpExpiry = otpExpiry
        await user.save()

        await sendOtpEmail(email, otp)

        res.json({ message: 'OTP sent to your email' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Step 2: User submits OTP → verify it
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ error: 'User not found' })
        }
        if (user.resetOtp !== otp) {
            return res.json({ error: 'Invalid OTP' })
        }
        if (user.otpExpiry < Date.now()) {
            return res.json({ error: 'OTP has expired' })
        }

        res.json({ message: 'OTP verified' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Step 3: User submits new password → reset it
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body
        const user = await User.findOne({ email })

        if (!user) return res.json({ error: 'User not found' })
        if (user.resetOtp !== otp) return res.json({ error: 'Invalid OTP' })
        if (user.otpExpiry < Date.now()) return res.json({ error: 'OTP has expired' })
        if (!newPassword || newPassword.length < 6) {
            return res.json({ error: 'Password must be at least 6 characters' })
        }

        user.password = await hashPassword(newPassword)
        user.resetOtp = null
        user.otpExpiry = null
        await user.save()

        res.json({ message: 'Password reset successful' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })

        if (!user) return res.json({ error: 'User not found' })
        if (user.verifyOtp !== otp) return res.json({ error: 'Invalid OTP' })
        if (user.verifyOtpExpiry < Date.now()) return res.json({ error: 'OTP has expired' })

        user.isVerified = true
        user.verifyOtp = null
        user.verifyOtpExpiry = null
        await user.save()

        res.json({ message: 'Email verified successfully! You can now login.' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}


const logout = (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' })
}


const getProfile = (req, res) => {
    const { token } = req.cookies
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) throw err;
            res.json(user)
        })
    } else {
        res.json(null)
    }
}

const getSizeProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('sizeProfile name email')
        if (!user) return res.json({ error: 'User not found' })
        res.json(user)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const updateSizeProfile = async (req, res) => {
    try {
        const { finger, neck, wrist, ankle, notes } = req.body
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                sizeProfile: {
                    finger: finger || null,
                    neck: neck || null,
                    wrist: wrist || null,
                    ankle: ankle || null,
                    notes: notes || ''
                }
            },
            { returnDocument: 'after' }
        )
        res.json({ message: 'Size profile updated', sizeProfile: user.sizeProfile })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}
module.exports = {
    test, registerUser, loginUser, getProfile,
    forgotPassword, verifyOtp, resetPassword, verifyEmail, logout, getSizeProfile, updateSizeProfile
}