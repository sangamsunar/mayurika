import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPinIcon, WhatsAppIcon, ArrowRightIcon, SparkleIcon } from '../components/Icons'

/* ── Placeholder images — replace with your own when ready ── */
const IMG_HERO = '/hero-pic.jpg'
const IMG_CRAFT = 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80'
const IMG_ARTISAN = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80'

const VALUES = [
  { num: '01', title: 'Purity & Trust', desc: 'Every piece is hallmark certified by the Government of Nepal. We never compromise on the purity of our metals.', accent: '#C9A96E' },
  { num: '02', title: 'Craftsmanship First', desc: 'Our artisans are master craftsmen from Patan and Bhaktapur — the historic heart of Nepali metalwork.', accent: '#2DD4BF' },
  { num: '03', title: 'Supporting Local', desc: 'By choosing MAYURIKA, you support local Nepali artisans and the preservation of ancient jewellery traditions.', accent: '#A78BFA' },
  { num: '04', title: 'Innovation', desc: 'We are the first jewellery brand in Nepal to offer interactive 3D previews of every piece before it is made.', accent: '#F472B6' },
  { num: '05', title: 'Personal Service', desc: 'We are a small team that cares deeply. Every custom order is a personal conversation — we listen, design, deliver.', accent: '#60A5FA' },
  { num: '06', title: 'Proudly Nepali', desc: 'From the metals we source to the hands that craft them — everything about MAYURIKA is rooted in Nepal.', accent: '#34D399' },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: '#04040A' }}>

      {/* ══════════════════════════════════════════════════════════
          HERO — Our Story
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '88vh' }}>

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={IMG_HERO}
            alt="MAYURIKA — Our Story"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.38) saturate(0.8)' }}
          />
        </div>

        {/* Multi-layer gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bottom bleed into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4"
            style={{ background: 'linear-gradient(to top, #04040A 0%, #04040A 10%, rgba(4,4,10,0.8) 45%, transparent 100%)' }} />
          {/* Top vignette */}
          <div className="absolute top-0 left-0 right-0 h-1/3"
            style={{ background: 'linear-gradient(to bottom, rgba(4,4,10,0.6) 0%, transparent 100%)' }} />
          {/* Center horizontal darkening */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(4,4,10,0.4) 100%)' }} />
          {/* Gold accent tint */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,169,110,0.07) 0%, transparent 60%)' }} />
        </div>

        {/* Content — centered, positioned toward bottom */}
        <div className="relative z-10 flex flex-col items-center justify-end text-center max-w-4xl mx-auto px-8"
          style={{ minHeight: '88vh', paddingBottom: '6rem' }}>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center justify-center gap-3 mb-7">
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.7))' }} />
              <p className="text-[10px] tracking-[0.5em] uppercase font-medium" style={{ color: '#C9A96E' }}>
                Our Story
              </p>
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.7), transparent)' }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display font-bold tracking-[0.12em] mb-7 text-gradient-gold"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: 0.92 }}>
              MAYURIKA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-base md:text-xl leading-relaxed max-w-2xl mx-auto font-light"
              style={{ color: 'rgba(240,235,225,0.65)' }}>
              Born in the heart of Pokhara, where ancient Nepali jewellery traditions
              meet modern design and technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-3 justify-center mt-10">
              <Link to="/search"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold tracking-widest transition-all"
                style={{ background: '#C9A96E', color: '#04040A' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
                onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
                Shop Collection <ArrowRightIcon size={14} strokeWidth={2} />
              </Link>
              <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
                className="glass flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm tracking-widest transition-all"
                style={{ color: 'rgba(240,235,225,0.7)' }}>
                <WhatsAppIcon size={16} /> Custom Order
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LEGACY — Crafted with Purpose
      ══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-8 md:px-14 max-w-[1440px] mx-auto">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid md:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: '#C9A96E', opacity: 0.6 }} />
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: '#C9A96E' }}>Legacy</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-8" style={{ color: '#F0EBE1' }}>
              Crafted with<br /><em className="not-italic text-gradient-gold">Purpose</em>
            </h2>
            <div className="space-y-5 text-sm md:text-base leading-relaxed" style={{ color: 'rgba(240,235,225,0.55)' }}>
              <p>MAYURIKA was founded with a single belief — that jewellery is not just an accessory, it is a story. Every piece we craft carries the weight of generations of Nepali artisanship, passed down through families in Pokhara, Patan, Bhaktapur, and Kathmandu.</p>
              <p>We started as a small workshop in Pokhara, working with local goldsmiths who had honed their craft over decades. Today, we bring that same craftsmanship to you — enhanced with 3D visualization so you can see every detail before your piece is made.</p>
              <p>From traditional Tilhari and Churra worn at Nepali weddings, to bold gothic pieces for the youth — we believe every person deserves jewellery that tells their unique story.</p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[['15+', 'Years of craft'], ['1000+', 'Pieces made'], ['100%', 'Hallmark cert.']].map(([num, label]) => (
                <div key={label} className="rounded-xl p-4 text-center"
                  style={{ background: '#08080F', border: '1px solid rgba(201,169,110,0.12)' }}>
                  <p className="font-display text-2xl font-bold text-gradient-gold">{num}</p>
                  <p className="text-[10px] mt-1 tracking-wide" style={{ color: 'rgba(240,235,225,0.38)' }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image panel */}
          <motion.div variants={fadeUp} className="relative">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/5' }}>
              <img
                src={IMG_CRAFT}
                alt="MAYURIKA jewellery craftsmanship"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.85) saturate(1.1)' }}
              />
              {/* Gold gradient overlay */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.08) 0%, transparent 60%, rgba(4,4,10,0.4) 100%)' }} />
              {/* Border */}
              <div className="absolute inset-0 rounded-3xl"
                style={{ border: '1px solid rgba(201,169,110,0.15)' }} />
            </div>

            {/* Floating badge — bottom left */}
            <div className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-4 glass-gold"
              style={{ backdropFilter: 'blur(20px)' }}>
              <p className="font-display text-2xl font-bold text-gradient-gold">Est. 2010</p>
              <p className="text-[10px] tracking-widest mt-0.5" style={{ color: 'rgba(240,235,225,0.45)' }}>
                Pokhara, Nepal
              </p>
            </div>

            {/* Decorative dot grid */}
            <div className="absolute -top-6 -right-6 w-32 h-32 pointer-events-none opacity-[0.35]">
              <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots-about" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="7" cy="7" r="1.2" fill="#C9A96E" />
                  </pattern>
                </defs>
                <rect width="128" height="128" fill="url(#dots-about)" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ARTISAN BANNER — full-width image strip
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ height: '55vh', maxHeight: 480 }}>
        <img
          src={IMG_ARTISAN}
          alt="Nepali jewellery artisan at work"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.42) saturate(0.85)' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(4,4,10,0.75) 0%, rgba(4,4,10,0.3) 50%, rgba(4,4,10,0.75) 100%)' }} />
          <div className="absolute top-0 bottom-0 left-0 right-0"
            style={{ background: 'linear-gradient(to bottom, rgba(4,4,10,0.6) 0%, transparent 30%, transparent 70%, rgba(4,4,10,0.6) 100%)' }} />
        </div>
        {/* Quote overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}>
            <p className="text-[10px] tracking-[0.5em] uppercase mb-5" style={{ color: '#C9A96E' }}>
              Master Craftsmen
            </p>
            <blockquote className="font-display font-semibold max-w-2xl leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#F0EBE1' }}>
              "Every piece is a conversation between tradition and the person who will wear it."
            </blockquote>
            <p className="mt-5 text-sm" style={{ color: 'rgba(240,235,225,0.4)' }}>
              — Our Pokhara Workshop
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VALUES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-8 md:px-14" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(240,235,225,0.3)' }}>Principles</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: '#F0EBE1' }}>
              What We Stand For
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(val => (
              <motion.div key={val.title} variants={fadeUp}
                className="rounded-2xl p-7 group transition-all duration-400 relative overflow-hidden"
                style={{ background: '#08080F', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = `1px solid ${val.accent}30`
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}>

                {/* Ambient corner glow */}
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse, ${val.accent}18, transparent 70%)` }} />

                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${val.accent}12`, border: `1px solid ${val.accent}25` }}>
                  <span className="font-display text-sm font-bold" style={{ color: val.accent }}>{val.num}</span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2.5" style={{ color: '#F0EBE1' }}>{val.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,235,225,0.42)' }}>{val.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PROCESS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 md:px-14" style={{ background: '#08080F', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(240,235,225,0.3)' }}>Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-5" style={{ color: '#F0EBE1' }}>
              The Craft Behind Every Piece
            </h2>
            <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: 'rgba(240,235,225,0.42)' }}>
              Jewellery making in Nepal is a sacred tradition. Our craftsmen follow processes passed down through generations — from wax carving and casting to stone setting and polishing.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px"
              style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.35), rgba(13,148,136,0.35), rgba(167,139,250,0.35))' }} />

            {[
              { step: '01', title: 'Design', desc: 'Customer selects design, metal, purity and weight — previewed in 3D.', accent: '#C9A96E' },
              { step: '02', title: 'Crafting', desc: 'Master artisans hand-craft your piece in our Pokhara workshop.', accent: '#2DD4BF' },
              { step: '03', title: 'Delivery', desc: 'Hallmark certified, beautifully packaged, delivered to your door.', accent: '#A78BFA' },
            ].map(s => (
              <motion.div key={s.step} variants={fadeUp}
                className="rounded-2xl p-8 text-center relative"
                style={{ background: '#04040A', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-display font-bold text-xl"
                  style={{ background: `${s.accent}12`, border: `1px solid ${s.accent}25`, color: s.accent }}>
                  {s.step}
                </div>
                <h3 className="font-display text-xl font-semibold mb-3" style={{ color: '#F0EBE1' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,235,225,0.42)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VISIT STORE
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.04) 0%, transparent 65%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
            <MapPinIcon size={22} style={{ color: '#C9A96E' }} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4" style={{ color: '#F0EBE1' }}>
            Visit Our Store
          </h2>
          <p className="mb-10 max-w-xl mx-auto text-sm leading-relaxed" style={{ color: 'rgba(240,235,225,0.45)' }}>
            Come see us in person. Try on pieces, meet our craftsmen, and experience MAYURIKA up close.
          </p>
          <a href="https://maps.app.goo.gl/yrSCeXrXMU2mAK387" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold tracking-widest transition-all"
            style={{ background: '#C9A96E', color: '#04040A' }}
            onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
            onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
            Get Directions <ArrowRightIcon size={14} />
          </a>
          <p className="text-[11px] mt-5 tracking-wider" style={{ color: 'rgba(240,235,225,0.3)' }}>
            Pokhara, Nepal · Open Sunday–Friday, 10AM–7PM
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-8 text-center" style={{ background: '#08080F', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SparkleIcon size={22} style={{ color: '#C9A96E' }} className="mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3" style={{ color: '#F0EBE1' }}>
            Start Your Journey
          </h2>
          <p className="mb-10 text-sm" style={{ color: 'rgba(240,235,225,0.42)' }}>
            Find your perfect piece or tell us your dream design.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/search"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold tracking-widest transition-all"
              style={{ background: '#C9A96E', color: '#04040A' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
              onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
              Shop Collection
            </Link>
            <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
              className="glass inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm tracking-widest transition-all"
              style={{ color: 'rgba(37,211,102,0.8)' }}>
              <WhatsAppIcon size={16} /> Custom Order
            </a>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
