process.env.TZ = 'Asia/Kathmandu'
const dns = require('dns');
const cron = require('node-cron')
const { scrapeGoldRate } = require('./helpers/goldScraper')
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const { mongoose } = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser')

// Runs every day at 12:05 PM
cron.schedule('5 12 * * *', async () => {
    console.log('Running scheduled gold rate scrape...')
    try {
        await scrapeGoldRate()
    } catch (error) {
        console.log('Scheduled scrape failed:', error.message)
    }
})

//database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Database Connected'))
    .catch((err) => console.log('Database not connected', err))

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.use('/', require('./routes/authRoutes'))
app.use('/uploads', express.static('uploads'))
app.use(express.json({ limit: '200mb' }))
app.use(express.urlencoded({ extended: false, limit: '200mb' }))
const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`))