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

// ── CORS must come FIRST, before helmet and static files ──
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Security (after CORS so it doesn't block cross-origin image loads) ──
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}))

// ── Static file serving ──────────────────────────────────
// GLB/3D model files: long cache (7 days)
app.use('/uploads/models', (req, res, next) => {
    res.header('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
    next()
}, express.static('uploads/models'))

// Images and other uploads: moderate cache (1 day)
app.use('/uploads', (req, res, next) => {
    res.header('Cache-Control', 'public, max-age=86400')
    next()
}, express.static('uploads'))

// ── Body parsing middleware ──────────────────────────────
app.use(express.json({ limit: '200mb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false, limit: '200mb' }))

// ── Routes ───────────────────────────────────────────────
app.use('/', require('./routes/authRoutes'))

// ── Cron: daily gold rate scrape at 12:05 PM Nepal time ─
cron.schedule('5 12 * * *', async () => {
    console.log('Running scheduled gold rate scrape at 12:05 PM NPT...')
    try {
        const rate = await GoldRate.findOne()
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