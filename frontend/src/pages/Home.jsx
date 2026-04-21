import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { ArrowRightIcon, WhatsAppIcon, CheckIcon, DiamondIcon } from '../components/Icons'

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.09 } } }
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.7 } } }

const CATEGORIES = [
  {
    label: 'Women', sub: 'Bridal, casual & more', path: '/women', num: '01',
    from: 'rgba(190,24,93,0.18)', to: 'rgba(124,58,237,0.10)',
    accent: '#F472B6', borderAccent: 'rgba(244,114,182,0.25)',
    symbol: '◆',
  },
  {
    label: 'Men', sub: 'Rings, chains & sets', path: '/men', num: '02',
    from: 'rgba(30,64,175,0.22)', to: 'rgba(13,148,136,0.10)',
    accent: '#60A5FA', borderAccent: 'rgba(96,165,250,0.25)',
    symbol: '◈',
  },
  {
    label: 'Unisex', sub: 'Designed for all', path: '/unisex', num: '03',
    from: 'rgba(13,148,136,0.22)', to: 'rgba(5,150,105,0.10)',
    accent: '#2DD4BF', borderAccent: 'rgba(45,212,191,0.25)',
    symbol: '✦',
  },
  {
    label: 'Wedding', sub: 'Traditional bridal', path: '/search?style=wedding', num: '04',
    from: 'rgba(201,169,110,0.22)', to: 'rgba(180,83,9,0.10)',
    accent: '#C9A96E', borderAccent: 'rgba(201,169,110,0.35)',
    symbol: '❋',
  },
  {
    label: 'Traditional', sub: 'Tilhari, pote & more', path: '/search?style=traditional', num: '05',
    from: 'rgba(124,58,237,0.22)', to: 'rgba(109,40,217,0.10)',
    accent: '#A78BFA', borderAccent: 'rgba(167,139,250,0.25)',
    symbol: '◉',
  },
]

const PILLARS = [
  { icon: <CheckIcon size={16} />, title: 'Hallmark Certified', desc: 'Government-certified purity on every piece', accent: '#C9A96E' },
  { icon: <DiamondIcon size={16} />, title: '3D Preview', desc: 'See your jewellery from every angle before ordering', accent: '#2DD4BF' },
  { icon: <CheckIcon size={16} />, title: 'Custom Orders', desc: 'Made to your exact size and specification', accent: '#A78BFA' },
  { icon: <CheckIcon size={16} />, title: 'Made in Nepal', desc: 'Supporting local Nepali craftsmen and artisans', accent: '#F472B6' },
]

const PROCESS = [
  { step: '01', label: 'Design', desc: 'Choose your piece or describe a custom idea', accent: '#C9A96E' },
  { step: '02', label: 'Crafting', desc: 'Master artisans handcraft every detail', accent: '#2DD4BF' },
  { step: '03', label: 'Delivery', desc: 'Delivered to your door or ready for pickup', accent: '#A78BFA' },
]

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
      } catch { toast.error('Could not load products') }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#04040A' }}>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[96vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden grain">

        {/* Layered ambient background — peacock palette */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Hero background image */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'url(/hero-pic.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(4,4,10,0.72) 0%, rgba(4,4,10,0.55) 50%, rgba(4,4,10,0.88) 100%)' }} />

          {/* Gold glow — top-center */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.14) 0%, transparent 65%)', animation: 'pulse-glow 8s ease-in-out infinite' }} />
          {/* Teal glow — bottom-left */}
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.09) 0%, transparent 70%)', animation: 'pulse-glow 10s ease-in-out infinite 2s' }} />
          {/* Plum glow — top-right */}
          <div className="absolute top-0 right-0 w-[400px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)', animation: 'pulse-glow 12s ease-in-out infinite 4s' }} />

          {/* Subtle dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#C9A96E" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>

          {/* Thin diagonal accent lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)' }} />
        </div>

        <motion.div initial="hidden" animate="show" variants={stagger} className="relative z-10 max-w-5xl">

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-7">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.6))' }} />
            <p className="text-[10px] md:text-xs tracking-[0.45em] uppercase font-medium"
              style={{ color: '#C9A96E' }}>
              Handcrafted in Nepal
            </p>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.6), transparent)' }} />
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="font-display font-bold leading-[0.86] tracking-[0.06em] mb-8"
            style={{ fontSize: 'clamp(3.8rem,13vw,10rem)' }}>
            <span className="text-gradient-gold">MAYU</span>
            <span style={{ color: '#F0EBE1' }}>RIKA</span>
          </motion.h1>

          <motion.p variants={fadeUp}
            className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed font-light"
            style={{ color: 'rgba(240,235,225,0.55)' }}>
            Exquisite jewellery where ancient Nepali tradition meets bold modern vision.
            Every piece, a living story.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
            <Link to="/women"
              className="flex items-center gap-2.5 px-8 py-3.5 font-semibold text-sm tracking-widest rounded-xl transition-all duration-200 active:scale-[.98]"
              style={{ background: '#C9A96E', color: '#04040A' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
              onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
              Shop Women
              <ArrowRightIcon size={14} strokeWidth={2} />
            </Link>
            <Link to="/men"
              className="glass flex items-center gap-2.5 px-8 py-3.5 text-sm tracking-widest rounded-xl transition-all duration-200"
              style={{ color: '#F0EBE1' }}>
              Shop Men
            </Link>
            <Link to="/search"
              className="flex items-center gap-2 px-6 py-3.5 text-sm tracking-widest rounded-xl transition-all"
              style={{ color: 'rgba(240,235,225,0.4)' }}>
              All Collections
              <ArrowRightIcon size={12} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Live gold rate strip */}
        {goldRate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.7 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 md:gap-10 text-[11px] tracking-wider whitespace-nowrap"
            style={{ color: 'rgba(240,235,225,0.28)' }}>
            <span>Fine Gold <strong className="font-medium" style={{ color: '#C9A96E' }}>Rs {goldRate.fineGoldPerTola?.toLocaleString()}</strong>/tola</span>
            <span style={{ color: 'rgba(255,255,255,0.08)' }}>|</span>
            <span>Silver <strong className="font-medium" style={{ color: 'rgba(240,235,225,0.55)' }}>Rs {goldRate.silverPerTola?.toLocaleString()}</strong>/tola</span>
            <span style={{ color: 'rgba(255,255,255,0.08)' }}>|</span>
            <span style={{ color: goldRate.isManual ? 'rgba(240,235,225,0.28)' : 'rgba(45,212,191,0.7)' }}>
              {goldRate.isManual ? 'Manual' : '● Live'}
            </span>
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2"
          style={{ color: 'rgba(240,235,225,0.25)' }}>
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)' }} />
          <p className="text-[9px] tracking-[0.3em] rotate-90 origin-center translate-y-4">SCROLL</p>
        </motion.div>
      </section>

      {/* Peacock divider */}
      <div className="divider-peacock opacity-60" />

      {/* ══════════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-10" style={{ background: '#04040A' }}>
        <div className="max-w-[1440px] mx-auto">

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.p variants={fadeUp}
              className="text-[10px] tracking-[0.35em] uppercase mb-3"
              style={{ color: 'rgba(240,235,225,0.28)' }}>Collections</motion.p>
            <div className="flex justify-between items-end">
              <motion.h2 variants={fadeUp}
                className="font-display text-4xl md:text-5xl font-semibold"
                style={{ color: '#F0EBE1' }}>
                Shop by Category
              </motion.h2>
              <motion.div variants={fadeIn}>
                <Link to="/search"
                  className="hidden md:flex items-center gap-1.5 text-[11px] tracking-[0.2em] transition-colors"
                  style={{ color: 'rgba(240,235,225,0.45)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,225,0.45)'}>
                  ALL PRODUCTS <ArrowRightIcon size={12} />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.label} variants={fadeUp}>
                <Link to={cat.path}
                  className="group relative flex flex-col justify-between h-52 md:h-72 rounded-2xl p-6 overflow-hidden transition-all duration-500"
                  style={{
                    background: `linear-gradient(145deg, ${cat.from}, ${cat.to}, rgba(4,4,10,0.95))`,
                    border: `1px solid rgba(255,255,255,0.06)`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${cat.borderAccent}`
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 20px 60px ${cat.from}`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>

                  {/* Large decorative symbol */}
                  <div className="absolute bottom-3 right-4 font-display font-bold select-none pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:opacity-20"
                    style={{ fontSize: 'clamp(4rem,8vw,6rem)', color: cat.accent, opacity: 0.1, lineHeight: 1 }}>
                    {cat.symbol}
                  </div>

                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none shimmer" />

                  <span className="text-[10px] tracking-[0.25em]" style={{ color: 'rgba(240,235,225,0.3)' }}>{cat.num}</span>

                  <div>
                    <h3 className="font-display text-2xl md:text-xl font-semibold mb-1 transition-colors duration-300"
                      style={{ color: '#F0EBE1' }}
                      ref={el => {
                        if (!el) return
                        el.parentElement?.parentElement?.parentElement?.addEventListener('mouseenter', () => el.style.color = cat.accent)
                        el.parentElement?.parentElement?.parentElement?.addEventListener('mouseleave', () => el.style.color = '#F0EBE1')
                      }}>
                      {cat.label}
                    </h3>
                    <p className="text-xs tracking-wide mb-3" style={{ color: 'rgba(240,235,225,0.38)' }}>{cat.sub}</p>
                    <div className="flex items-center gap-1 text-[10px] tracking-widest transition-colors duration-300"
                      style={{ color: cat.accent, opacity: 0.7 }}>
                      EXPLORE <ArrowRightIcon size={10} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-10" style={{ background: '#08080F' }}>
        <div className="max-w-[1440px] mx-auto">

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.p variants={fadeUp}
              className="text-[10px] tracking-[0.35em] uppercase mb-3"
              style={{ color: 'rgba(240,235,225,0.28)' }}>Handpicked</motion.p>
            <div className="flex justify-between items-end">
              <motion.h2 variants={fadeUp}
                className="font-display text-4xl md:text-5xl font-semibold"
                style={{ color: '#F0EBE1' }}>
                Featured Collection
              </motion.h2>
              <motion.div variants={fadeIn}>
                <Link to="/search"
                  className="hidden md:flex items-center gap-1.5 text-[11px] tracking-[0.2em] transition-colors"
                  style={{ color: 'rgba(240,235,225,0.45)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,225,0.45)'}>
                  VIEW ALL <ArrowRightIcon size={12} />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl aspect-square animate-pulse" style={{ background: '#0E0E18' }} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-24" style={{ color: 'rgba(240,235,225,0.28)' }}>
              <p className="font-display text-3xl mb-3" style={{ color: 'rgba(240,235,225,0.45)' }}>No products yet</p>
              <p className="text-sm">Check back soon for our collection.</p>
            </div>
          ) : (
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map(product => (
                <motion.div key={product._id} variants={fadeUp}>
                  <ProductCard product={product} goldRate={goldRate} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3D EXPERIENCE BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-36 px-6 md:px-10 overflow-hidden grain">
        {/* Dramatic peacock gradient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(13,148,136,0.10) 50%, rgba(201,169,110,0.08) 100%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, transparent 70%)' }} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-3d" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-3d)" />
          </svg>
        </div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="max-w-3xl mx-auto text-center relative z-10">

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(13,148,136,0.6))' }} />
            <p className="text-[10px] tracking-[0.45em] uppercase font-medium" style={{ color: '#2DD4BF' }}>
              Interactive Experience
            </p>
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, rgba(13,148,136,0.6), transparent)' }} />
          </motion.div>

          <motion.h2 variants={fadeUp}
            className="font-display text-4xl md:text-6xl font-semibold mb-6 leading-tight"
            style={{ color: '#F0EBE1' }}>
            See Every Piece in{' '}
            <em className="not-italic text-gradient-teal">3D</em>
          </motion.h2>

          <motion.p variants={fadeUp}
            className="text-base max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ color: 'rgba(240,235,225,0.5)' }}>
            The first jewellery brand in Nepal to offer live 3D previews. Rotate, zoom, and switch between metals before a single gram is melted.
          </motion.p>

          <motion.div variants={fadeUp} className="flex gap-3 justify-center">
            <button onClick={() => navigate('/search')}
              className="glass-teal flex items-center gap-2 px-8 py-4 text-sm font-semibold tracking-widest rounded-xl transition-all"
              style={{ color: '#2DD4BF' }}>
              Explore Collection
              <ArrowRightIcon size={14} strokeWidth={2} />
            </button>
            <button onClick={() => navigate('/search')}
              className="glass flex items-center gap-2 px-6 py-4 text-sm tracking-widest rounded-xl transition-all"
              style={{ color: 'rgba(240,235,225,0.45)' }}>
              How it Works
            </button>
          </motion.div>

          {/* Floating decorative 3D cube icon */}
          <motion.div
            variants={fadeIn}
            className="mt-16 mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl float"
            style={{
              background: 'rgba(13,148,136,0.08)',
              border: '1px solid rgba(13,148,136,0.2)',
              boxShadow: '0 0 40px rgba(13,148,136,0.12)',
            }}>
            ◈
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PROCESS — 3 STEPS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10" style={{ background: '#04040A', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-[1440px] mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp}
              className="text-[10px] tracking-[0.35em] uppercase mb-3 text-center"
              style={{ color: 'rgba(240,235,225,0.28)' }}>How it works</motion.p>
            <motion.h2 variants={fadeUp}
              className="font-display text-4xl md:text-5xl font-semibold text-center mb-16"
              style={{ color: '#F0EBE1' }}>
              From Dream to Doorstep
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px"
                style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.3), rgba(13,148,136,0.3), rgba(167,139,250,0.3))' }} />

              {PROCESS.map((p) => (
                <motion.div key={p.step} variants={fadeUp}
                  className="relative rounded-2xl p-8 text-center group transition-all duration-400"
                  style={{ background: '#08080F', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${p.accent}33`
                    e.currentTarget.style.boxShadow = `0 20px 60px ${p.accent}12`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-display font-bold text-xl"
                    style={{ background: `${p.accent}12`, border: `1px solid ${p.accent}25`, color: p.accent }}>
                    {p.step}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3" style={{ color: '#F0EBE1' }}>{p.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,235,225,0.45)' }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY MAYURIKA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10" style={{ background: '#08080F', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-[1440px] mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp}
              className="text-[10px] tracking-[0.35em] uppercase mb-3"
              style={{ color: 'rgba(240,235,225,0.28)' }}>Our Promise</motion.p>
            <motion.h2 variants={fadeUp}
              className="font-display text-4xl md:text-5xl font-semibold mb-16"
              style={{ color: '#F0EBE1' }}>
              Why Mayurika
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {PILLARS.map(p => (
                <motion.div key={p.title} variants={fadeUp}
                  className="rounded-2xl p-7 group transition-all duration-400 relative overflow-hidden"
                  style={{ background: '#0E0E18', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${p.accent}30`
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>
                  {/* Ambient glow top-right */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse, ${p.accent}15, transparent 70%)` }} />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${p.accent}12`, border: `1px solid ${p.accent}25`, color: p.accent }}>
                    {p.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#F0EBE1' }}>{p.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,235,225,0.45)' }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHATSAPP CTA
      ══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="py-24 px-6 text-center relative overflow-hidden grain"
        style={{ background: '#0E0E18', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden>
          <div className="w-[600px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(37,211,102,0.05) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,211,102,0.5))' }} />
            <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(37,211,102,0.7)' }}>Custom Orders</p>
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, rgba(37,211,102,0.5), transparent)' }} />
          </div>

          <p className="font-display text-3xl md:text-5xl font-semibold mb-3" style={{ color: '#F0EBE1' }}>
            Have a design in mind?
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(240,235,225,0.45)' }}>
            Our master craftsmen bring your vision to life — describe your dream piece.
          </p>

          <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-9 py-4 font-semibold text-sm rounded-xl transition-all"
            style={{
              background: 'rgba(37,211,102,0.08)',
              border: '1px solid rgba(37,211,102,0.25)',
              color: '#25D366',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.14)'; e.currentTarget.style.border = '1px solid rgba(37,211,102,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.08)'; e.currentTarget.style.border = '1px solid rgba(37,211,102,0.25)' }}>
            <WhatsAppIcon size={20} />
            Chat on WhatsApp
          </a>
        </div>
      </motion.section>

    </div>
  )
}
