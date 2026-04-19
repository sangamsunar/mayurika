import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const STATUS_STEPS = [
    { key: 'working',   label: 'Being Made',  icon: '🔨' },
    { key: 'finishing', label: 'Finishing',    icon: '✨' },
    { key: 'packaging', label: 'Packaging',    icon: '📦' },
    { key: 'transit',   label: 'On the Way',   icon: '🚚' },
    { key: 'delivered', label: 'Delivered',    icon: '🎉' },
]

function printReceipt(order) {
    const itemRows = (order.items || []).map(item => `
        <tr>
            <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0">${item.product?.name || 'Jewellery'}</td>
            <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;color:#666;text-transform:capitalize">${item.selectedMetal} · ${item.selectedPurity} · ${item.selectedWeight}t × ${item.quantity || 1}</td>
            <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right">Rs ${(item.itemTotal || 0).toLocaleString()}</td>
        </tr>
    `).join('')
    const win = window.open('', '_blank', 'width=700,height=900')
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt — Maryurika #${order._id.slice(-8).toUpperCase()}</title>
    <style>
        body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#111}
        h1{letter-spacing:4px;text-align:center;font-size:22px;margin:0}
        .sub{text-align:center;color:#999;font-size:12px;margin:4px 0 24px}
        hr{border:none;border-top:1px solid #eee;margin:16px 0}
        .row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
        .lbl{color:#666}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        thead tr{background:#000;color:#fff}
        th{padding:10px 4px;font-size:11px;text-align:left}
        th:last-child{text-align:right}
        th:nth-child(2){text-align:center}
        .grand{font-size:15px;font-weight:bold}
        .footer{margin-top:40px;text-align:center;font-size:11px;color:#bbb}
        @media print{body{padding:20px}}
    </style></head><body>
    <h1>MARYURIKA</h1>
    <p class="sub">Official Order Receipt</p>
    <hr/>
    <div class="row"><span class="lbl">Order ID</span><span style="font-family:monospace;font-weight:bold">#${order._id.slice(-8).toUpperCase()}</span></div>
    <div class="row"><span class="lbl">Date</span><span>${new Date(order.createdAt).toLocaleDateString('en-NP',{year:'numeric',month:'long',day:'numeric'})}</span></div>
    <div class="row"><span class="lbl">Delivery</span><span style="text-transform:capitalize">${order.deliveryType}</span></div>
    <div class="row"><span class="lbl">Payment</span><span style="text-transform:capitalize">${order.paymentMethod || '—'}</span></div>
    ${order.deliveryAddress?.fullName ? `<div class="row"><span class="lbl">Deliver to</span><span>${order.deliveryAddress.fullName}, ${order.deliveryAddress.address || ''}, ${order.deliveryAddress.city || ''}</span></div>` : ''}
    <hr/>
    <table>
        <thead><tr><th>Item</th><th>Details</th><th style="text-align:right">Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
    </table>
    <div style="margin-top:16px">
        ${order.deliveryCharge > 0 ? `<div class="row"><span class="lbl">Delivery charge</span><span>Rs ${order.deliveryCharge.toLocaleString()}</span></div>` : ''}
        <div class="row grand"><span>Grand Total</span><span>Rs ${(order.grandTotal||0).toLocaleString()}</span></div>
        <div class="row" style="color:#16a34a;font-size:13px"><span>Advance Paid</span><span>Rs ${(order.advancePaid||0).toLocaleString()}</span></div>
        ${order.grandTotal-order.advancePaid > 0 ? `<div class="row" style="color:#ea580c;font-size:12px"><span>Balance due on ${order.deliveryType==='pickup'?'pickup':'delivery'}</span><span>Rs ${(order.grandTotal-order.advancePaid).toLocaleString()}</span></div>` : ''}
    </div>
    <hr/>
    <div class="footer"><p>Thank you for choosing Maryurika Jewellery</p><p>Kathmandu, Nepal · Computer-generated receipt</p></div>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`)
    win.document.close()
}

export default function OrderSuccess() {
    const [params]     = useSearchParams()
    const navigate     = useNavigate()
    const orderId      = params.get('orderId')
    const sessionId    = params.get('session_id') // present only after Stripe redirect

    const [order,   setOrder]   = useState(null)
    const [loading, setLoading] = useState(true)
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        if (!orderId) { navigate('/'); return }

        const run = async () => {
            // If we came back from Stripe, verify the payment with our backend first
            if (sessionId) {
                try {
                    const { data: v } = await axios.post('/stripe/verify-session', { sessionId, orderId })
                    if (v.success) setVerified(true)
                } catch (e) {
                    console.warn('Stripe verify failed (non-critical):', e.message)
                }
            }

            try {
                const { data } = await axios.get(`/orders/${orderId}`)
                setOrder(data)
            } catch {
                // order not found — redirected back
            }
            setLoading(false)
        }

        run()
    }, [orderId, sessionId])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                <span className="text-sm tracking-widest uppercase">Confirming payment…</span>
            </div>
        </div>
    )

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            Order not found
        </div>
    )

    const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full space-y-6">

                {/* Success Header */}
                <div className="bg-white rounded-2xl border p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        ✅
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Order Placed!</h1>
                    <p className="text-gray-500 text-sm">
                        A confirmation email has been sent to your inbox.
                    </p>

                    {/* Stripe verification badge */}
                    {sessionId && (
                        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            verified
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {verified ? '🔒 Stripe payment verified' : '⏳ Verifying payment…'}
                        </div>
                    )}

                    <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 inline-block">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Order ID</p>
                        <p className="font-mono font-bold text-lg">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Payment status */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="font-bold mb-3">Payment Status</h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'fully_paid'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'advance_paid'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {order.paymentStatus === 'fully_paid'   && '✅ Fully Paid'}
                        {order.paymentStatus === 'advance_paid' && '💳 Advance Paid'}
                        {order.paymentStatus === 'pending'      && '⏳ Payment Pending'}
                    </div>
                    {order.paymentMethod && (
                        <p className="text-xs text-gray-400 mt-2 capitalize">
                            via {order.paymentMethod === 'stripe' ? 'Card (Stripe)' : order.paymentMethod}
                        </p>
                    )}
                </div>

                {/* Order Status Progress */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="font-bold mb-5">Order Progress</h2>
                    <div className="space-y-3">
                        {STATUS_STEPS.map((step, i) => {
                            const done    = i < currentStep
                            const current = i === currentStep
                            return (
                                <div key={step.key} className="flex items-center gap-4">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0
                                        ${current ? 'bg-black text-white' : done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {done ? '✓' : step.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${current ? 'text-black' : done ? 'text-green-700' : 'text-gray-400'}`}>
                                            {step.label}
                                            {current && (
                                                <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">Current</span>
                                            )}
                                        </p>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={`w-px h-4 ml-4 ${i < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="font-bold mb-4">Summary</h2>
                    <div className="space-y-3">
                        {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium">{item.product?.name || 'Jewellery'}</p>
                                    <p className="text-xs text-gray-400 capitalize">
                                        {item.selectedMetal} · {item.selectedPurity} · {item.selectedWeight} tola
                                    </p>
                                </div>
                                <span className="font-medium">Rs {item.itemTotal?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-4 pt-3 space-y-1 text-sm">
                        {order.deliveryCharge > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery</span><span>Rs {order.deliveryCharge}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold">
                            <span>Grand Total</span><span>Rs {order.grandTotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600 text-xs">
                            <span>Advance Paid</span><span>Rs {order.advancePaid?.toLocaleString()}</span>
                        </div>
                        {order.grandTotal - order.advancePaid > 0 && (
                            <div className="flex justify-between text-orange-500 text-xs">
                                <span>Remaining (pay on {order.deliveryType === 'pickup' ? 'pickup' : 'delivery'})</span>
                                <span>Rs {(order.grandTotal - order.advancePaid).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                    <Link
                        to="/profile"
                        className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition"
                    >
                        Track Order
                    </Link>
                    <button
                        onClick={() => printReceipt(order)}
                        className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg text-sm font-medium text-center hover:border-gray-500 transition"
                    >
                        🧾 Download Receipt
                    </button>
                    <Link
                        to="/"
                        className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg text-sm font-medium text-center hover:border-gray-500 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
    )
}