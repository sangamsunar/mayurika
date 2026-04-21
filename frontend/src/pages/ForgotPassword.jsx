import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('/forgot-password', { email })
      if (data.error) toast.error(data.error)
      else { toast.success('Reset code sent'); navigate('/verify-otp', { state: { email } }) }
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
        className="w-full max-w-md relative z-10">

        <div className="text-center mb-10">
          <Link to="/" className="font-display font-bold text-3xl tracking-[0.22em] text-gradient-gold block mb-2">
            MARYURIKA
          </Link>
          <p className="text-ink-dim text-sm tracking-wide">Reset your password</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="w-14 h-14 glass-gold rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 className="font-display text-center text-xl font-semibold text-ink mb-2">Forgot your password?</h2>
          <p className="text-center text-sm text-ink-muted mb-7">Enter your email and we'll send you a reset code.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]">Email Address</label>
              <input type="email" required autoFocus className="inp-dark" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-gold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[#07070A]/30 border-t-[#07070A] rounded-full animate-spin" />Sending…</>
              ) : 'Send Reset Code'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-dim mt-6">
            Remember it?{' '}
            <Link to="/login" className="text-[#C9A96E] hover:text-[#E8D4A0] font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
