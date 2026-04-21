/**
 * Order seeder — creates realistic demo orders + users for analytics.
 *
 * Run from backend directory:
 *   node seed_orders.js
 *
 * WARNING: This will add test data. Run only in development.
 */

const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const Order   = require('./models/order')
const Product = require('./models/product')
const User    = require('./models/user')

// ── Helpers ───────────────────────────────────────────────────────────────────
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick  = arr => arr[Math.floor(Math.random() * arr.length)]
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d }

const FIRST_NAMES = ['Sita', 'Ram', 'Priya', 'Aarav', 'Anjali', 'Rohan', 'Deepa', 'Bikash', 'Sunita', 'Pratik', 'Nisha', 'Rajesh', 'Kamala', 'Suresh', 'Mina', 'Arun', 'Puja', 'Dinesh', 'Laxmi', 'Manoj']
const LAST_NAMES  = ['Sharma', 'Thapa', 'Shrestha', 'KC', 'Adhikari', 'Rai', 'Gurung', 'Limbu', 'Tamang', 'Magar', 'Karki', 'Bista', 'Poudel', 'Regmi', 'Joshi']
const CITIES      = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Birgunj', 'Dharan', 'Butwal', 'Hetauda', 'Chitwan']
const PAYMENTS    = ['esewa', 'khalti', 'cod', 'pickup_cash', 'stripe']
const DELIVERY    = ['online', 'cod', 'pickup']
const STATUSES    = ['working', 'finishing', 'packaging', 'transit', 'ready_for_pickup', 'delivered', 'delivered', 'delivered', 'cancelled']
const GENDERS     = ['male', 'female', 'unisex', 'female', 'female']
const METALS      = ['gold', 'gold', 'gold', 'silver']
const GOLD_PURITIES   = ['22K', '22K', '18K', '24K', '23K']
const SILVER_PURITIES = ['925', '999']

const GOLD_RATE   = { fineGoldPerTola: 138500, silverPerTola: 1820, tejabiGoldPerTola: 137200 }

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  console.log('✓ Connected to MongoDB')

  const products = await Product.find({ inStock: true }).lean()
  if (!products.length) { console.error('✗ No products found — run seed_products.js first'); process.exit(1) }
  console.log(`✓ Found ${products.length} products`)

  // ── Create 30 demo users ──────────────────────────────────────────────────
  const bcrypt = require('bcryptjs')
  const hash   = await bcrypt.hash('Demo1234!', 10)

  const userDocs = []
  for (let i = 0; i < 30; i++) {
    const first  = pick(FIRST_NAMES)
    const last   = pick(LAST_NAMES)
    const gender = pick(GENDERS)
    userDocs.push({
      name:       `${first} ${last}`,
      email:      `demo.${first.toLowerCase()}${i}@maryurika.test`,
      password:   hash,
      gender,
      phone:      `98${rand(10000000, 99999999)}`,
      isVerified: true,
      role:       'user',
      createdAt:  daysAgo(rand(1, 180)),
    })
  }

  let users = []
  for (const u of userDocs) {
    const exists = await User.findOne({ email: u.email })
    if (!exists) {
      const created = await User.create(u)
      users.push(created)
    } else {
      users.push(exists)
    }
  }
  console.log(`✓ Users ready (${users.length})`)

  // ── Create 120 realistic orders spread over last 6 months ────────────────
  const orders = []
  const totalOrders = 120

  for (let i = 0; i < totalOrders; i++) {
    const user    = pick(users)
    const daysOld = rand(0, 180)
    const orderDate = daysAgo(daysOld)

    // Pick 1–3 items
    const itemCount = rand(1, 3)
    const items = []
    let subtotal = 0

    for (let j = 0; j < itemCount; j++) {
      const product = pick(products)
      const metal   = pick(product.metalOptions?.length ? product.metalOptions : ['gold'])
      const purity  = metal === 'silver'
        ? pick(product.purityOptions?.silver?.length ? product.purityOptions.silver : SILVER_PURITIES)
        : pick(product.purityOptions?.gold?.length   ? product.purityOptions.gold   : GOLD_PURITIES)

      const PURITY_MULT = { '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75, '999': 1.0, '925': 0.925 }
      const weight  = parseFloat((rand(product.minWeightTola * 10, product.maxWeightTola * 10) / 10).toFixed(1))
      const rate    = metal === 'silver' ? GOLD_RATE.silverPerTola : GOLD_RATE.fineGoldPerTola
      const goldCost     = weight * rate * (PURITY_MULT[purity] || 1)
      const makingCharge = weight * (product.makingChargePerTola || 2000)
      const jarti        = product.jartiAmount || 0
      const stone        = product.stoneCharge || 0
      const itemBase     = goldCost + makingCharge + jarti + stone
      const tax          = itemBase * 0.02
      const itemTotal    = Math.round(itemBase + tax)
      subtotal += itemTotal

      items.push({
        product:        product._id,
        selectedMetal:  metal,
        selectedPurity: purity,
        selectedWeight: weight,
        quantity:       1,
        goldCost:       Math.round(goldCost),
        makingCharge:   Math.round(makingCharge),
        jartiAmount:    jarti,
        stoneCharge:    stone,
        tax:            Math.round(tax),
        itemTotal,
      })
    }

    const deliveryType   = pick(DELIVERY)
    const deliveryCharge = deliveryType === 'online' ? 200 : 0
    const tax            = Math.round(subtotal * 0.02)
    const totalBeforeDelivery = subtotal + tax
    const grandTotal     = totalBeforeDelivery + deliveryCharge
    const status         = daysOld < 3 ? pick(['working', 'finishing']) : pick(STATUSES)
    const paymentMethod  = pick(PAYMENTS)
    const paymentStatus  = status === 'delivered'
      ? pick(['fully_paid', 'fully_paid', 'advance_paid'])
      : pick(['pending', 'advance_paid'])
    const advancePaid    = paymentStatus === 'fully_paid'
      ? grandTotal
      : paymentStatus === 'advance_paid'
      ? Math.round(grandTotal * 0.3)
      : 0

    const city = pick(CITIES)
    orders.push({
      user:           user._id,
      items,
      deliveryType,
      deliveryAddress: deliveryType !== 'pickup' ? {
        fullName:  user.name,
        phone:     user.phone,
        address:   `${rand(1, 200)} Street, Ward ${rand(1, 32)}`,
        city,
        district:  city,
      } : undefined,
      deliveryCharge,
      measurements: {},
      subtotal,
      tax,
      totalBeforeDelivery,
      grandTotal,
      paymentStatus,
      advancePaid,
      paymentMethod,
      goldRateSnapshot: GOLD_RATE,
      status,
      statusHistory: [{ status, updatedAt: orderDate, note: 'Order placed' }],
      notes: '',
      createdAt: orderDate,
      updatedAt: orderDate,
    })
  }

  await Order.insertMany(orders)
  console.log(`✓ Inserted ${orders.length} demo orders`)
  console.log('\n🎉 Seed complete! Open the analytics dashboard to see your data.')
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
