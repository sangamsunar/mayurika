import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const STATUS_STEPS = [
    { key: 'working', label: 'Being Made', icon: '🔨' },
    { key: 'finishing', label: 'Finishing', icon: '✨' },
    { key: 'packaging', label: 'Packaging', icon: '📦' },
    { key: 'transit', label: 'On the Way', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
]

export default function OrderSuccess() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const orderId = params.get('orderId')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) { navigate('/'); return }
        axios.get(`/orders/${orderId}`)
            .then(({ data }) => { setOrder(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [orderId])

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
    if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-400">Order not found</div>

    const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full space-y-6">

                {/* Success Header */}
                <div className="bg-white rounded-2xl border p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                    <h1 className="text-2xl font-bold mb-1">Order Placed!</h1>
                    <p className="text-gray-500 text-sm">A confirmation email has been sent to your inbox.</p>
                    <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 inline-block">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Order ID</p>
                        <p className="font-mono font-bold text-lg">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Order Status Progress */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="font-bold mb-5">Order Status</h2>
                    <div className="space-y-3">
                        {STATUS_STEPS.map((step, i) => {
                            const done = i < currentStep
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
                                            {current && <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">Current</span>}
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
                                    <p className="text-xs text-gray-400 capitalize">{item.selectedMetal} · {item.selectedPurity} · {item.selectedWeight} tola</p>
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
                <div className="flex gap-3">
                    <Link to="/profile" className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition">
                        Track Order
                    </Link>
                    <Link to="/" className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg text-sm font-medium text-center hover:border-gray-500 transition">
                        Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
    )
}