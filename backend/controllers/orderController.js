const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')
const GoldRate = require('../models/goldRate')

const PURITY_MULTIPLIER = {
    '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
    '999': 1.0, '925': 0.925
}

// Calculate price for one item on backend (user can't manipulate this)
const calculateItemPrice = (product, goldRate, selectedMetal, selectedPurity, selectedWeight) => {
    const rate = selectedMetal === 'silver'
        ? goldRate.silverPerTola
        : goldRate.fineGoldPerTola
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

// Create order
const createOrder = async (req, res) => {
    try {
        const {
            items,           // [{ productId, selectedMetal, selectedPurity, selectedWeight, quantity }]
            deliveryType,    // 'online' | 'cod' | 'pickup'
            deliveryAddress,
            measurements,   // { finger, neck, wrist, ankle, notes }
            paymentMethod,
            notes
        } = req.body

        if (!items || items.length === 0) return res.json({ error: 'No items in order' })
        if (!deliveryType) return res.json({ error: 'Delivery type is required' })
        if (deliveryType !== 'pickup' && !deliveryAddress?.phone) {
            return res.json({ error: 'Delivery address is required' })
        }

        // Get current gold rate
        const goldRate = await GoldRate.findOne()
        if (!goldRate) return res.json({ error: 'Gold rate not set. Please contact admin.' })

        // Calculate prices for each item on backend
        let subtotal = 0
        const orderItems = []

        for (const item of items) {
            const product = await Product.findById(item.productId)
            if (!product) return res.json({ error: `Product not found: ${item.productId}` })

            // Validate weight range
            if (item.selectedWeight < product.minWeightTola || item.selectedWeight > product.maxWeightTola) {
                return res.json({ error: `Weight out of range for ${product.name}` })
            }

            const pricing = calculateItemPrice(
                product, goldRate,
                item.selectedMetal, item.selectedPurity, item.selectedWeight
            )

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

        // Delivery charge — 0 for pickup
        const deliveryCharge = deliveryType === 'pickup' ? 0 : 200 // flat Rs 200 for now

        const tax = Math.round(subtotal * 0.02) // already included in item prices but storing separately
        const totalBeforeDelivery = subtotal
        const grandTotal = subtotal + (deliveryType === 'pickup' ? 0 : deliveryCharge)

        // Advance payment calculation
        let advancePaid = 0
        if (deliveryType === 'cod') {
            // Advance = making charges + jarti + delivery charge
            advancePaid = orderItems.reduce((sum, item) => {
                return sum + (item.makingCharge + item.jartiAmount) * item.quantity
            }, 0) + deliveryCharge
        } else if (deliveryType === 'pickup') {
            // Advance = making charges + jarti only
            advancePaid = orderItems.reduce((sum, item) => {
                return sum + (item.makingCharge + item.jartiAmount) * item.quantity
            }, 0)
        } else {
            // Full online payment
            advancePaid = grandTotal
        }

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            deliveryType,
            deliveryAddress: deliveryType !== 'pickup' ? deliveryAddress : null,
            deliveryCharge: deliveryType === 'pickup' ? 0 : deliveryCharge,
            measurements: measurements || {},
            subtotal,
            tax,
            totalBeforeDelivery,
            grandTotal,
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

        // Clear user cart after order
        await User.findByIdAndUpdate(req.user.id, { cart: [] })

        res.json({ message: 'Order placed successfully', order })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Get user's orders
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

// Get single order
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

// Admin — get all orders
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

// Admin — update order status
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