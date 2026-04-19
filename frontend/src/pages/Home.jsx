import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, rateRes] = await Promise.all([
          axios.get('/products', { params: { inStock: true } }),
          axios.get('/gold-rate')
        ])
        setFeatured(productsRes.data.slice(0, 8))
        setGoldRate(rateRes.data)
      } catch (e) { console.log(e) }
      setLoading(false)
    }
    fetchData()
  }, [])

  const categories = [
    { label: 'Women', path: '/women', emoji: '👩' },
    { label: 'Men', path: '/men', emoji: '👨' },
    { label: 'Wedding', path: '/search?style=wedding', emoji: '💍' },
    { label: 'Youth', path: '/search?style=youth', emoji: '⚡' },
    { label: 'Traditional', path: '/search?style=traditional', emoji: '🪔' },
  ]

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-black text-white min-h-[90vh] flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        {/* ambient glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FFD700 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FFD700 0%, transparent 40%)' }} />
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.4em] text-yellow-400 uppercase mb-4">
          Handcrafted in Nepal
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-widest mb-6">
          MARYURIKA
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-gray-300 text-lg max-w-xl mb-10 leading-relaxed">
          Exquisite jewellery crafted with tradition and vision — from timeless bridal sets to bold youth collections, every piece tells a story.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
          className="flex gap-4">
          <Link to="/women"
            className="bg-yellow-400 text-black px-8 py-3 font-semibold text-sm tracking-wider hover:bg-yellow-300 transition rounded">
            Shop Women
          </Link>
          <Link to="/men"
            className="border border-white text-white px-8 py-3 font-semibold text-sm tracking-wider hover:bg-white hover:text-black transition rounded">
            Shop Men
          </Link>
        </motion.div>

        {/* Live gold rate ticker */}
        {goldRate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8 text-xs text-gray-400">
            <span>🟡 Fine Gold: <strong className="text-yellow-400">Rs {goldRate.fineGoldPerTola?.toLocaleString()}/tola</strong></span>
            <span>⚪ Silver: <strong className="text-gray-300">Rs {goldRate.silverPerTola?.toLocaleString()}/tola</strong></span>
            {goldRate.isManual ? <span className="text-gray-600">(manual)</span> : <span className="text-green-500">● Live</span>}
          </motion.div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-[#fafaf9] py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-2xl font-bold tracking-widest uppercase text-center mb-10 text-stone-900">
            Shop by Category
          </motion.h2>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex gap-4 justify-center flex-wrap">
            {categories.map(cat => (
              <motion.div key={cat.label} variants={fadeUp}>
                <Link to={cat.path}
                  className="flex flex-col items-center gap-3 bg-white rounded-2xl px-8 py-6 shadow-sm hover:shadow-md transition group border border-stone-100 hover:border-stone-900">
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-sm font-semibold uppercase tracking-wider text-stone-600 group-hover:text-stone-900">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-2xl font-bold tracking-widest uppercase text-stone-900">
              Featured Collection
            </motion.h2>
            <Link to="/search" className="text-sm text-stone-400 hover:text-stone-800 underline transition">View all</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-stone-100 rounded-2xl h-72 animate-pulse" />)}
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featured.map(product => (
                <motion.div key={product._id} variants={fadeUp}>
                  <ProductCard product={product} goldRate={goldRate} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 3D Experience Banner */}
      <section className="bg-stone-950 text-white py-20 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[0.3em] text-yellow-400 uppercase mb-3">Interactive Experience</p>
          <h2 className="text-4xl font-bold mb-4">See It in 3D Before You Buy</h2>
          <p className="text-stone-400 max-w-xl mx-auto mb-8">
            Every piece on Maryurika comes with a live 3D model. Rotate, zoom, and toggle between metals to find your perfect piece.
          </p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/search')}
            className="bg-yellow-400 text-black px-8 py-3 font-semibold text-sm rounded-xl hover:bg-yellow-300 transition">
            Explore Collection
          </motion.button>
        </motion.div>
      </section>

      {/* Why Maryurika */}
      <section className="py-16 px-8 bg-[#fafaf9]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-2xl font-bold tracking-widest uppercase text-center mb-12 text-stone-900">
            Why Maryurika
          </motion.h2>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🏅', title: 'Hallmark Certified', desc: 'Government certified purity on all pieces' },
              { icon: '📐', title: 'Custom Orders', desc: 'Made to your exact measurements' },
              { icon: '🔮', title: '3D Preview', desc: 'See your jewellery before it is made' },
              { icon: '🇳🇵', title: 'Made in Nepal', desc: 'Supporting local craftsmen and artisans' },
            ].map(item => (
              <motion.div key={item.title} variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-sm mb-2 text-stone-900">{item.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <motion.section
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="py-12 px-8 bg-emerald-50 text-center">
        <p className="text-sm text-stone-600 mb-3">Have a custom design in mind?</p>
        <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition">
          💬 Chat with us on WhatsApp
        </a>
      </motion.section>

    </div>
  )
}