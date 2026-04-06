const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['ring', 'necklace', 'bracelet', 'earring', 'anklet', 'chain', 'cufflink', 'tayo', 'tilhari', 'churra', 'pote', 'kantha', 'set'],
        required: true
    },
    style: {
        type: {
            type: String,
            enum: ['traditional', 'wedding', 'casual', 'youth'],
            required: true
        },
        subStyle: {
            type: String,
            enum: ['gothic', 'cybersilian', 'streetwear', 'minimalist', 'cottagecore', null],
            default: null
        }
    },
    occasion: {
        type: String,
        enum: ['wedding', 'casual', 'festival', 'daily', 'gifting'],
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        required: true
    },
    ageGroup: {
        type: String,
        enum: ['adult', 'youth', 'kids'],
        default: 'adult'
    },
    metalOptions: [{
        type: String,
        enum: ['gold', 'silver', 'roseGold'],
    }],
    purityOptions: {
        gold: [{
            type: String,
            enum: ['24K', '23K', '22K', '18K']
        }],
        silver: [{
            type: String,
            enum: ['999', '925']
        }]
    },
    minWeightTola: {
        type: Number,
        required: true
    },
    maxWeightTola: {
        type: Number,
        required: true
    },
    makingChargePerTola: {
        type: Number,
        required: true
    },
    jartiAmount: {
        type: Number,
        required: true,
        default: 0
    },
    stoneCharge: {
        type: Number,
        default: 0
    },
    measurementType: {
        type: String,
        enum: ['circumference', 'length', 'diameter', 'none'],
        default: 'none'
    },
    images: [String],
    model3D: {
        type: String,
        default: null
    },
    isTraditional: {
        type: Boolean,
        default: false
    },
    hallmark: {
        type: Boolean,
        default: false
    },
    customizable: {
        type: Boolean,
        default: true
    },
    pickupAvailable: {
        type: Boolean,
        default: true
    },
    region: {
        type: String,
        default: 'Nepali'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
module.exports = Product

