import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const GENDER_OPTIONS = [
  { value: 'female',            label: 'Female', icon: '♀' },
  { value: 'male',              label: 'Male',   icon: '♂' },
  { value: 'other',             label: 'Other',  icon: '✦' },
  { value: 'prefer_not_to_say', label: 'Private',icon: '—' },
]

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.06 } } }

export const Register = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({ name: '', email: '', password: '', phone: '', gender: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setData(p => ({ ...p, [k]: v }))

  const registerUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: res } = await axios.post('/register', data)
      if (res.error) toast.error(res.error)
      else { toast.success('OTP sent to your email!'); navigate('/verify-email', { state: { email: data.email } }) }
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  const lbl = "block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]"
  const pwStr = data.password.length === 0 ? null : data.password.length < 6 ? 'weak' : data.password.length < 10 ? 'fair' : 'strong'
  const strColor = { weak: 'bg-rose-400', fair: 'bg-amber-400', strong: 'bg-emerald-500' }
  const strWidth = { weak: '33%', fair: '66%', strong: '100%' }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
        className="w-full max-w-md relative z-10">

        {/* Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="font-display font-bold text-3xl tracking-[0.22em] text-gradient-gold block mb-2">
            MARYURIKA
          </Link>
          <p className="text-ink-dim text-sm tracking-wide">Create your account</p>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="glass rounded-2xl p-8 space-y-5">
          <form onSubmit={registerUser} className="space-y-5">

            <motion.div variants={fadeUp}>
              <label className={lbl}>Full Name</label>
              <input type="text" required className="inp-dark" placeholder="Your full name"
                value={data.name} onChange={e => set('name', e.target.value)} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>Email Address</label>
              <input type="email" required className="inp-dark" placeholder="you@example.com"
                value={data.email} onChange={e => set('email', e.target.value)} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>Phone <span className="text-ink-dim font-normal normal-case tracking-normal opacity-60">optional</span></label>
              <input type="tel" className="inp-dark" placeholder="98XXXXXXXX"
                value={data.phone} onChange={e => set('phone', e.target.value)} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>Gender <span className="text-ink-dim font-normal normal-case tracking-normal opacity-60">optional</span></label>
              <div className="grid grid-cols-4 gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => set('gender', data.gender === opt.value ? '' : opt.value)}
                    className={`py-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all
                      ${data.gender === opt.value
                        ? 'bg-[#C9A96E]/15 border-[#C9A96E]/50 text-[#C9A96E]'
                        : 'border-white/[0.08] text-ink-muted hover:border-white/20'}`}>
                    <span className="text-base leading-none">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required className="inp-dark pr-14"
                  placeholder="At least 6 characters"
                  value={data.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-widest text-ink-dim hover:text-ink-muted transition">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <AnimatePresence>
                {pwStr && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1">
                    <div className="h-0.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${strColor[pwStr]}`}
                        initial={{ width: 0 }} animate={{ width: strWidth[pwStr] }} transition={{ duration: 0.3 }} />
                    </div>
                    <p className={`text-[10px] capitalize font-medium
                      ${pwStr === 'weak' ? 'text-rose-400' : pwStr === 'fair' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {pwStr} password
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button variants={fadeUp} type="submit" disabled={loading}
              className="w-full btn-gold disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[#07070A]/30 border-t-[#07070A] rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-ink-dim pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C9A96E] hover:text-[#E8D4A0] font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>

        <p className="text-center text-[11px] text-ink-dim mt-6">
          By joining you agree to our{' '}
          <Link to="/return-policy" className="underline hover:text-ink-muted transition-colors">terms & policies</Link>
        </p>
      </motion.div>
    </div>
  )
}
