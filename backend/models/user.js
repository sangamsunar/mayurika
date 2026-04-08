const mongoose = require('mongoose')
const { Schema } = mongoose
const userSchema = Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    resetOtp: String,
    otpExpiry: Date,
    verifyOtp: String,
    verifyOtpExpiry: Date,
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            selectedMetal: String,
            selectedPurity: String,
            selectedWeight: Number,
            quantity: { type: Number, default: 1 }
        }
    ],
    wishlist: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
        }
    ]
})

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel;


