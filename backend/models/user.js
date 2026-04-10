const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guest'],
        default: 'user'
    },
    resetOtp: String,
    otpExpiry: Date,
    verifyOtp: String,
    verifyOtpExpiry: Date,

    // Size profile
    sizeProfile: {
        finger:      { type: Number, default: null }, // circumference in mm
        neck:        { type: Number, default: null }, // circumference in cm
        wrist:       { type: Number, default: null }, // circumference in cm
        ankle:       { type: Number, default: null }, // circumference in cm
        notes:       { type: String, default: '' }
    },

    // Cart
    cart: [
        {
            product:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            selectedMetal:  String,
            selectedPurity: String,
            selectedWeight: Number,
            quantity:       { type: Number, default: 1 }
        }
    ],

    // Wishlist
    wishlist: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
        }
    ]
}, { timestamps: true })

const UserModel = mongoose.model('User', userSchema)
module.exports = UserModel