const Order  = require('../models/order')
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
                unit_amount: Math.round(item.itemTotal * 100), // NPR uses paisa (1/100)
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
            // {CHECKOUT_SESSION_ID} is filled by Stripe automatically
            success_url: `${process.env.FRONTEND_URL}/order-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
            metadata: { orderId: orderId.toString() }
        })

        res.json({ url: session.url })
    } catch (error) {
        console.error('[Stripe] createStripeSession error:', error.message)
        res.json({ error: 'Stripe session failed: ' + error.message })
    }
}

// Called by OrderSuccess page to verify a completed Stripe payment
// Works in test mode without needing a webhook
const verifyStripeSession = async (req, res) => {
    try {
        const { sessionId, orderId } = req.body
        if (!sessionId || !orderId) return res.json({ error: 'Missing sessionId or orderId' })

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status === 'paid' && session.metadata.orderId === orderId) {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'fully_paid',
                advancePaid: session.amount_total / 100
            })
            return res.json({ success: true })
        }

        res.json({ error: 'Payment not confirmed by Stripe' })
    } catch (error) {
        console.error('[Stripe] verifyStripeSession error:', error.message)
        res.json({ error: 'Verification failed: ' + error.message })
    }
}

// Stripe webhook — called by Stripe after payment (for production)
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } catch (err) {
        console.error('[Stripe Webhook] Signature error:', err.message)
        return res.status(400).json({ error: `Webhook error: ${err.message}` })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const orderId = session.metadata.orderId
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'fully_paid',
            advancePaid: session.amount_total / 100
        })
        console.log(`[Stripe Webhook] Order ${orderId} marked fully_paid`)
    }

    res.json({ received: true })
}

// ── ESEWA ────────────────────────────────────────────────
// eSewa test credentials (RC environment):
//   Merchant ID : EPAYTEST
//   Secret Key  : 8gBm/:&EnhH.1/q
//   Test URL    : https://rc-epay.esewa.com.np/api/epay/main/v2/form
//   Test Phone  : 9806800001 … 9806800005
//   Password    : Nepal@123  |  MPIN: 1122

const initiateEsewa = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findById(orderId)
        if (!order) return res.json({ error: 'Order not found' })
        if (order.user.toString() !== req.user.id) return res.json({ error: 'Not authorized' })

        const merchantId  = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST'
        const secretKey   = process.env.ESEWA_SECRET_KEY  || '8gBm/:&EnhH.1/q'
        const amount      = order.grandTotal
        const totalAmount = amount
        // Use __ as separator — MongoDB ObjectIds are hex (0-9, a-f) so __ is safe
        const transactionUUID = `${orderId}__${Date.now()}`

        // Generate HMAC-SHA256 signature required by eSewa v2
        const message   = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${merchantId}`
        const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64')

        const esewaParams = {
            amount:                  amount,
            tax_amount:              0,
            total_amount:            totalAmount,
            transaction_uuid:        transactionUUID,
            product_code:            merchantId,
            product_service_charge:  0,
            product_delivery_charge: 0,
            success_url:             `${process.env.BACKEND_URL}/esewa/success`,
            failure_url:             `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
            signed_field_names:      'total_amount,transaction_uuid,product_code',
            signature
        }

        // Save transaction UUID to order for later verification
        await Order.findByIdAndUpdate(orderId, { 'metadata.esewaTransactionId': transactionUUID })

        res.json({
            esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
            params: esewaParams
        })
    } catch (error) {
        console.error('[eSewa] initiateEsewa error:', error.message)
        res.json({ error: 'eSewa initiation failed: ' + error.message })
    }
}

// eSewa success callback (GET from eSewa server)
const esewaSuccess = async (req, res) => {
    try {
        const { data: encodedData } = req.query
        if (!encodedData) return res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)

        // Decode base64 JSON response from eSewa
        const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'))

        if (decodedData.status !== 'COMPLETE') {
            console.log('[eSewa] Payment not complete:', decodedData.status)
            return res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)
        }

        // Verify the response signature
        const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
        const message   = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${decodedData.product_code},signed_field_names=${decodedData.signed_field_names}`
        const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64')

        if (signature !== decodedData.signature) {
            console.log('[eSewa] Signature mismatch — possible fraud')
            return res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)
        }

        // Extract orderId — we used __ as separator so split is safe
        const transactionUUID = decodedData.transaction_uuid
        const orderId = transactionUUID.split('__')[0]

        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'fully_paid' })
        console.log(`[eSewa] Order ${orderId} marked fully_paid`)

        res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${orderId}`)
    } catch (error) {
        console.error('[eSewa] esewaSuccess error:', error.message)
        res.redirect(`${process.env.FRONTEND_URL}/checkout?cancelled=true`)
    }
}

module.exports = { createStripeSession, verifyStripeSession, stripeWebhook, initiateEsewa, esewaSuccess }