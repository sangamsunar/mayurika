import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, WhatsAppIcon, DiamondIcon, CartIcon, ArrowRightIcon } from '../components/Icons'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

const METAL_LABELS = { gold: 'Gold', silver: 'Silver' }
const METAL_DOT = {
  gold:   'bg-gradient-to-br from-[#F5D98C] to-[#C9A96E]',
  silver: 'bg-gradient-to-br from-gray-200 to-gray-400',
}

function calculateItemPrice(item, goldRate) {
  if (!item.product || !goldRate) return 0
  const { selectedMetal, selectedPurity, selectedWeight, product } = item
  const rate = selectedMetal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
  const multiplier = PURITY_MULTIPLIER[selectedPurity] || 1
  const goldCost = selectedWeight * rate * multiplier
  const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
  const tax = subtotal * 0.02
  return Math.round((subtotal + tax) * item.quantity)
}

function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => { fetchData() }, [])

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

  const handleRemove = async (itemId) => {
    setRemoving(itemId)
    try {
      await axios.delete(`/cart/${itemId}`)
      setCart(prev => prev.filter(i => i._id !== itemId))
      toast.success('Removed from cart')
    } catch { toast.error('Failed to remove item') }
    setRemoving(null)
  }

  const grandTotal = cart.reduce((sum, item) => sum + calculateItemPrice(item, goldRate), 0)

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-dim">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#C9A96E] rounded-full animate-spin" />
        <span className="text-[11px] tracking-[0.3em] uppercase">Loading cart</span>
      </div>
    </div>
  )

  if (cart.length === 0) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-6 text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)' }} />
      <div className="w-20 h-20 glass-gold rounded-full flex items-center justify-center relative z-10">
        <CartIcon size={28} className="text-[#C9A96E]" />
      </div>
      <div className="relative z-10">
        <h2 className="font-display text-2xl font-semibold text-ink">Your cart is empty</h2>
        <p className="text-ink-dim text-sm mt-2">Add jewellery to your cart to see them here.</p>
      </div>
      <button onClick={() => navigate('/women')} className="btn-gold relative z-10">
        Browse Collection
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-white/[0.05] px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-2">My Cart</p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map(item => {
              const product = item.product
              if (!product) return null
              const itemTotal = calculateItemPrice(item, goldRate)

              return (
                <motion.div key={item._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass rounded-2xl overflow-hidden flex">
                  <div className="w-28 h-28 sm:w-40 sm:h-40 bg-white/[0.02] flex-shrink-0 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/product/${product._id}`)}>
                    {product.images?.[0] ? (
                      <img src={`http://localhost:8000${product.images[0]}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        alt={product.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DiamondIcon size={32} className="text-white/10" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-ink truncate cursor-pointer hover:text-[#C9A96E] transition-colors"
                          onClick={() => navigate(`/product/${product._id}`)}>
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-ink-dim capitalize tracking-wider mt-1">
                          {product.category} · {product.style?.type}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] glass-sm px-2.5 py-1 rounded-full text-ink-muted">
                            <span className={`w-2 h-2 rounded-full ${METAL_DOT[item.selectedMetal]}`} />
                            {METAL_LABELS[item.selectedMetal]}
                          </span>
                          <span className="text-[10px] glass-sm px-2.5 py-1 rounded-full text-ink-muted">{item.selectedPurity}</span>
                          <span className="text-[10px] glass-sm px-2.5 py-1 rounded-full text-ink-muted">{item.selectedWeight} tola</span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#C9A96E] px-2.5 py-1 rounded-full">
                              Qty: {item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      <button onClick={() => handleRemove(item._id)} disabled={removing === item._id}
                        className="text-ink-dim hover:text-rose-400 transition-colors flex-shrink-0 p-2 disabled:opacity-50"
                        title="Remove">
                        {removing === item._id
                          ? <span className="block w-4 h-4 border-2 border-white/10 border-t-rose-400 rounded-full animate-spin" />
                          : <TrashIcon size={16} />
                        }
                      </button>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                      <span className="text-[10px] text-ink-dim tracking-wider uppercase">
                        {goldRate?.isManual ? 'Manual rate' : 'Live rate'}
                      </span>
                      <span className="font-display text-lg font-semibold text-gradient-gold">
                        Rs {itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-3">Summary</p>
            <h2 className="font-display text-xl font-semibold text-ink mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {cart.map(item => {
                const product = item.product
                if (!product) return null
                return (
                  <div key={item._id} className="flex justify-between gap-2">
                    <span className="text-ink-dim truncate flex-1">{product.name}</span>
                    <span className="flex-shrink-0 font-medium text-ink-muted">
                      Rs {calculateItemPrice(item, goldRate).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-white/[0.06] mt-5 pt-4 flex justify-between items-center">
              <span className="font-display text-base font-semibold text-ink">Total</span>
              <span className="font-display text-xl font-semibold text-gradient-gold">Rs {grandTotal.toLocaleString()}</span>
            </div>

            <p className="text-[10px] text-ink-dim mt-3 tracking-wide">* Delivery charge calculated at checkout</p>

            {goldRate && (
              <p className="text-[10px] text-ink-dim mt-1 tracking-wide">
                Gold: Rs {goldRate.fineGoldPerTola?.toLocaleString()}/tola
                {goldRate.isManual ? ' (manual)' : ' (live)'}
              </p>
            )}

            <button className="w-full mt-6 btn-gold flex items-center justify-center gap-2"
              onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRightIcon size={14} />
            </button>

            <button onClick={() => navigate('/women')}
              className="w-full mt-3 border border-white/10 text-ink-muted py-3 rounded-xl text-sm hover:border-white/30 hover:text-ink transition">
              Continue Shopping
            </button>

            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-[10px] text-ink-dim mb-2 tracking-wider">Need help with your order?</p>
              <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition">
                <WhatsAppIcon size={14} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
