import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const VerifyOtp = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  if (!email) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-10 text-center max-w-sm">
          <div className="w-14 h-14 glass-gold rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">Session expired</h2>
          <p className="text-sm text-ink-dim mb-6">Please start the password reset process again.</p>
          <Link to="/forgot-password" className="btn-gold inline-block">Start Over</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('/verify-otp', { email, otp })
      if (data.error) toast.error(data.error)
      else { toast.success('Code verified!'); navigate('/reset-password', { state: { email, otp } }) }
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
          <p className="text-ink-dim text-sm tracking-wide">Enter verification code</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="w-14 h-14 glass-gold rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 5L2 7" />
            </svg>
          </div>

          <h2 className="font-display text-center text-xl font-semibold text-ink mb-2">Check your inbox</h2>
          <p className="text-center text-sm text-ink-muted mb-7">
            We sent a 6-digit code to <span className="text-[#C9A96E]">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]">Verification Code</label>
              <input type="text" inputMode="numeric" autoFocus required maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="inp-dark text-center tracking-[0.5em] font-mono" />
            </div>

            <button type="submit" disabled={loading || otp.length < 6}
              className="w-full btn-gold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[#07070A]/30 border-t-[#07070A] rounded-full animate-spin" />Verifying…</>
              ) : 'Verify Code'}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-[11px] text-ink-dim">Didn't receive it? Check your spam folder.</p>
            <Link to="/forgot-password" className="text-[11px] tracking-wider text-ink-dim hover:text-[#C9A96E] transition-colors inline-block">
              ← Use a different email
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
