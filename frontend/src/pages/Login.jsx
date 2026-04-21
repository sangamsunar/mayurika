import { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserContext } from '../../context/userContext'
import { XIcon } from '../components/Icons'

export const Login = () => {
  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || null

  const [data, setData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setData(p => ({ ...p, [k]: v }))

  const loginUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: res } = await axios.post('/login', data)
      if (res.error) {
        toast.error(res.error)
      } else {
        setUser(res)
        toast.success('Welcome back!')
        navigate(res.role === 'admin' ? '/admin' : (from || '/'))
      }
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

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
          <p className="text-ink-dim text-sm tracking-wide">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          <form onSubmit={loginUser} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]">Email</label>
              <input type="email" required autoFocus className="inp-dark" placeholder="you@example.com"
                value={data.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required className="inp-dark pr-14"
                  placeholder="Your password"
                  value={data.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-muted text-[10px] tracking-widest transition">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-[10px] tracking-wider text-ink-dim hover:text-[#C9A96E] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-gold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[#07070A]/30 border-t-[#07070A] rounded-full animate-spin" />Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-dim pt-2">
            No account?{' '}
            <Link to="/register" className="text-[#C9A96E] hover:text-[#E8D4A0] font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
