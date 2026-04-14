import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

function calcItemPrice(item, goldRate) {
  if (!item.product || !goldRate) return 0
  const rate       = item.selectedMetal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
  const multiplier = PURITY_MULTIPLIER[item.selectedPurity] || 1
  const goldCost   = item.selectedWeight * rate * multiplier
  const subtotal   = goldCost + item.product.makingChargePerTola + item.product.jartiAmount + item.product.stoneCharge
  return Math.round((subtotal * 1.02) * item.quantity)
}

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart]           = useState([])
  const [goldRate, setGoldRate]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [placing, setPlacing]     = useState(false)
  const [deliveryType, setDeliveryType] = useState('online')
  const [paymentMethod, setPaymentMethod] = useState('esewa')
  const [form, setForm]           = useState({
    fullName: '', phone: '', address: '', city: '', district: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, rateRes] = await Promise.all([
          axios.get('/cart'),
          axios.get('/gold-rate')
        ])
        setCart(cartRes.data)
        setGoldRate(rateRes.data)
      } catch { toast.error('Could not load cart') }
      setLoading(false)
    }
    fetchData()
  }, [])

  const subtotal      = cart.reduce((sum, item) => sum + calcItemPrice(item, goldRate), 0)
  const deliveryCharge = deliveryType === 'pickup' ? 0 : 200
  const grandTotal    = subtotal + deliveryCharge

  const makingTotal   = cart.reduce((sum, item) => {
    if (!item.product) return sum
    return sum + (item.product.makingChargePerTola + item.product.jartiAmount) * item.quantity
  }, 0)

  const advanceAmount = deliveryType === 'cod'
    ? makingTotal + deliveryCharge
    : deliveryType === 'pickup'
    ? makingTotal
    : grandTotal

  const handleOrder = async () => {
    if (deliveryType !== 'pickup' && !form.phone) {
      return toast.error('Phone number is required')
    }
    if (deliveryType !== 'pickup' && !form.address) {
      return toast.error('Address is required')
    }

    setPlacing(true)
    try {
      const items = cart.map(item => ({
        productId:      item.product._id,
        selectedMetal:  item.selectedMetal,
        selectedPurity: item.selectedPurity,
        selectedWeight: item.selectedWeight,
        quantity:       item.quantity
      }))

      const { data } = await axios.post('/orders', {
        items,
        deliveryType,
        deliveryAddress: deliveryType !== 'pickup' ? form : null,
        paymentMethod
      })

      if (data.error) { toast.error(data.error); setPlacing(false); return }

      const orderId = data.order._id

      // Handle payment
      if (deliveryType === 'online' && paymentMethod === 'stripe') {
        const { data: stripeData } = await axios.post('/stripe/create-session', { orderId })
        if (stripeData.url) { window.location.href = stripeData.url; return }
      } else if (deliveryType === 'online' && paymentMethod === 'esewa') {
        const { data: esewaData } = await axios.post('/esewa/initiate', { orderId })
        if (esewaData.esewaUrl) {
          // Build eSewa form and submit
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = esewaData.esewaUrl
          Object.entries(esewaData.params).forEach(([key, val]) => {
            const input = document.createElement('input')
            input.type  = 'hidden'
            input.name  = key
            input.value = val
            form.appendChild(input)
          })
          document.body.appendChild(form)
          form.submit()
          return
        }
      }

      // COD or pickup — go to success page
      navigate(`/order-success?orderId=${orderId}`)
    } catch (error) {
      toast.error('Something went wrong')
      setPlacing(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400">Your cart is empty</p>
      <button onClick={() => navigate('/women')} className="bg-black text-white px-6 py-2 rounded text-sm">Shop Now</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery type */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold mb-4">Delivery Method</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'online',  label: 'Full Online',  desc: 'Pay full amount now' },
                { key: 'cod',     label: 'COD',          desc: 'Pay advance + rest on delivery' },
                { key: 'pickup',  label: 'Store Pickup', desc: 'No delivery charge' },
              ].map(opt => (
                <button key={opt.key} onClick={() => setDeliveryType(opt.key)}
                  className={`p-3 rounded-lg border text-left transition-all
                    ${deliveryType === opt.key ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${deliveryType === opt.key ? 'text-gray-300' : 'text-gray-400'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>

            {deliveryType === 'pickup' && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                📍 Please visit our store to pick up your order. Address: Kathmandu, Nepal.
              </div>
            )}
          </div>

          {/* Delivery address */}
          {deliveryType !== 'pickup' && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: 'Full Name',   placeholder: 'Your name',        col: 2 },
                  { key: 'phone',    label: 'Phone',       placeholder: '98XXXXXXXX',        col: 1 },
                  { key: 'city',     label: 'City',        placeholder: 'Kathmandu',         col: 1 },
                  { key: 'address',  label: 'Address',     placeholder: 'Street, Locality',  col: 2 },
                  { key: 'district', label: 'District',    placeholder: 'Bagmati',           col: 2 },
                ].map(f => (
                  <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{f.label}</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment method */}
          {deliveryType === 'online' && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold mb-4">Payment Method</h2>
              <div className="flex gap-3">
                {[
                  { key: 'esewa',  label: 'eSewa',  color: 'text-green-600' },
                  { key: 'stripe', label: 'Card (Stripe)', color: 'text-blue-600' },
                ].map(pm => (
                  <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                    className={`flex-1 p-3 rounded-lg border text-sm font-semibold transition-all
                      ${paymentMethod === pm.key ? 'border-black bg-black text-white' : `border-gray-200 ${pm.color} hover:border-gray-400`}`}>
                    {pm.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">🔒 Payments are secured and encrypted</p>
            </div>
          )}
        </div>

        {/* RIGHT — Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-5 sticky top-6 space-y-4">
            <h2 className="font-bold">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {cart.map(item => item.product && (
                <div key={item._id} className="flex justify-between text-sm gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-xs">{item.product.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.selectedMetal} · {item.selectedPurity} · {item.selectedWeight}t</p>
                  </div>
                  <span className="text-xs font-medium flex-shrink-0">Rs {calcItemPrice(item, goldRate).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span>{deliveryCharge > 0 ? `Rs ${deliveryCharge}` : 'Free'}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Grand Total</span>
                <span>Rs {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Advance info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold text-yellow-800">Payment Required Now</p>
              <p className="text-yellow-700">Rs {advanceAmount.toLocaleString()}</p>
              {deliveryType === 'cod' && <p className="text-gray-500">Remaining Rs {(grandTotal - advanceAmount).toLocaleString()} on delivery</p>}
              {deliveryType === 'pickup' && <p className="text-gray-500">Remaining Rs {(grandTotal - advanceAmount).toLocaleString()} at store</p>}
            </div>

            <button onClick={handleOrder} disabled={placing}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 text-sm">
              {placing ? 'Placing Order...' : deliveryType === 'online' ? `Pay Rs ${grandTotal.toLocaleString()}` : `Place Order (Advance: Rs ${advanceAmount.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}