const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')
const GoldRate = require('../models/goldRate')
const nodemailer = require('nodemailer')

const PURITY_MULTIPLIER = {
    '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
    '999': 1.0, '925': 0.925
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

const sendOrderConfirmation = async (email, name, order) => {
    const itemRows = order.items.map(item => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.product?.name || 'Jewellery'}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;text-transform:capitalize">${item.selectedMetal} · ${item.selectedPurity} · ${item.selectedWeight} tola</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs ${item.itemTotal?.toLocaleString()}</td>
        </tr>
    `).join('')

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Order Confirmed — Maryurika #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h1 style="font-size:24px;font-weight:bold;letter-spacing:2px;text-align:center">MARYURIKA</h1>
            <hr style="margin:20px 0"/>
            <h2 style="font-size:18px">Thank you, ${name}! 🎉</h2>
            <p style="color:#666">Your order has been placed successfully. Here's your summary:</p>

            <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0">
                <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Order ID</p>
                <p style="margin:4px 0 0;font-weight:bold;font-family:monospace">#${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>

            <table style="width:100%;border-collapse:collapse">
                <thead>
                    <tr style="background:#000;color:#fff">
                        <th style="padding:10px;text-align:left;font-size:12px">Item</th>
                        <th style="padding:10px;text-align:center;font-size:12px">Details</th>
                        <th style="padding:10px;text-align:right;font-size:12px">Price</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>

            <div style="margin-top:16px;text-align:right">
                <p style="color:#666;font-size:14px">Subtotal: Rs ${order.subtotal?.toLocaleString()}</p>
                ${order.deliveryCharge > 0 ? `<p style="color:#666;font-size:14px">Delivery: Rs ${order.deliveryCharge?.toLocaleString()}</p>` : ''}
                <p style="font-size:16px;font-weight:bold">Total: Rs ${order.grandTotal?.toLocaleString()}</p>
                <p style="color:#666;font-size:13px">Advance Paid: Rs ${order.advancePaid?.toLocaleString()}</p>
            </div>

            <div style="background:#f0f8ff;border-radius:8px;padding:16px;margin:20px 0">
                <p style="margin:0;font-weight:bold">Delivery Type: <span style="text-transform:capitalize">${order.deliveryType}</span></p>
                ${order.deliveryType === 'pickup' ? '<p style="margin:8px 0 0;color:#666">📍 Please visit our store to pick up your order.</p>' : ''}
            </div>

            <p style="color:#666;font-size:13px">You can track your order status in your profile. We will notify you at each step.</p>

            <hr style="margin:20px 0"/>
            <p style="text-align:center;color:#999;font-size:12px">Questions? Chat with us on WhatsApp or reply to this email.</p>
        </div>
        `
    })
}

const calculateItemPrice = (product, goldRate, selectedMetal, selectedPurity, selectedWeight) => {
    const rate = selectedMetal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
    const multiplier = PURITY_MULTIPLIER[selectedPurity] || 1
    const goldCost = selectedWeight * rate * multiplier
    const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
    const tax = subtotal * 0.02
    return {
        goldCost: Math.round(goldCost),
        makingCharge: Math.round(product.makingChargePerTola),
        jartiAmount: Math.round(product.jartiAmount),
        stoneCharge: Math.round(product.stoneCharge),
        tax: Math.round(tax),
        itemTotal: Math.round(subtotal + tax)
    }
}

const createOrder = async (req, res) => {
    try {
        const { items, deliveryType, deliveryAddress, measurements, paymentMethod, notes } = req.body

        if (!items || items.length === 0) return res.json({ error: 'No items in order' })
        if (!deliveryType) return res.json({ error: 'Delivery type is required' })
        if (deliveryType !== 'pickup' && !deliveryAddress?.phone) {
            return res.json({ error: 'Delivery address is required' })
        }

        const goldRate = await GoldRate.findOne()
        if (!goldRate) return res.json({ error: 'Gold rate not set. Please contact admin.' })

        let subtotal = 0
        const orderItems = []

        for (const item of items) {
            const product = await Product.findById(item.productId)
            if (!product) return res.json({ error: `Product not found` })
            if (item.selectedWeight < product.minWeightTola || item.selectedWeight > product.maxWeightTola) {
                return res.json({ error: `Weight out of range for ${product.name}` })
            }
            const pricing = calculateItemPrice(product, goldRate, item.selectedMetal, item.selectedPurity, item.selectedWeight)
            subtotal += pricing.itemTotal * (item.quantity || 1)
            orderItems.push({
                product: product._id,
                selectedMetal: item.selectedMetal,
                selectedPurity: item.selectedPurity,
                selectedWeight: item.selectedWeight,
                quantity: item.quantity || 1,
                ...pricing
            })
        }

        const deliveryCharge = deliveryType === 'pickup' ? 0 : 200
        const tax = Math.round(subtotal * 0.02)
        const totalBeforeDelivery = subtotal
        const grandTotal = subtotal + (deliveryType === 'pickup' ? 0 : deliveryCharge)

        let advancePaid = 0
        if (deliveryType === 'cod') {
            advancePaid = orderItems.reduce((sum, item) => sum + (item.makingCharge + item.jartiAmount) * item.quantity, 0) + deliveryCharge
        } else if (deliveryType === 'pickup') {
            advancePaid = orderItems.reduce((sum, item) => sum + (item.makingCharge + item.jartiAmount) * item.quantity, 0)
        } else {
            advancePaid = grandTotal
        }

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            deliveryType,
            deliveryAddress: deliveryType !== 'pickup' ? deliveryAddress : null,
            deliveryCharge: deliveryType === 'pickup' ? 0 : deliveryCharge,
            measurements: measurements || {},
            subtotal, tax, totalBeforeDelivery, grandTotal,
            paymentStatus: deliveryType === 'online' ? 'fully_paid' : 'advance_paid',
            advancePaid,
            paymentMethod,
            goldRateSnapshot: {
                fineGoldPerTola: goldRate.fineGoldPerTola,
                silverPerTola: goldRate.silverPerTola,
                tejabiGoldPerTola: goldRate.tejabiGoldPerTola
            },
            status: 'working',
            statusHistory: [{ status: 'working', note: 'Order placed' }],
            notes: notes || ''
        })

        // Clear cart
        await User.findByIdAndUpdate(req.user.id, { cart: [] })

        // Send confirmation email
        try {
            const user = await User.findById(req.user.id)
            const populated = await order.populate('items.product')
            await sendOrderConfirmation(user.email, user.name, populated)
        } catch (emailErr) {
            console.log('Email failed (non-critical):', emailErr.message)
        }

        res.json({ message: 'Order placed successfully', order })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product')
        if (!order) return res.json({ error: 'Order not found' })
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.json({ error: 'Not authorized' })
        }
        res.json(order)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name category')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body
        const order = await Order.findById(req.params.id)
        if (!order) return res.json({ error: 'Order not found' })
        order.status = status
        order.statusHistory.push({ status, note: note || '' })
        await order.save()
        res.json({ message: 'Status updated', order })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

module.exports = { createOrder, getUserOrders, getOrder, getAllOrders, updateOrderStatus }