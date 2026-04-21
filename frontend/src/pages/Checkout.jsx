import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DiamondIcon, CartIcon, MapPinIcon, SparkleIcon } from '../components/Icons'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

function calcItemPrice(item, goldRate) {
  if (!item.product || !goldRate) return 0
  const rate = item.selectedMetal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
  const multiplier = PURITY_MULTIPLIER[item.selectedPurity] || 1
  const goldCost = item.selectedWeight * rate * multiplier
  const subtotal = goldCost + item.product.makingChargePerTola + item.product.jartiAmount + item.product.stoneCharge
  return Math.round((subtotal * 1.02) * item.quantity)
}

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [deliveryType, setDeliveryType] = useState('online')
  const [paymentMethod, setPaymentMethod] = useState('esewa')
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

  const subtotal = cart.reduce((sum, item) => sum + calcItemPrice(item, goldRate), 0)
  const deliveryCharge = deliveryType === 'pickup' ? 0 : 200
  const grandTotal = subtotal + deliveryCharge
  const makingTotal = cart.reduce((sum, item) => {
    if (!item.product) return sum
    return sum + (item.product.makingChargePerTola + item.product.jartiAmount) * item.quantity
  }, 0)
  const advanceAmount = deliveryType === 'cod'
    ? makingTotal + deliveryCharge
    : deliveryType === 'pickup'
    ? makingTotal
    : grandTotal

  const profileIncomplete = !account?.phone || !account?.name
  const missingFields = [!account?.name && 'name', !account?.phone && 'phone number'].filter(Boolean)

  const handleAddrSelect = (addr) => {
    setSelectedAddrId(addr._id)
    setForm({ fullName: addr.fullName || '', phone: addr.phone || '', address: addr.address || '', city: addr.city || '', district: addr.district || '' })
  }

  const handleOrder = async () => {
    if (deliveryType !== 'pickup' && !form.phone) return toast.error('Phone number is required')
    if (deliveryType !== 'pickup' && !form.address) return toast.error('Address is required')

    setPlacing(true)
    try {
      const validCart = cart.filter(item => item.product != null)
      if (validCart.length === 0) { toast.error('Cart items are no longer available.'); setPlacing(false); return }

      const items = validCart.map(item => ({
        productId: item.product._id,
        selectedMetal: item.selectedMetal,
        selectedPurity: item.selectedPurity,
        selectedWeight: item.selectedWeight,
        quantity: item.quantity
      }))

      const { data } = await axios.post('/orders', {
        items, deliveryType,
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

  const lbl = "block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]"

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-dim">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#C9A96E] rounded-full animate-spin" />
        <span className="text-[11px] tracking-[0.3em] uppercase">Loading checkout</span>
      </div>
    </div>
  )

  if (cart.length === 0) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-5">
      <div className="w-20 h-20 glass-gold rounded-full flex items-center justify-center">
        <CartIcon size={28} className="text-[#C9A96E]" />
      </div>
      <p className="font-display text-2xl text-ink">Your cart is empty</p>
      <button onClick={() => navigate('/women')} className="btn-gold">Shop Now</button>
    </div>
  )

  const DeliveryIcon = ({ type }) => {
    const s = 20
    if (type === 'online') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
    if (type === 'cod') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-2">Checkout</p>
            <h1 className="font-display text-3xl font-semibold text-ink">Review & Pay</h1>
            <p className="text-[11px] text-ink-dim mt-1">{cart.length} item{cart.length !== 1 ? 's' : ''} in your order</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-ink-dim tracking-[0.2em] uppercase">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure checkout
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-2 space-y-5">

          <AnimatePresence>
            {profileIncomplete && (
              <motion.div variants={fadeUp}
                className="glass-gold rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                  <SparkleIcon size={14} className="text-[#C9A96E]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#E8D4A0]">Complete your profile for faster checkout</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Missing: {missingFields.join(', ')}</p>
                </div>
                <Link to="/profile?tab=account"
                  className="text-[10px] tracking-widest uppercase font-semibold text-[#C9A96E] border border-[#C9A96E]/40 px-3 py-2 rounded-lg hover:bg-[#C9A96E]/10 transition whitespace-nowrap">
                  Fix now
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
            <p className={lbl}>Delivery Method</p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { key: 'online',  label: 'Online',      desc: 'Pay full now' },
                { key: 'cod',     label: 'Cash on Delivery', desc: 'Advance + rest later' },
                { key: 'pickup',  label: 'Store Pickup', desc: 'No delivery fee' },
              ].map(opt => {
                const sel = deliveryType === opt.key
                return (
                  <button key={opt.key} onClick={() => setDeliveryType(opt.key)}
                    className={`p-4 rounded-xl border text-left transition-all
                      ${sel ? 'bg-[#C9A96E]/15 border-[#C9A96E]/50 text-[#C9A96E]'
                            : 'border-white/[0.08] text-ink-muted hover:border-white/20'}`}>
                    <div className="mb-2"><DeliveryIcon type={opt.key} /></div>
                    <p className="font-semibold text-xs">{opt.label}</p>
                    <p className={`text-[10px] mt-0.5 ${sel ? 'text-[#C9A96E]/80' : 'text-ink-dim'}`}>{opt.desc}</p>
                  </button>
                )
              })}
            </div>
            {deliveryType === 'pickup' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass-sm rounded-xl p-3 text-sm text-ink-muted flex items-center gap-2">
                <MapPinIcon size={14} className="text-[#C9A96E]" />
                Visit our store in Kathmandu to collect your order.
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {deliveryType !== 'pickup' && (
              <motion.div key="addr-form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="glass rounded-2xl p-6 space-y-4">
                <p className={lbl}>Delivery Address</p>

                {account?.addresses?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-ink-dim tracking-wider uppercase">Saved addresses</p>
                    {account.addresses.map(addr => {
                      const sel = selectedAddrId === addr._id
                      return (
                        <button key={addr._id} onClick={() => handleAddrSelect(addr)}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-sm
                            ${sel ? 'bg-[#C9A96E]/10 border-[#C9A96E]/40'
                                  : 'border-white/[0.08] hover:border-white/20'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">{addr.label}</span>
                            {addr.isDefault && <span className="text-[9px] bg-[#C9A96E] text-[#07070A] px-2 py-0.5 rounded-full font-semibold tracking-wider">DEFAULT</span>}
                          </div>
                          <p className="text-ink font-medium mt-1">{addr.fullName}</p>
                          <p className="text-ink-dim text-xs">{addr.address}, {addr.city}</p>
                        </button>
                      )
                    })}
                    <p className="text-[10px] text-ink-dim tracking-wider uppercase mt-3">Or enter a new address</p>
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
                      <input className="inp-dark" placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => { setSelectedAddrId(null); setForm({ ...form, [f.key]: e.target.value }) }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {deliveryType === 'online' && (
              <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="glass rounded-2xl p-6 space-y-4">
                <p className={lbl}>Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'esewa',  label: 'eSewa',       sub: 'Local payment' },
                    { key: 'stripe', label: 'Card / Stripe', sub: 'Visa, Mastercard' },
                  ].map(pm => {
                    const sel = paymentMethod === pm.key
                    return (
                      <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                        className={`p-4 rounded-xl border text-left transition-all
                          ${sel ? 'bg-[#C9A96E]/15 border-[#C9A96E]/50 text-[#C9A96E]'
                                : 'border-white/[0.08] text-ink-muted hover:border-white/20'}`}>
                        <p className="font-semibold text-sm">{pm.label}</p>
                        <p className={`text-[11px] mt-0.5 ${sel ? 'text-[#C9A96E]/80' : 'text-ink-dim'}`}>{pm.sub}</p>
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'esewa' && (
                    <motion.div key="esewa-hint" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="glass-sm rounded-xl p-3 text-[11px] space-y-1 overflow-hidden">
                      <p className="font-semibold text-emerald-400 tracking-wide">eSewa Test Credentials</p>
                      <p className="text-ink-muted">Phone: <span className="font-mono text-ink">9806800001–9806800005</span></p>
                      <p className="text-ink-muted">Password: <span className="font-mono text-ink">Nepal@123</span> · MPIN: <span className="font-mono text-ink">1122</span></p>
                    </motion.div>
                  )}
                  {paymentMethod === 'stripe' && (
                    <motion.div key="stripe-hint" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="glass-sm rounded-xl p-3 text-[11px] space-y-1 overflow-hidden">
                      <p className="font-semibold text-sky-400 tracking-wide">Stripe Test Card</p>
                      <p className="text-ink-muted">Card: <span className="font-mono text-ink">4242 4242 4242 4242</span></p>
                      <p className="text-ink-muted">Expiry: any future · CVC: any 3 digits</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.15 }}
          className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-24 space-y-4">
            <p className={lbl}>Order Summary</p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              {cart.map(item => item.product && (
                <div key={item._id} className="flex items-center gap-3">
                  {item.product.images?.[0] ? (
                    <img src={`http://localhost:8000${item.product.images[0]}`}
                      className="w-11 h-11 rounded-lg object-cover border border-white/10 flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                      <DiamondIcon size={16} className="text-white/20" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-ink">{item.product.name}</p>
                    <p className="text-[10px] text-ink-dim capitalize">{item.selectedMetal} · {item.selectedWeight}t</p>
                  </div>
                  <span className="text-xs font-bold text-ink-muted flex-shrink-0">Rs {calcItemPrice(item, goldRate).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-dim text-xs">
                <span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-ink-dim text-xs">
                <span>Delivery</span>
                <span>{deliveryCharge > 0 ? `Rs ${deliveryCharge}` : <span className="text-emerald-400 font-semibold">Free</span>}</span>
              </div>
              <div className="flex justify-between font-display text-base font-semibold border-t border-white/[0.06] pt-3 mt-2">
                <span className="text-ink">Grand Total</span>
                <span className="text-gradient-gold">Rs {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="glass-gold rounded-xl p-4 text-xs space-y-1">
              <p className="text-[10px] font-semibold text-[#C9A96E] uppercase tracking-widest">Amount Due Now</p>
              <p className="font-display text-[#E8D4A0] text-xl font-bold">Rs {advanceAmount.toLocaleString()}</p>
              {deliveryType === 'cod' && (
                <p className="text-ink-dim">Rs {(grandTotal - advanceAmount).toLocaleString()} due on delivery</p>
              )}
              {deliveryType === 'pickup' && (
                <p className="text-ink-dim">Rs {(grandTotal - advanceAmount).toLocaleString()} due at store</p>
              )}
            </div>

            <motion.button whileTap={{ scale: 0.98 }}
              onClick={handleOrder} disabled={placing}
              className="w-full btn-gold disabled:opacity-50 flex items-center justify-center gap-2">
              {placing ? (
                <><span className="w-4 h-4 border-2 border-[#07070A]/30 border-t-[#07070A] rounded-full animate-spin" />Processing…</>
              ) : (
                deliveryType === 'online'
                  ? `Pay Rs ${grandTotal.toLocaleString()}`
                  : `Place Order · Rs ${advanceAmount.toLocaleString()}`
              )}
            </motion.button>

            <p className="text-center text-[10px] text-ink-dim">
              By placing your order you agree to our{' '}
              <Link to="/return-policy" className="underline hover:text-[#C9A96E] transition">return policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
