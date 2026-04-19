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

    // Avatar
    avatar:      { type: String, default: '' }, // path like /uploads/avatars/...

    // Profile details
    phone:       { type: String, default: '' },
    gender:      { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''], default: '' },
    dateOfBirth: { type: Date, default: null },

    // Saved addresses
    addresses: [
        {
            label:    { type: String, default: 'Home' },
            fullName: String,
            phone:    String,
            address:  String,
            city:     String,
            district: String,
            isDefault: { type: Boolean, default: false }
        }
    ],

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