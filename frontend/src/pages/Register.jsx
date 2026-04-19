import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const GENDER_OPTIONS = [
  { value: 'female',            label: 'Female', icon: '♀' },
  { value: 'male',              label: 'Male',   icon: '♂' },
  { value: 'other',             label: 'Other',  icon: '✦' },
  { value: 'prefer_not_to_say', label: 'Private', icon: '—' },
]

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

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
      else {
        toast.success('OTP sent to your email!')
        navigate('/verify-email', { state: { email: data.email } })
      }
    } catch {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  const inp = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-700 focus:ring-1 focus:ring-stone-700 transition bg-white placeholder:text-stone-300"
  const lbl = "block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-widest"

  const pwStrength = data.password.length === 0 ? null : data.password.length < 6 ? 'weak' : data.password.length < 10 ? 'fair' : 'strong'
  const strengthColor = { weak: 'bg-rose-400', fair: 'bg-amber-400', strong: 'bg-emerald-500' }
  const strengthWidth = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4 py-14">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <motion.h1 initial={{ opacity: 0, letterSpacing: '0.5em' }} animate={{ opacity: 1, letterSpacing: '0.25em' }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold tracking-[0.25em] text-stone-900">
            MARYURIKA
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-stone-400 text-sm mt-1.5">
            Create your account
          </motion.p>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show"
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 space-y-5">

          <form onSubmit={registerUser} className="space-y-5">

            <motion.div variants={fadeUp}>
              <label className={lbl}>Full Name</label>
              <input type="text" required className={inp} placeholder="Your full name"
                value={data.name} onChange={e => set('name', e.target.value)} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>Email Address</label>
              <input type="email" required className={inp} placeholder="you@example.com"
                value={data.email} onChange={e => set('email', e.target.value)} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>
                Phone Number{' '}
                <span className="text-stone-300 font-normal normal-case tracking-normal">optional</span>
              </label>
              <input type="tel" className={inp} placeholder="98XXXXXXXX"
                value={data.phone} onChange={e => set('phone', e.target.value)} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>
                Gender{' '}
                <span className="text-stone-300 font-normal normal-case tracking-normal">optional</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => set('gender', data.gender === opt.value ? '' : opt.value)}
                    className={`py-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all
                      ${data.gender === opt.value
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                        : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}>
                    <span className="text-base leading-none">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className={lbl}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required
                  className={inp + ' pr-14'}
                  placeholder="At least 6 characters"
                  value={data.password}
                  onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-medium transition">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Strength bar */}
              <AnimatePresence>
                {pwStrength && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1">
                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${strengthColor[pwStrength]}`}
                        initial={{ width: 0 }}
                        animate={{ width: strengthWidth[pwStrength] === 'w-1/3' ? '33%' : strengthWidth[pwStrength] === 'w-2/3' ? '66%' : '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className={`text-[11px] capitalize font-medium
                      ${pwStrength === 'weak' ? 'text-rose-400' : pwStrength === 'fair' ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {pwStrength} password
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button variants={fadeUp}
              type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-stone-400 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-stone-900 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-stone-400 mt-6">
          By creating an account you agree to our{' '}
          <Link to="/return-policy" className="underline hover:text-stone-600">terms & policies</Link>
        </p>
      </motion.div>
    </div>
  )
}
