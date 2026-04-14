import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['all', 'ring', 'bracelet', 'chain', 'necklace', 'cufflink', 'set']
const STYLES     = ['all', 'traditional', 'wedding', 'casual', 'youth']

export default function Men() {
  const [products, setProducts] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('all')
  const [style, setStyle]       = useState('all')

  useEffect(() => { fetchData() }, [category, style])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = { gender: 'male' }
      if (category !== 'all') params.category = category
      if (style !== 'all')    params.style     = style

      const [productsRes, rateRes] = await Promise.all([
        axios.get('/products', { params }),
        axios.get('/gold-rate')
      ])
      setProducts(productsRes.data)
      setGoldRate(rateRes.data)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-8 text-center">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Men</h1>
        <p className="text-gray-400 text-sm mt-1">Handcrafted jewellery for every man</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors
                  ${category === c ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-500 hover:border-gray-500'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors
                  ${style === s ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-500 hover:border-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">{products.length} products</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} goldRate={goldRate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}