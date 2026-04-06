const mongoose = require('mongoose')
const { Schema } = mongoose

const goldRateSchema = new Schema({
    fineGoldPerTola: {
        type: Number,
        required: true
    },
    tejabiGoldPerTola: {
        type: Number,
        default: 0
    },
    silverPerTola: {
        type: Number,
        required: true
    },
    isManual: {
        type: Boolean,
        default: false  // false = scraped, true = manually set by admin
    },
    lastScraped: {
        type: Date,
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const GoldRate = mongoose.model('GoldRate', goldRateSchema)
module.exports = GoldRate