const axios = require('axios')
const cheerio = require('cheerio')
const GoldRate = require('../models/goldRate')



const scrapeGoldRate = async () => {
    try {
        const { data } = await axios.get('https://fenegosida.org', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        const $ = cheerio.load(data)

        // Get all rate divs — there are 2 sets (gms and tola)
        // We want the SECOND set (tola) so we skip the first 3
        const allRates = []
        $('#vtab .rate-gold b, #vtab .rate-silver b').each((i, el) => {
            allRates.push($(el).text().trim())
        })

        console.log('All rates:', allRates)
        // allRates = [gms_fineGold, gms_tejabi, gms_silver, tola_fineGold, tola_tejabi, tola_silver]
        //                  0              1           2            3               4           5

        // Tola values start at index 3
        const fineGold = parseInt(allRates[3])
        const tejabiGold = parseInt(allRates[4])
        const silver = parseInt(allRates[5])

        console.log('Tola rates:', { fineGold, tejabiGold, silver })

        if (isNaN(fineGold) || isNaN(silver)) {
            throw new Error(`Parsed values are invalid — fineGold: ${fineGold}, silver: ${silver}`)
        }

        await GoldRate.findOneAndUpdate(
            {},
            {
                fineGoldPerTola: fineGold,
                tejabiGoldPerTola: isNaN(tejabiGold) ? 0 : tejabiGold,
                silverPerTola: silver,
                lastScraped: new Date(),
                isManual: false
            },
            { upsert: true, returnDocument: 'after' }
        )

        console.log(`Gold rate updated — Fine: ${fineGold}, Tejabi: ${tejabiGold}, Silver: ${silver}`)
        return { fineGold, tejabiGold, silver }

    } catch (error) {
        console.log('Scraping failed:', error.message)
        throw error
    }
}

module.exports = { scrapeGoldRate }