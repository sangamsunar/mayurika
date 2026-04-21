import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

const fadeUp  = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } } }
const stagger = { show: { transition: { staggerChildren: 0.06 } } }

const STYLES = ['all', 'traditional', 'wedding', 'casual', 'youth']

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="px-3.5 py-1.5 text-[11px] rounded-full capitalize tracking-wide transition-all duration-200"
      style={{
        background: active ? '#C9A96E' : 'transparent',
        color: active ? '#04040A' : 'rgba(240,235,225,0.5)',
        border: active ? '1px solid #C9A96E' : '1px solid rgba(255,255,255,0.09)',
        fontWeight: active ? 600 : 400,
      }}>
      {label}
    </button>
  )
}

export default function CategoryPage({ gender, title, subtitle, categories, heroImage, accentColor = '#C9A96E' }) {
  const [products, setProducts] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('all')
  const [style, setStyle]       = useState('all')

  useEffect(() => { fetchData() }, [category, style])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = { gender }
      if (category !== 'all') params.category = category
      if (style !== 'all')    params.style     = style
      const [productsRes, rateRes] = await Promise.all([
        axios.get('/products', { params }),
        axios.get('/gold-rate')
      ])
      setProducts(productsRes.data)
      setGoldRate(rateRes.data)
    } catch { toast.error('Could not load products') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#04040A' }}>

      {/* ══════════════════════════════════════════════════════════
          HERO — full-bleed background image
      ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ minHeight: '72vh' }}>

        {/* Background image */}
        {heroImage && (
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt={title}
              className="w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.45) saturate(0.9)' }}
            />
          </div>
        )}

        {/* Gradient overlays — multi-stop for depth */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bottom fade — blends into product grid */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3"
            style={{ background: 'linear-gradient(to top, #04040A 0%, #04040A 15%, rgba(4,4,10,0.7) 60%, transparent 100%)' }} />
          {/* Left edge — text legibility */}
          <div className="absolute top-0 left-0 bottom-0 w-3/4"
            style={{ background: 'linear-gradient(to right, rgba(4,4,10,0.7) 0%, rgba(4,4,10,0.3) 50%, transparent 100%)' }} />
          {/* Top vignette */}
          <div className="absolute top-0 left-0 right-0 h-40"
            style={{ background: 'linear-gradient(to bottom, rgba(4,4,10,0.5) 0%, transparent 100%)' }} />
          {/* Subtle color cast matching accent */}
          <div className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 20% 60%, ${accentColor}0D 0%, transparent 55%)` }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full max-w-[1440px] mx-auto px-8 md:px-14"
          style={{ minHeight: '72vh', paddingBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: accentColor, opacity: 0.7 }} />
              <p className="text-[10px] tracking-[0.45em] uppercase font-medium"
                style={{ color: accentColor }}>
                Collection
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
              className="font-display font-bold tracking-[0.05em] mb-5"
              style={{ fontSize: 'clamp(4rem, 11vw, 9rem)', color: '#F0EBE1', lineHeight: 0.9 }}>
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-sm md:text-base leading-relaxed max-w-md"
              style={{ color: 'rgba(240,235,225,0.6)' }}>
              {subtitle}
            </motion.p>

            {/* Product count pill */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-widest"
                style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                  color: accentColor,
                }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} available
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FILTERS + GRID
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-14 pb-20" style={{ paddingTop: '3rem' }}>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-5 mb-10 flex flex-col gap-4"
          style={{ background: '#08080F', border: '1px solid rgba(255,255,255,0.05)' }}>

          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[9px] tracking-[0.3em] uppercase w-14 shrink-0"
              style={{ color: 'rgba(240,235,225,0.28)' }}>Style</span>
            <div className="flex gap-1.5 flex-wrap">
              {STYLES.map(s => (
                <FilterPill key={s} label={s} active={style === s} onClick={() => setStyle(s)} />
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[9px] tracking-[0.3em] uppercase w-14 shrink-0"
              style={{ color: 'rgba(240,235,225,0.28)' }}>Type</span>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(c => (
                <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl aspect-square animate-pulse" style={{ background: '#08080F' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display text-4xl mb-3" style={{ color: 'rgba(240,235,225,0.35)' }}>No pieces found</p>
            <p className="text-sm" style={{ color: 'rgba(240,235,225,0.25)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <motion.div key={product._id} variants={fadeUp}>
                <ProductCard product={product} goldRate={goldRate} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
