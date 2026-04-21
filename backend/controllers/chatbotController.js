const axios = require('axios')
const Chat = require('../models/chat')
const Product = require('../models/product')
const GoldRate = require('../models/goldRate')

// ── keyword maps for intent detection ────────────────────────────────────────
const CATEGORY_MAP = {
    ring: 'ring', rings: 'ring',
    necklace: 'necklace', necklaces: 'necklace', haar: 'necklace', hara: 'necklace',
    bracelet: 'bracelet', bracelets: 'bracelet', kada: 'bracelet',
    earring: 'earring', earrings: 'earring', 'ear ring': 'earring', kaan: 'earring',
    anklet: 'anklet', anklets: 'anklet', payal: 'anklet',
    chain: 'chain', chains: 'chain',
    cufflink: 'cufflink', cufflinks: 'cufflink',
    tayo: 'tayo',
    tilhari: 'tilhari',
    churra: 'churra', bangles: 'churra', bangle: 'churra',
    pote: 'pote',
    kantha: 'kantha',
    set: 'set', sets: 'set',
}

const METAL_MAP = {
    gold: 'gold', golden: 'gold', suna: 'gold',
    silver: 'silver', chandi: 'silver',
}

const STYLE_MAP = {
    traditional: 'traditional', classic: 'traditional', nepali: 'traditional',
    wedding: 'wedding', bridal: 'wedding', bride: 'wedding',
    casual: 'casual', everyday: 'casual', daily: 'casual',
    youth: 'youth', modern: 'youth', trendy: 'youth',
}

const OCCASION_MAP = {
    wedding: 'wedding', anniversary: 'wedding',
    festival: 'festival', dashain: 'festival', tihar: 'festival', teej: 'festival',
    gift: 'gifting', gifting: 'gifting', present: 'gifting',
    daily: 'daily',
    casual: 'casual',
}

const GENDER_MAP = {
    women: 'female', woman: 'female', female: 'female', ladies: 'female', girls: 'female', girl: 'female',
    men: 'male', man: 'male', male: 'male', boys: 'male', boy: 'male', gents: 'male',
    unisex: 'unisex',
}

// ── extract intent from user message ─────────────────────────────────────────
function extractIntent(message) {
    const lower = message.toLowerCase()
    const intent = {}

    // Check multi-word first

    for (const [kw, val] of Object.entries(CATEGORY_MAP)) {
        if (lower.includes(kw)) { intent.category = val; break }
    }
    if (!intent.metal) {
        for (const [kw, val] of Object.entries(METAL_MAP)) {
            if (lower.includes(kw)) { intent.metal = val; break }
        }
    }
    for (const [kw, val] of Object.entries(STYLE_MAP)) {
        if (lower.includes(kw)) { intent.style = val; break }
    }
    for (const [kw, val] of Object.entries(OCCASION_MAP)) {
        if (lower.includes(kw)) { intent.occasion = val; break }
    }
    for (const [kw, val] of Object.entries(GENDER_MAP)) {
        if (lower.includes(kw)) { intent.gender = val; break }
    }

    // Price hints
    if (lower.includes('cheap') || lower.includes('affordable') || lower.includes('budget')) {
        intent.priceHint = 'low'
    } else if (lower.includes('premium') || lower.includes('luxury') || lower.includes('expensive')) {
        intent.priceHint = 'high'
    }

    return intent
}

// ── find products matching intent ─────────────────────────────────────────────
async function findProducts(intent) {
    if (Object.keys(intent).length === 0) return []

    const query = { inStock: true }

    if (intent.category) query.category = intent.category
    if (intent.metal) query.metalOptions = intent.metal
    if (intent.style) query['style.type'] = intent.style
    if (intent.occasion) query.occasion = intent.occasion
    if (intent.gender) query.gender = { $in: [intent.gender, 'unisex'] }

    try {
        let products = await Product.find(query).limit(6).lean()

        // Loosen query if nothing found
        if (products.length === 0 && intent.category) {
            products = await Product.find({ category: intent.category, inStock: true }).limit(3).lean()
        }
        if (products.length === 0 && intent.metal) {
            products = await Product.find({ metalOptions: intent.metal, inStock: true }).limit(3).lean()
        }

        return products.slice(0, 3)
    } catch {
        return []
    }
}

// ── call Groq API (free, fast, OpenAI-compatible) ────────────────────────────
async function callGroq(userMessage, products, conversationHistory = [], goldRate = null, totalProducts = null) {
    const productContext = products.length > 0
        ? `\n\nMatching products found:\n${products.map(p =>
            `- ${p.name} (${p.category}, ${p.metalOptions?.join('/')}, ${p.minWeightTola}–${p.maxWeightTola} tola)`
        ).join('\n')}`
        : ''

    const catalogContext = totalProducts === 0
        ? '\n\nIMPORTANT: The store catalogue is currently empty — no products are listed yet. Do NOT describe or list any products. If asked what is available, honestly say the catalogue is being set up and invite them to check back soon.'
        : totalProducts > 0
            ? `\n\nThe store currently has ${totalProducts} product${totalProducts !== 1 ? 's' : ''} in stock.`
            : ''

    const goldContext = goldRate
        ? `\n\nCurrent live gold & silver rates from our system (as of today):
- Fine Gold (9999): Rs ${goldRate.fineGoldPerTola?.toLocaleString()} per tola
- Tejabi Gold: Rs ${goldRate.tejabiGoldPerTola?.toLocaleString()} per tola
- Silver: Rs ${goldRate.silverPerTola?.toLocaleString()} per tola
Always use these exact figures when answering gold or silver rate questions.`
        : ''

    const systemPrompt = `You are Mayu, Mayurika's friendly AI jewellery assistant. Your name is Mayu. Mayurika is a Nepali online jewellery store offering traditional and modern gold, silver and rose gold jewellery with interactive 3D viewing and live gold rate pricing.
Your role: Help customers find the right jewellery, answer questions about products, gold rates, customisation (metal type and purity), delivery and care. Be warm, concise and helpful. Keep replies under 3 sentences. Do not mention competitor stores. Do not make up gold rates — only use the rates provided below if available.${catalogContext}${goldContext}${productContext}`

    const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
    ]

    try {
        const { data } = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages,
                max_tokens: 200,
                temperature: 0.65,
                top_p: 0.9,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            }
        )

        return data.choices?.[0]?.message?.content?.trim() || fallbackResponse(userMessage, products, goldRate)
    } catch (err) {
        if (err.response?.status === 429) {
            return 'I\'m a little busy right now — please try again in a moment! 🙏'
        }
        console.error('Groq error:', err.response?.data?.error?.message || err.message)
        return fallbackResponse(userMessage, products, goldRate)
    }
}

// ── rule-based fallback when Groq is unavailable ─────────────────────────────
function fallbackResponse(message, products, goldRate = null) {
    const lower = message.toLowerCase()

    if (lower.includes('gold rate') || lower.includes('gold price') || lower.includes('tola') || lower.includes('silver')) {
        if (goldRate) {
            return `Today's rates — Fine Gold: Rs ${goldRate.fineGoldPerTola?.toLocaleString()}/tola | Tejabi: Rs ${goldRate.tejabiGoldPerTola?.toLocaleString()}/tola | Silver: Rs ${goldRate.silverPerTola?.toLocaleString()}/tola 🪙`
        }
        return 'Our gold rates are updated daily from live market data. You can see the current rate displayed at the top of our home page! 🪙'
    }
    if (lower.includes('deliver') || lower.includes('ship')) {
        return 'We offer delivery across Nepal with insured courier. Most orders arrive within 3–5 business days. 🚚'
    }
    if (lower.includes('custom') || lower.includes('engrav') || lower.includes('size')) {
        return 'Yes! All our jewellery is customisable — choose your metal, purity and weight from the product page. Contact us for engravings. ✨'
    }
    if (lower.includes('return') || lower.includes('refund')) {
        return 'We have a 7-day return policy for unworn items in original condition. Please visit our Return Policy page for details. 📋'
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) {
        return 'Namaste! 🙏 I\'m Mayu, here to help you find the perfect jewellery. What are you looking for today?'
    }
    if (products.length > 0) {
        return `I found ${products.length} piece${products.length > 1 ? 's' : ''} that might interest you. Click any card below to see it in 3D! ✨`
    }
    return 'I\'d love to help! Could you tell me more — are you looking for a specific jewellery type, metal or occasion? 💍'
}

// ── POST /api/chatbot/chat ────────────────────────────────────────────────────
const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body
        const userId = req.user?.id || null

        if (!message?.trim()) {
            return res.status(400).json({ error: 'Message is required' })
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' })
        }

        // Load or create chat session
        let session = await Chat.findOne({ sessionId })
        if (!session) {
            session = new Chat({ sessionId, userId, messages: [] })
        }

        // Save user message immediately
        session.messages.push({ role: 'user', content: message.trim() })

        // Extract intent → find products → generate reply
        const intent = extractIntent(message)
        const [products, goldRate, totalProducts] = await Promise.all([
            findProducts(intent),
            GoldRate.findOne().lean().catch(() => null),
            Product.countDocuments({ inStock: true }).catch(() => null),
        ])

        // Pass last 4 exchanges as context
        const history = session.messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
        const reply = await callGroq(message, products, history, goldRate, totalProducts)

        // Save assistant message with linked products
        session.messages.push({
            role: 'assistant',
            content: reply,
            products: products.map(p => p._id),
        })

        await session.save()

        res.json({
            reply,
            products: products.map(p => ({
                _id: p._id,
                name: p.name,
                category: p.category,
                metalOptions: p.metalOptions,
                minWeightTola: p.minWeightTola,
                makingChargePerTola: p.makingChargePerTola,
                images: p.images,
                rating: p.rating,
            })),
            sessionId,
        })
    } catch (err) {
        console.error('chatbot chat error:', err)
        res.status(500).json({ error: 'Something went wrong. Please try again.' })
    }
}

// ── GET /api/chatbot/history/:sessionId ──────────────────────────────────────
const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params
        const session = await Chat.findOne({ sessionId })
            .populate('messages.products', 'name category images metalOptions minWeightTola makingChargePerTola rating')
            .lean()

        if (!session) return res.json({ messages: [] })

        res.json({ messages: session.messages })
    } catch (err) {
        console.error('chatbot history error:', err)
        res.status(500).json({ error: 'Failed to fetch history' })
    }
}

module.exports = { chat, getChatHistory }
