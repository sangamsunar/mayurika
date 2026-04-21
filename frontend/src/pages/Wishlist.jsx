import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartIcon, DiamondIcon, ArrowRightIcon } from '../components/Icons'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

const METAL_DOT = {
  gold:   'bg-gradient-to-br from-[#F5D98C] to-[#C9A96E]',
  silver: 'bg-gradient-to-br from-gray-200 to-gray-400',
}

function getStartingPrice(product, goldRate) {
  if (!product || !goldRate) return 0
  const metal = product.metalOptions?.[0] || 'gold'
  const purity = metal === 'silver'
    ? (product.purityOptions?.silver?.[0] || '999')
    : (product.purityOptions?.gold?.[0] || '24K')
  const rate = metal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
  const multiplier = PURITY_MULTIPLIER[purity] || 1
  const avgWeight = (product.minWeightTola + product.maxWeightTola) / 2
  const goldCost = avgWeight * rate * multiplier
  const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
  return Math.round(subtotal * 1.02)
}

function Wishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [wishRes, rateRes] = await Promise.all([
        axios.get('/wishlist'),
        axios.get('/gold-rate')
      ])
      setWishlist(wishRes.data)
      setGoldRate(rateRes.data)
    } catch { toast.error('Could not load wishlist') }
    setLoading(false)
  }

  const handleRemove = async (productId) => {
    setRemoving(productId)
    try {
      await axios.post('/wishlist', { productId })
      setWishlist(prev => prev.filter(i => i.product._id !== productId))
      toast.success('Removed from wishlist')
    } catch { toast.error('Failed to remove item') }
    setRemoving(null)
  }

  const handleAddToCart = async (product) => {
    try {
      const defaultMetal = product.metalOptions?.[0] || 'gold'
      const defaultPurity = defaultMetal === 'silver'
        ? (product.purityOptions?.silver?.[0] || '999')
        : (product.purityOptions?.gold?.[0] || '24K')
      const avgWeight = parseFloat(((product.minWeightTola + product.maxWeightTola) / 2).toFixed(1))

      const { data } = await axios.post('/cart', {
        productId: product._id,
        selectedMetal: defaultMetal,
        selectedPurity: defaultPurity,
        selectedWeight: avgWeight
      })
      if (data.error) toast.error(data.error)
      else toast.success('Added to cart!')
    } catch { toast.error('Failed to add to cart') }
  }

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-dim">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#C9A96E] rounded-full animate-spin" />
        <span className="text-[11px] tracking-[0.3em] uppercase">Loading wishlist</span>
      </div>
    </div>
  )

  if (wishlist.length === 0) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-6 text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)' }} />
      <div className="w-20 h-20 glass-gold rounded-full flex items-center justify-center relative z-10">
        <HeartIcon size={28} className="text-[#C9A96E]" />
      </div>
      <div className="relative z-10">
        <h2 className="font-display text-2xl font-semibold text-ink">Your wishlist is empty</h2>
        <p className="text-ink-dim text-sm mt-2">Save pieces you love and come back to them anytime.</p>
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
          <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-2">My Wishlist</p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            {wishlist.length} {wishlist.length === 1 ? 'Piece' : 'Pieces'} Saved
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {wishlist.map(item => {
              const product = item.product
              if (!product) return null
              const startingPrice = getStartingPrice(product, goldRate)

              return (
                <motion.div key={item._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-2xl overflow-hidden group">
                  <div className="w-full h-60 bg-white/[0.02] cursor-pointer overflow-hidden relative"
                    onClick={() => navigate(`/product/${product._id}`)}>
                    {product.images?.[0] ? (
                      <img src={`http://localhost:8000${product.images[0]}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={product.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DiamondIcon size={40} className="text-white/10" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.isTraditional && (
                        <span className="glass-sm text-[9px] font-semibold text-ink px-2.5 py-1 rounded-full tracking-wider uppercase">Traditional</span>
                      )}
                      {product.hallmark && (
                        <span className="bg-[#C9A96E]/90 text-[#07070A] text-[9px] font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase">Hallmark</span>
                      )}
                    </div>

                    <button onClick={e => { e.stopPropagation(); handleRemove(product._id) }}
                      disabled={removing === product._id}
                      className="absolute top-3 right-3 w-9 h-9 glass-sm rounded-full flex items-center justify-center text-[#C9A96E] hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Remove from wishlist">
                      {removing === product._id
                        ? <span className="block w-3.5 h-3.5 border-2 border-white/10 border-t-[#C9A96E] rounded-full animate-spin" />
                        : <HeartIcon size={16} filled />
                      }
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-ink truncate cursor-pointer hover:text-[#C9A96E] transition-colors"
                      onClick={() => navigate(`/product/${product._id}`)}>
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-ink-dim capitalize tracking-wider mt-1">
                      {product.category} · {product.style?.type}
                    </p>

                    {product.metalOptions?.length > 0 && (
                      <div className="flex gap-1.5 mt-3">
                        {product.metalOptions.map(m => (
                          <span key={m} className={`w-3 h-3 rounded-full ${METAL_DOT[m]} ring-1 ring-white/10`} title={m} />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-end gap-2">
                      <div>
                        <p className="text-[10px] text-ink-dim uppercase tracking-wider">From</p>
                        <p className="font-display text-lg font-semibold text-gradient-gold">Rs {startingPrice.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleAddToCart(product)}
                        className="text-[11px] glass-sm hover:bg-[#C9A96E]/15 hover:border-[#C9A96E]/30 text-ink-muted hover:text-[#C9A96E] px-3 py-2 rounded-lg transition flex-shrink-0 flex items-center gap-1.5">
                        Add <ArrowRightIcon size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Wishlist
