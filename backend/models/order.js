const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            selectedMetal:  { type: String, required: true },
            selectedPurity: { type: String, required: true },
            selectedWeight: { type: Number, required: true },
            quantity:       { type: Number, default: 1 },
            // Snapshot price at time of order
            goldCost:       Number,
            makingCharge:   Number,
            jartiAmount:    Number,
            stoneCharge:    Number,
            tax:            Number,
            itemTotal:      Number
        }
    ],

    // Delivery
    deliveryType: {
        type: String,
        enum: ['online', 'cod', 'pickup'],
        required: true
    },
    deliveryAddress: {
        fullName:   String,
        phone:      String,
        address:    String,
        city:       String,
        district:   String,
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },

    // Sizing
    measurements: {
        finger: { type: Number, default: null },
        neck:   { type: Number, default: null },
        wrist:  { type: Number, default: null },
        ankle:  { type: Number, default: null },
        notes:  { type: String, default: '' }
    },

    // Pricing snapshot
    subtotal:       { type: Number, required: true },
    tax:            { type: Number, required: true },
    totalBeforeDelivery: { type: Number, required: true },
    grandTotal:     { type: Number, required: true },

    // Payment
    paymentStatus: {
        type: String,
        enum: ['pending', 'advance_paid', 'fully_paid'],
        default: 'pending'
    },
    advancePaid:    { type: Number, default: 0 },
    paymentMethod:  { type: String, enum: ['esewa', 'khalti', 'cod', 'pickup_cash'] },

    // Gold rate snapshot at time of order
    goldRateSnapshot: {
        fineGoldPerTola:  Number,
        silverPerTola:    Number,
        tejabiGoldPerTola: Number
    },

    // Order status
    status: {
        type: String,
        enum: ['working', 'finishing', 'packaging', 'transit', 'ready_for_pickup', 'delivered', 'cancelled'],
        default: 'working'
    },
    statusHistory: [
        {
            status:    String,
            updatedAt: { type: Date, default: Date.now },
            note:      String
        }
    ],

    notes: { type: String, default: '' }

}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)
module.exports = Order