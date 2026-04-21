process.env.TZ = 'Asia/Kathmandu'

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser')
const cron = require('node-cron')
const { scrapeGoldRate } = require('./helpers/goldScraper')
const GoldRate = require('./models/goldRate')

// Database connection
mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        console.log('Database Connected')

        // Auto scrape on startup if rate is outdated (older than today)
        try {
            const rate = await GoldRate.findOne()
            const today = new Date()
            const isOutdated = !rate || !rate.lastScraped || (
                new Date(rate.lastScraped).toDateString() !== today.toDateString()
            )

            if (isOutdated && (!rate || !rate.isManual)) {
                console.log('Rate is outdated — scraping on startup...')
                await scrapeGoldRate()
            } else {
                console.log('Gold rate is up to date.')
            }
        } catch (error) {
            console.log('Startup scrape failed:', error.message)
        }
    })
    .catch((err) => console.log('Database not connected', err))


// GLB/3D model files: long cache (7 days) — filenames include timestamps so safe
app.use('/uploads/models', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.header('Access-Control-Allow-Methods', 'GET')
    res.header('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
    next()
}, express.static('uploads/models'))

// Other uploads (images): moderate cache (1 day)
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.header('Access-Control-Allow-Methods', 'GET')
    res.header('Cache-Control', 'public, max-age=86400')
    next()
}, express.static('uploads'))

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// Middleware
app.use(express.json({ limit: '200mb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false, limit: '200mb' }))

app.use('/', require('./routes/authRoutes'))

// app.use('/uploads', express.static('uploads'))

// app.use('/', require('./routes/authRoutes'))



// Cron — every day at 12:05 PM Nepal time
cron.schedule('5 12 * * *', async () => {
    console.log('Running scheduled gold rate scrape at 12:05 PM NPT...')
    try {
        const rate = await GoldRate.findOne()
        // Only auto scrape if admin hasn't manually set it today
        if (!rate?.isManual) {
            await scrapeGoldRate()
        } else {
            console.log('Manual rate set by admin — skipping auto scrape.')
        }
    } catch (error) {
        console.log('Scheduled scrape failed:', error.message)
    }
}, {
    timezone: 'Asia/Kathmandu'
})

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`))