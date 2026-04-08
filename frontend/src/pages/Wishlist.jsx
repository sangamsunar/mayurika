import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

const METAL_DOT = {
  gold: 'bg-yellow-400',
  silver: 'bg-gray-300',
  roseGold: 'bg-rose-300'
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
    } catch {
      toast.error('Could not load wishlist')
    }
    setLoading(false)
  }

  const handleRemove = async (productId) => {
    setRemoving(productId)
    try {
      await axios.post('/wishlist', { productId })
      setWishlist(prev => prev.filter(i => i.product._id !== productId))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove item')
    }
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
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        <span className="text-sm tracking-widest uppercase">Loading wishlist…</span>
      </div>
    </div>
  )

  if (wishlist.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">♡</div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Your wishlist is empty</h2>
        <p className="text-gray-400 text-sm mt-1">Save pieces you love and come back to them anytime.</p>
      </div>
      <button
        onClick={() => navigate('/women')}
        className="px-8 py-3 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition"
      >
        Browse Collection
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">My Wishlist</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {wishlist.length} {wishlist.length === 1 ? 'Piece' : 'Pieces'} Saved
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map(item => {
            const product = item.product
            if (!product) return null
            const startingPrice = getStartingPrice(product, goldRate)

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl overflow-hidden shadow-sm group"
              >
                {/* Image */}
                <div
                  className="w-full h-52 bg-gray-50 cursor-pointer overflow-hidden relative"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.images?.[0] ? (
                    <img
                      src={`http://localhost:8000${product.images[0]}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={product.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">💍</div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isTraditional && (
                      <span className="bg-black text-white text-xs px-2 py-0.5 rounded">Traditional</span>
                    )}
                    {product.hallmark && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">Hallmark</span>
                    )}
                  </div>

                  {/* Remove heart */}
                  <button
                    onClick={e => { e.stopPropagation(); handleRemove(product._id) }}
                    disabled={removing === product._id}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    {removing === product._id
                      ? <span className="block w-3.5 h-3.5 border-2 border-red-200 border-t-red-400 rounded-full animate-spin" />
                      : '♥'
                    }
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="font-semibold text-sm truncate cursor-pointer hover:underline"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {product.category} · {product.style?.type}
                  </p>

                  {/* Metal options */}
                  {product.metalOptions?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {product.metalOptions.map(m => (
                        <span key={m} className={`w-3 h-3 rounded-full border border-white shadow-sm ${METAL_DOT[m]}`} title={m} />
                      ))}
                    </div>
                  )}

                  {/* Price + actions */}
                  <div className="mt-3 flex justify-between items-end gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Starting from</p>
                      <p className="font-bold text-sm">Rs {startingPrice.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition flex-shrink-0"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Wishlist;