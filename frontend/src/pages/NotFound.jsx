import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        className="text-center max-w-md relative z-10">
        <p className="font-display text-[140px] leading-none font-bold text-gradient-gold select-none">404</p>
        <p className="text-[10px] text-ink-dim uppercase tracking-[0.4em] mb-5 -mt-2">Lost in the vault</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-3">Page Not Found</h1>
        <p className="text-ink-dim text-sm mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a new home.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-gold">Go Home</Link>
          <Link to="/women" className="glass-sm px-6 py-3 rounded-xl text-sm text-ink-muted hover:border-white/20 hover:text-ink transition font-medium">
            Shop Collection
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
