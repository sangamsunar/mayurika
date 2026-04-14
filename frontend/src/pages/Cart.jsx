import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

const METAL_LABELS = { gold: 'Gold', silver: 'Silver', roseGold: 'Rose Gold' }

const METAL_DOT = {
  gold: 'bg-yellow-400',
  silver: 'bg-gray-300',
  roseGold: 'bg-rose-300'
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
    } catch {
      toast.error('Could not load cart')
    }
    setLoading(false)
  }

  const handleRemove = async (itemId) => {
    setRemoving(itemId)
    try {
      await axios.delete(`/cart/${itemId}`)
      setCart(prev => prev.filter(i => i._id !== itemId))
      toast.success('Removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
    setRemoving(null)
  }

  const grandTotal = cart.reduce((sum, item) => sum + calculateItemPrice(item, goldRate), 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        <span className="text-sm tracking-widest uppercase">Loading cart…</span>
      </div>
    </div>
  )

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">🛒</div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mt-1">Add jewellery to your cart to see them here.</p>
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
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">My Cart</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => {
            const product = item.product
            if (!product) return null
            const itemTotal = calculateItemPrice(item, goldRate)

            return (
              <div key={item._id} className="bg-white rounded-xl overflow-hidden shadow-sm flex">

                {/* Thumbnail */}
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-50 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.images?.[0] ? (
                    <img
                      src={`http://localhost:8000${product.images[0]}`}
                      className="w-full h-full object-cover"
                      alt={product.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">💍</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3
                        className="font-semibold text-sm leading-snug cursor-pointer hover:underline"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">
                        {product.category} · {product.style?.type}
                      </p>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          <span className={`w-2.5 h-2.5 rounded-full ${METAL_DOT[item.selectedMetal]}`} />
                          {METAL_LABELS[item.selectedMetal]}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.selectedPurity}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.selectedWeight} tola
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                            Qty: {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={removing === item._id}
                      className="text-gray-300 hover:text-red-400 transition-colors text-xl flex-shrink-0 p-1 leading-none"
                      title="Remove"
                    >
                      {removing === item._id
                        ? <span className="block w-4 h-4 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin" />
                        : '×'
                      }
                    </button>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex justify-between items-end">
                    <span className="text-xs text-gray-400">
                      {goldRate?.isManual ? 'Manual rate' : 'Live rate'}
                    </span>
                    <span className="font-bold text-sm">Rs {itemTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="font-bold text-base mb-5 tracking-tight">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {cart.map(item => {
                const product = item.product
                if (!product) return null
                return (
                  <div key={item._id} className="flex justify-between gap-2">
                    <span className="text-gray-500 truncate flex-1">{product.name}</span>
                    <span className="flex-shrink-0 font-medium">
                      Rs {calculateItemPrice(item, goldRate).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>Rs {grandTotal.toLocaleString()}</span>
            </div>

            <p className="text-xs text-gray-400 mt-2">* Delivery charge calculated at checkout</p>

            {goldRate && (
              <p className="text-xs text-gray-400 mt-1">
                Gold: Rs {goldRate.fineGoldPerTola?.toLocaleString()}/tola
                {goldRate.isManual ? ' (manual)' : ' (live)'}
              </p>
            )}

            <button
              className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition text-sm"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/women')}
              className="w-full mt-3 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:border-gray-400 transition"
            >
              Continue Shopping
            </button>

            <div className="mt-5 pt-5 border-t text-center">
              <p className="text-xs text-gray-400 mb-1">Need help with your order?</p>
              <a
                href="https://wa.me/9779702296671"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart;