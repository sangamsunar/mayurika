import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export const ResetPassword = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { email, otp } = state || {}

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!email || !otp) {
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

  const pwStr = newPassword.length === 0 ? null : newPassword.length < 6 ? 'weak' : newPassword.length < 10 ? 'fair' : 'strong'
  const strColor = { weak: 'bg-rose-400', fair: 'bg-amber-400', strong: 'bg-emerald-500' }
  const strWidth = { weak: '33%', fair: '66%', strong: '100%' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/reset-password', { email, otp, newPassword })
      if (data.error) toast.error(data.error)
      else { toast.success('Password reset! Please sign in.'); navigate('/login') }
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  const lbl = "block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]"
  const mismatch = confirmPassword && confirmPassword !== newPassword

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
          <p className="text-ink-dim text-sm tracking-wide">Create a new password</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="w-14 h-14 glass-gold rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <h2 className="font-display text-center text-xl font-semibold text-ink mb-2">Set new password</h2>
          <p className="text-center text-sm text-ink-muted mb-7">
            Choose a strong password for <span className="text-[#C9A96E]">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={lbl}>New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required autoFocus
                  className="inp-dark pr-14" placeholder="At least 6 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
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
            </div>

            <div>
              <label className={lbl}>Confirm Password</label>
              <input type={showPass ? 'text' : 'password'} required
                className={`inp-dark ${mismatch ? 'border-rose-400/50' : ''}`}
                placeholder="Repeat your password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              {mismatch && <p className="text-[10px] text-rose-400 mt-1.5">Passwords don't match</p>}
            </div>

            <button type="submit" disabled={loading || mismatch}
              className="w-full btn-gold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[#07070A]/30 border-t-[#07070A] rounded-full animate-spin" />Resetting…</>
              ) : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
