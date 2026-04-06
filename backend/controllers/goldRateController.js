const GoldRate = require('../models/goldRate')
const { scrapeGoldRate } = require('../helpers/goldScraper')

// Get current rate — used by frontend to display and calculate price
const getGoldRate = async (req, res) => {
    try {
        const rate = await GoldRate.findOne()
        if (!rate) {
            return res.json({ error: 'No gold rate found. Admin needs to set it.' })
        }
        res.json(rate)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Admin triggers scrape manually
const scrapeRate = async (req, res) => {
    try {
        const rate = await scrapeGoldRate()
        res.json({ message: 'Rate scraped successfully', rate })
    } catch (error) {
        res.json({ error: 'Scraping failed. Try setting manually.' })
    }
}

// Admin sets rate manually
const setManualRate = async (req, res) => {
    try {
        const { fineGoldPerTola, tejabiGoldPerTola, silverPerTola } = req.body

        if (!fineGoldPerTola || !silverPerTola) {
            return res.json({ error: 'Fine gold and silver rates are required' })
        }

        const rate = await GoldRate.findOneAndUpdate(
            {},
            {
                fineGoldPerTola,
                tejabiGoldPerTola: tejabiGoldPerTola || 0,
                silverPerTola,
                isManual: true,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        )

        res.json({ message: 'Rate updated manually', rate })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

module.exports = { getGoldRate, scrapeRate, setManualRate }