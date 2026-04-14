import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { useSearchParams } from 'react-router-dom'

const CATEGORIES = ['all', 'ring', 'necklace', 'bracelet', 'earring', 'anklet', 'chain', 'cufflink', 'tayo', 'tilhari', 'churra', 'pote', 'kantha', 'set']
const STYLES     = ['all', 'traditional', 'wedding', 'casual', 'youth']
const GENDERS    = ['all', 'female', 'male', 'unisex']
const METALS     = ['all', 'gold', 'silver', 'roseGold']

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading]   = useState(false)

  const [query,    setQuery]    = useState(searchParams.get('q')        || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [style,    setStyle]    = useState(searchParams.get('style')    || 'all')
  const [gender,   setGender]   = useState(searchParams.get('gender')   || 'all')
  const [metal,    setMetal]    = useState(searchParams.get('metal')    || 'all')
  const [inStock,  setInStock]  = useState(true)

  useEffect(() => { fetchData() }, [query, category, style, gender, metal, inStock])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (query)              params.search   = query
      if (category !== 'all') params.category = category
      if (style    !== 'all') params.style    = style
      if (gender   !== 'all') params.gender   = gender
      if (metal    !== 'all') params.metal    = metal
      if (inStock)            params.inStock  = true

      const [productsRes, rateRes] = await Promise.all([
        axios.get('/products', { params }),
        axios.get('/gold-rate')
      ])
      setProducts(productsRes.data)
      setGoldRate(rateRes.data)

      // Update URL params
      setSearchParams(params)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData()
  }

  const resetFilters = () => {
    setQuery(''); setCategory('all'); setStyle('all')
    setGender('all'); setMetal('all'); setInStock(true)
  }

  const FilterBtn = ({ active, onClick, children }) => (
    <button onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors
        ${active ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-500 hover:border-gray-500'}`}>
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <div className="bg-white border-b px-8 py-5">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search jewellery... e.g. tilhari, gold ring, gothic bracelet"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          <button type="submit"
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            Search
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-wrap gap-6 mb-6">

          {/* Category */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => <FilterBtn key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterBtn>)}
            </div>
          </div>

          {/* Style */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Style</p>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => <FilterBtn key={s} active={style === s} onClick={() => setStyle(s)}>{s}</FilterBtn>)}
            </div>
          </div>

          {/* Gender */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Gender</p>
            <div className="flex gap-2 flex-wrap">
              {GENDERS.map(g => <FilterBtn key={g} active={gender === g} onClick={() => setGender(g)}>{g}</FilterBtn>)}
            </div>
          </div>

          {/* Metal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Metal</p>
            <div className="flex gap-2 flex-wrap">
              {METALS.map(m => <FilterBtn key={m} active={metal === m} onClick={() => setMetal(m)}>{m}</FilterBtn>)}
            </div>
          </div>

          {/* In stock toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="accent-black" />
              In stock only
            </label>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-gray-700 underline">Reset filters</button>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">{products.length} results</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-1">No results found</p>
            <p className="text-sm">Try different filters or search terms</p>
          </div>
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