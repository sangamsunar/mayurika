const Order = require('../models/order')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const crypto = require('crypto')

// ── STRIPE ────────────────────────────────────────────────

const createStripeSession = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findById(orderId).populate('items.product')
        if (!order) return res.json({ error: 'Order not found' })
        if (order.user.toString() !== req.user.id) return res.json({ error: 'Not authorized' })

        const lineItems = order.items.map(item => ({
            price_data: {
                currency: 'npr',
                product_data: {
                    name: item.product?.name || 'Jewellery',
                    description: `${item.selectedMetal} · ${item.selectedPurity} · ${item.selectedWeight} tola`,
                },
                unit_amount: Math.round(item.itemTotal * 100), // Stripe uses smallest unit
            },
            quantity: item.quantity || 1,
        }))

        // Add delivery charge if applicable
        if (order.deliveryCharge > 0) {
            lineItems.push({
                price_data: {
                    currency: 'npr',
                    product_data: { name: 'Delivery Charge' },
                    unit_amount: order.deliveryCharge * 100,
                },
                quantity: 1,
            })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/order-success?orderId=${orderId}`,
            cancel_url:  `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
            metadata: { orderId: orderId.toString() }
        })

        res.json({ url: session.url })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Stripe session failed' })
    }
}

// Stripe webhook — called by Stripe after payment
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        return res.status(400).json({ error: `Webhook error: ${err.message}` })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const orderId = session.metadata.orderId
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'fully_paid',
            advancePaid: session.amount_total / 100
        })
    }

    res.json({ received: true })
}

// ── ESEWA ────────────────────────────────────────────────
// eSewa test credentials:
// Merchant ID: EPAYTEST
// Secret Key:  8gBm/:&EnhH.1/q  (test)
// Test URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form

const initiateEsewa = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findById(orderId)
        if (!order) return res.json({ error: 'Order not found' })
        if (order.user.toString() !== req.user.id) return res.json({ error: 'Not authorized' })

        const merchantId  = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST'
        const secretKey   = process.env.ESEWA_SECRET_KEY  || '8gBm/:&EnhH.1/q'
        const amount      = order.grandTotal
        const taxAmount   = 0
        const totalAmount = amount
        const transactionUUID = `${orderId}-${Date.now()}`

        // Generate HMAC SHA256 signature
        const message   = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${merchantId}`
        const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64')

        const esewaParams = {
            amount:           amount,
            tax_amount:       taxAmount,
            total_amount:     totalAmount,
            transaction_uuid: transactionUUID,
            product_code:     merchantId,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url:      `${process.env.BACKEND_URL}/esewa/success`,
            failure_url:      `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature
        }

        // Save transaction UUID to order for verification later
        await Order.findByIdAndUpdate(orderId, { 'metadata.esewaTransactionId': transactionUUID })

        res.json({
            esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
            params: esewaParams
        })
    } catch (error) {
        console.log(error)
        res.json({ error: 'eSewa initiation failed' })
    }
}

// eSewa success callback
const esewaSuccess = async (req, res) => {
    try {
        const { data: encodedData } = req.query
        if (!encodedData) return res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)

        // Decode base64 response
        const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'))

        if (decodedData.status !== 'COMPLETE') {
            return res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)
        }

        // Verify signature
        const secretKey  = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
        const message    = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${decodedData.product_code},signed_field_names=${decodedData.signed_field_names}`
        const signature  = crypto.createHmac('sha256', secretKey).update(message).digest('base64')

        if (signature !== decodedData.signature) {
            return res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)
        }

        // Find order by transaction UUID and mark paid
        const transactionUUID = decodedData.transaction_uuid
        const orderId = transactionUUID.split('-')[0]
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'fully_paid' })

        res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${orderId}`)
    } catch (error) {
        console.log(error)
        res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)
    }
}

module.exports = { createStripeSession, stripeWebhook, initiateEsewa, esewaSuccess }