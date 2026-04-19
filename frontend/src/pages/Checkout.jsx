import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart]           = useState([])
  const [goldRate, setGoldRate]   = useState(null)
  const [account, setAccount]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [placing, setPlacing]     = useState(false)
  const [deliveryType, setDeliveryType]     = useState('online')
  const [paymentMethod, setPaymentMethod]   = useState('esewa')
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', district: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, rateRes, accountRes] = await Promise.all([
          axios.get('/cart'),
          axios.get('/gold-rate'),
          axios.get('/account').catch(() => ({ data: null }))
        ])
        setCart(cartRes.data)
        setGoldRate(rateRes.data)
        const acc = accountRes.data
        setAccount(acc)
        // Prefill form from profile defaults
        if (acc) {
          const def = acc.addresses?.find(a => a.isDefault) || acc.addresses?.[0]
          if (def) {
            setSelectedAddrId(def._id)
            setForm({ fullName: def.fullName || acc.name || '', phone: def.phone || acc.phone || '', address: def.address || '', city: def.city || '', district: def.district || '' })
          } else {
            setForm(p => ({ ...p, fullName: acc.name || '', phone: acc.phone || '' }))
          }
        }
      } catch { toast.error('Could not load checkout') }
      setLoading(false)
    }
    fetchData()
  }, [])

  const subtotal       = cart.reduce((sum, item) => sum + calcItemPrice(item, goldRate), 0)
  const deliveryCharge = deliveryType === 'pickup' ? 0 : 200
  const grandTotal     = subtotal + deliveryCharge
  const makingTotal    = cart.reduce((sum, item) => {
    if (!item.product) return sum
    return sum + (item.product.makingChargePerTola + item.product.jartiAmount) * item.quantity
  }, 0)
  const advanceAmount = deliveryType === 'cod'
    ? makingTotal + deliveryCharge
    : deliveryType === 'pickup'
    ? makingTotal
    : grandTotal

  // Completion check
  const profileIncomplete = !account?.phone || !account?.name
  const missingFields = [
    !account?.name  && 'name',
    !account?.phone && 'phone number',
  ].filter(Boolean)

  const handleAddrSelect = (addr) => {
    setSelectedAddrId(addr._id)
    setForm({ fullName: addr.fullName || '', phone: addr.phone || '', address: addr.address || '', city: addr.city || '', district: addr.district || '' })
  }

  const handleOrder = async () => {
    if (deliveryType !== 'pickup' && !form.phone)   return toast.error('Phone number is required')
    if (deliveryType !== 'pickup' && !form.address)  return toast.error('Address is required')

    setPlacing(true)
    try {
      const validCart = cart.filter(item => item.product != null)
      if (validCart.length === 0) { toast.error('Cart items are no longer available.'); setPlacing(false); return }

      const items = validCart.map(item => ({
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

      if (deliveryType === 'online' && paymentMethod === 'stripe') {
        const { data: stripeData } = await axios.post('/stripe/create-session', { orderId })
        if (stripeData.url) { window.location.href = stripeData.url; return }
      } else if (deliveryType === 'online' && paymentMethod === 'esewa') {
        const { data: esewaData } = await axios.post('/esewa/initiate', { orderId })
        if (esewaData.esewaUrl) {
          const esewaForm = document.createElement('form')
          esewaForm.method = 'POST'
          esewaForm.action = esewaData.esewaUrl
          Object.entries(esewaData.params).forEach(([key, val]) => {
            const input = document.createElement('input')
            input.type = 'hidden'; input.name = key; input.value = val
            esewaForm.appendChild(input)
          })
          document.body.appendChild(esewaForm)
          esewaForm.submit()
          return
        }
      }

      navigate(`/order-success?orderId=${orderId}`)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error?.response?.data?.error || 'Something went wrong')
      setPlacing(false)
    }
  }

  const inp = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-700 focus:ring-1 focus:ring-stone-700 transition bg-white placeholder:text-stone-300"
  const lbl = "block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-widest"

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-800 animate-spin" />
        <p className="text-xs tracking-widest uppercase text-stone-400">Loading checkout…</p>
      </motion.div>
    </div>
  )

  if (cart.length === 0) return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center gap-5">
      <div className="text-5xl">🛒</div>
      <p className="text-stone-500 font-medium">Your cart is empty</p>
      <button onClick={() => navigate('/women')}
        className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition">
        Shop Now
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafaf9]">

      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">Checkout</h1>
            <p className="text-xs text-stone-400 mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''} in your order</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-4 h-4 text-emerald-500">🔒</span>
            Secure checkout
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-2 space-y-5">

          {/* Account completion nudge */}
          <AnimatePresence>
            {profileIncomplete && (
              <motion.div variants={fadeUp}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm flex-shrink-0">✨</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Complete your profile for faster checkout</p>
                  <p className="text-xs text-amber-600 mt-0.5">Missing: {missingFields.join(', ')}</p>
                </div>
                <Link to="/profile?tab=account"
                  className="text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition whitespace-nowrap">
                  Fix now
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivery method */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-stone-800 mb-4 uppercase tracking-widest">Delivery Method</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'online',  label: 'Online',      desc: 'Pay full amount now',              icon: '💳' },
                { key: 'cod',     label: 'Cash on Delivery', desc: 'Pay advance + rest on delivery', icon: '🚚' },
                { key: 'pickup',  label: 'Store Pickup', desc: 'No delivery charge',               icon: '🏠' },
              ].map(opt => (
                <button key={opt.key} onClick={() => setDeliveryType(opt.key)}
                  className={`p-3.5 rounded-xl border text-left transition-all
                    ${deliveryType === opt.key
                      ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                      : 'border-stone-200 hover:border-stone-400 text-stone-600'}`}>
                  <p className="text-lg mb-1">{opt.icon}</p>
                  <p className="font-semibold text-xs">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${deliveryType === opt.key ? 'text-stone-300' : 'text-stone-400'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
            {deliveryType === 'pickup' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-700">
                📍 Visit our store in Kathmandu to collect your order.
              </motion.div>
            )}
          </motion.div>

          {/* Saved addresses + delivery form */}
          <AnimatePresence mode="wait">
            {deliveryType !== 'pickup' && (
              <motion.div key="addr-form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Delivery Address</h2>

                {/* Saved addresses selector */}
                {account?.addresses?.length > 0 && (
                  <div className="space-y-2">
                    <p className={lbl}>Saved Addresses</p>
                    {account.addresses.map(addr => (
                      <button key={addr._id} onClick={() => handleAddrSelect(addr)}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-sm
                          ${selectedAddrId === addr._id
                            ? 'border-stone-900 bg-stone-50'
                            : 'border-stone-200 hover:border-stone-400'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">{addr.label}</span>
                          {addr.isDefault && <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-stone-700 font-medium mt-0.5">{addr.fullName}</p>
                        <p className="text-stone-400 text-xs">{addr.address}, {addr.city}</p>
                      </button>
                    ))}
                    <p className={lbl + ' mt-3'}>Or enter a new address</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'fullName', label: 'Full Name',  placeholder: 'Your name',       col: 2 },
                    { key: 'phone',    label: 'Phone',      placeholder: '98XXXXXXXX',       col: 1 },
                    { key: 'city',     label: 'City',       placeholder: 'Kathmandu',        col: 1 },
                    { key: 'address',  label: 'Address',    placeholder: 'Street, Locality', col: 2 },
                    { key: 'district', label: 'District',   placeholder: 'Bagmati',          col: 2 },
                  ].map(f => (
                    <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                      <label className={lbl}>{f.label}</label>
                      <input className={inp} placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => { setSelectedAddrId(null); setForm({ ...form, [f.key]: e.target.value }) }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment method */}
          <AnimatePresence mode="wait">
            {deliveryType === 'online' && (
              <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'esewa',  label: 'eSewa',       icon: '🟢', sub: 'Local payment' },
                    { key: 'stripe', label: 'Card / Stripe', icon: '💳', sub: 'Visa, Mastercard' },
                  ].map(pm => (
                    <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                      className={`p-4 rounded-xl border text-left transition-all
                        ${paymentMethod === pm.key
                          ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                          : 'border-stone-200 hover:border-stone-400'}`}>
                      <p className="text-xl mb-1">{pm.icon}</p>
                      <p className="font-semibold text-sm">{pm.label}</p>
                      <p className={`text-xs mt-0.5 ${paymentMethod === pm.key ? 'text-stone-300' : 'text-stone-400'}`}>{pm.sub}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-stone-400">🔒 All payments are secure and encrypted</p>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'esewa' && (
                    <motion.div key="esewa-hint" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1 overflow-hidden">
                      <p className="font-semibold text-emerald-800">🧪 eSewa Test Credentials</p>
                      <p className="text-emerald-700">Phone: <span className="font-mono">9806800001–9806800005</span></p>
                      <p className="text-emerald-700">Password: <span className="font-mono">Nepal@123</span> · MPIN: <span className="font-mono">1122</span></p>
                    </motion.div>
                  )}
                  {paymentMethod === 'stripe' && (
                    <motion.div key="stripe-hint" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs space-y-1 overflow-hidden">
                      <p className="font-semibold text-sky-800">🧪 Stripe Test Card</p>
                      <p className="text-sky-700">Card: <span className="font-mono">4242 4242 4242 4242</span></p>
                      <p className="text-sky-700">Expiry: any future · CVC: any 3 digits</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT — Order Summary */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.15 }}
          className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 sticky top-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {cart.map(item => item.product && (
                <div key={item._id} className="flex items-center gap-2.5">
                  {item.product.images?.[0] ? (
                    <img src={`http://localhost:8000${item.product.images[0]}`}
                      className="w-10 h-10 rounded-lg object-cover border border-stone-100 flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-stone-50 flex items-center justify-center text-stone-300 text-base flex-shrink-0">💎</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-stone-800">{item.product.name}</p>
                    <p className="text-[11px] text-stone-400 capitalize">{item.selectedMetal} · {item.selectedWeight}t</p>
                  </div>
                  <span className="text-xs font-bold text-stone-800 flex-shrink-0">Rs {calcItemPrice(item, goldRate).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-500 text-xs">
                <span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-xs">
                <span>Delivery</span>
                <span>{deliveryCharge > 0 ? `Rs ${deliveryCharge}` : <span className="text-emerald-600 font-semibold">Free</span>}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-2">
                <span>Grand Total</span><span>Rs {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Advance box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
              <p className="font-semibold text-amber-800">Amount Due Now</p>
              <p className="text-amber-700 text-base font-bold">Rs {advanceAmount.toLocaleString()}</p>
              {deliveryType === 'cod' && (
                <p className="text-stone-500">Rs {(grandTotal - advanceAmount).toLocaleString()} due on delivery</p>
              )}
              {deliveryType === 'pickup' && (
                <p className="text-stone-500">Rs {(grandTotal - advanceAmount).toLocaleString()} due at store</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleOrder}
              disabled={placing}
              className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {placing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  {deliveryType === 'online'
                    ? `Pay Rs ${grandTotal.toLocaleString()}`
                    : `Place Order · Rs ${advanceAmount.toLocaleString()} advance`}
                </>
              )}
            </motion.button>

            <p className="text-center text-[11px] text-stone-400">
              By placing your order you agree to our{' '}
              <Link to="/return-policy" className="underline hover:text-stone-600">return policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
