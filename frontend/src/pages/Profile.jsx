import { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { UserContext } from '../../context/userContext'

// ─── Constants ────────────────────────────────────────────────────────────────
const ORDER_STATUS_LABELS = {
  working:          { label: 'Being Made',      color: '#6366f1', bg: '#eef2ff' },
  finishing:        { label: 'Finishing',        color: '#8b5cf6', bg: '#f5f3ff' },
  packaging:        { label: 'Packaging',        color: '#f59e0b', bg: '#fffbeb' },
  transit:          { label: 'On the Way',       color: '#f97316', bg: '#fff7ed' },
  ready_for_pickup: { label: 'Ready for Pickup', color: '#10b981', bg: '#ecfdf5' },
  delivered:        { label: 'Delivered',        color: '#6b7280', bg: '#f9fafb' },
  cancelled:        { label: 'Cancelled',        color: '#ef4444', bg: '#fef2f2' },
}
const STATUS_STEPS = ['working', 'finishing', 'packaging', 'transit', 'delivered']
const GENDER_OPTIONS = [
  { value: 'female',         label: 'Female', icon: '♀' },
  { value: 'male',           label: 'Male',   icon: '♂' },
  { value: 'other',          label: 'Other',  icon: '✦' },
  { value: 'prefer_not_to_say', label: 'Private', icon: '—' },
]
const GENDER_LABELS = {
  male: 'Male', female: 'Female', other: 'Other', prefer_not_to_say: 'Prefer not to say'
}

// ─── Account completion score ─────────────────────────────────────────────────
function getCompletion(account) {
  if (!account) return { score: 0, missing: [] }
  const fields = [
    { key: 'name',        label: 'Full name',    check: !!account.name },
    { key: 'phone',       label: 'Phone number', check: !!account.phone },
    { key: 'gender',      label: 'Gender',       check: !!account.gender },
    { key: 'dateOfBirth', label: 'Date of birth',check: !!account.dateOfBirth },
    { key: 'avatar',      label: 'Profile photo',check: !!account.avatar },
    { key: 'addresses',   label: 'Saved address',check: (account.addresses?.length || 0) > 0 },
  ]
  const done    = fields.filter(f => f.check).length
  const missing = fields.filter(f => !f.check).map(f => f.label)
  return { score: Math.round((done / fields.length) * 100), missing }
}

// ─── Receipt Print ────────────────────────────────────────────────────────────
function printReceipt(order) {
  const itemRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0">${item.product?.name || 'Jewellery'}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;color:#666;text-transform:capitalize">${item.selectedMetal} · ${item.selectedPurity} · ${item.selectedWeight}t × ${item.quantity}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right">Rs ${(item.itemTotal || 0).toLocaleString()}</td>
    </tr>
  `).join('')
  const win = window.open('', '_blank', 'width=700,height=900')
  win.document.write(`<!DOCTYPE html><html><head><title>Receipt – Maryurika #${order._id.slice(-8).toUpperCase()}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#111}
    h1{letter-spacing:4px;text-align:center;font-size:22px;margin:0}
    .sub{text-align:center;color:#999;font-size:12px;margin:4px 0 24px}
    hr{border:none;border-top:1px solid #eee;margin:16px 0}
    .row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
    .lbl{color:#666}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    thead tr{background:#000;color:#fff}
    th{padding:10px 4px;font-size:11px;text-align:left}
    th:last-child{text-align:right}
    th:nth-child(2){text-align:center}
    .grand{font-size:15px;font-weight:bold}
    .footer{margin-top:40px;text-align:center;font-size:11px;color:#bbb}
    @media print{body{padding:20px}}
  </style></head><body>
  <h1>MARYURIKA</h1><p class="sub">Official Order Receipt</p><hr/>
  <div class="row"><span class="lbl">Order ID</span><span style="font-family:monospace;font-weight:bold">#${order._id.slice(-8).toUpperCase()}</span></div>
  <div class="row"><span class="lbl">Date</span><span>${new Date(order.createdAt).toLocaleDateString('en-NP',{year:'numeric',month:'long',day:'numeric'})}</span></div>
  <div class="row"><span class="lbl">Delivery</span><span style="text-transform:capitalize">${order.deliveryType}</span></div>
  <div class="row"><span class="lbl">Payment</span><span style="text-transform:capitalize">${order.paymentMethod||'—'}</span></div>
  ${order.deliveryAddress?.fullName?`<div class="row"><span class="lbl">Deliver to</span><span>${order.deliveryAddress.fullName}, ${order.deliveryAddress.address||''}, ${order.deliveryAddress.city||''}</span></div>`:''}
  <hr/><table><thead><tr><th>Item</th><th>Details</th><th style="text-align:right">Price</th></tr></thead><tbody>${itemRows}</tbody></table>
  <div style="margin-top:16px">
    ${order.deliveryCharge>0?`<div class="row"><span class="lbl">Delivery charge</span><span>Rs ${order.deliveryCharge.toLocaleString()}</span></div>`:''}
    <div class="row grand"><span>Grand Total</span><span>Rs ${(order.grandTotal||0).toLocaleString()}</span></div>
    <div class="row" style="color:#16a34a;font-size:13px"><span>Advance Paid</span><span>Rs ${(order.advancePaid||0).toLocaleString()}</span></div>
    ${order.grandTotal-order.advancePaid>0?`<div class="row" style="color:#ea580c;font-size:12px"><span>Balance due on ${order.deliveryType==='pickup'?'pickup':'delivery'}</span><span>Rs ${(order.grandTotal-order.advancePaid).toLocaleString()}</span></div>`:''}
  </div><hr/>
  <div class="footer"><p>Thank you for choosing Maryurika Jewellery</p><p>Kathmandu, Nepal · Computer-generated receipt</p></div>
  <script>window.onload=function(){window.print()}</script></body></html>`)
  win.document.close()
}

// ─── Shared animation variants ────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Profile() {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()
  const avatarRef = useRef()

  const [tab, setTab]         = useState('orders')
  const [orders, setOrders]   = useState([])
  const [account, setAccount] = useState(null)
  const [sizeProfile, setSizeProfile] = useState({ finger: '', neck: '', wrist: '', ankle: '', notes: '' })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [accForm, setAccForm]   = useState({ name: '', phone: '', gender: '', dateOfBirth: '' })
  const [accSaving, setAccSaving] = useState(false)

  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: 'Home', fullName: '', phone: '', address: '', city: '', district: '', isDefault: false })
  const [addrSaving, setAddrSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [ordersRes, profileRes, accountRes] = await Promise.all([
        axios.get('/orders'),
        axios.get('/size-profile'),
        axios.get('/account')
      ])
      setOrders(ordersRes.data)
      const sp = profileRes.data.sizeProfile || {}
      setSizeProfile({ finger: sp.finger||'', neck: sp.neck||'', wrist: sp.wrist||'', ankle: sp.ankle||'', notes: sp.notes||'' })
      const acc = accountRes.data
      setAccount(acc)
      setAccForm({ name: acc.name||'', phone: acc.phone||'', gender: acc.gender||'', dateOfBirth: acc.dateOfBirth ? acc.dateOfBirth.slice(0,10) : '' })
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const { data } = await axios.post('/account/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (data.error) toast.error(data.error)
      else {
        toast.success('Photo updated!')
        setAccount(prev => ({ ...prev, avatar: data.avatar }))
      }
    } catch { toast.error('Upload failed') }
    setAvatarUploading(false)
  }

  const handleSaveAccount = async () => {
    setAccSaving(true)
    try {
      const { data } = await axios.put('/account', accForm)
      if (data.error) toast.error(data.error)
      else { toast.success('Profile updated!'); setAccount(data.user) }
    } catch { toast.error('Something went wrong') }
    setAccSaving(false)
  }

  const handleSaveSize = async () => {
    setSaving(true)
    const { data } = await axios.put('/size-profile', sizeProfile)
    if (data.error) toast.error(data.error)
    else toast.success('Size profile saved!')
    setSaving(false)
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return
    setCancellingId(orderId)
    const { data } = await axios.post(`/orders/${orderId}/cancel`)
    if (data.error) toast.error(data.error)
    else {
      toast.success('Order cancelled')
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o))
    }
    setCancellingId(null)
  }

  const handleSaveAddress = async () => {
    setAddrSaving(true)
    const { data } = await axios.post('/account/addresses', addrForm)
    if (data.error) toast.error(data.error)
    else {
      toast.success('Address saved!')
      setAccount(prev => ({ ...prev, addresses: data.addresses }))
      setShowAddrForm(false)
      setAddrForm({ label: 'Home', fullName: '', phone: '', address: '', city: '', district: '', isDefault: false })
    }
    setAddrSaving(false)
  }

  const handleDeleteAddress = async (id) => {
    const { data } = await axios.delete(`/account/addresses/${id}`)
    if (data.error) toast.error(data.error)
    else { toast.success('Address removed'); setAccount(prev => ({ ...prev, addresses: data.addresses })) }
  }

  const handleLogout = async () => {
    await axios.post('/logout')
    setUser(null)
    navigate('/')
    toast.success('Logged out')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-800 animate-spin" />
        <p className="text-xs tracking-widest uppercase text-stone-400">Loading your profile…</p>
      </motion.div>
    </div>
  )

  const { score, missing } = getCompletion(account)
  const inp = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-700 focus:ring-1 focus:ring-stone-700 transition bg-white placeholder:text-stone-300"
  const lbl = "block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-widest"
  const tabs = [
    { id: 'orders',    label: 'Orders',      icon: '📦' },
    { id: 'account',   label: 'Account',     icon: '👤' },
    { id: 'addresses', label: 'Addresses',   icon: '📍' },
    { id: 'sizes',     label: 'Sizes',       icon: '📐' },
  ]
  const avatarSrc = account?.avatar ? `http://localhost:8000${account.avatar}` : null

  return (
    <div className="min-h-screen bg-[#fafaf9]">

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => avatarRef.current?.click()}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-stone-100 shadow-sm">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  {avatarUploading
                    ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <span className="text-white text-xs font-semibold">Edit</span>
                  }
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-stone-900 truncate">{account?.name || user?.name}</h1>
                {account?.gender && (
                  <span className="text-[11px] text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full capitalize">
                    {GENDER_LABELS[account.gender] || account.gender}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-400">{user?.email}</p>
              {account?.phone && <p className="text-xs text-stone-400 mt-0.5">{account.phone}</p>}

              {/* Completion bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider">Profile {score}% complete</span>
                  {score < 100 && (
                    <button onClick={() => setTab('account')}
                      className="text-[11px] text-amber-600 font-semibold hover:text-amber-700 transition">
                      Complete →
                    </button>
                  )}
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden w-64 max-w-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full rounded-full ${score === 100 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  />
                </div>
              </div>
            </div>

            <button onClick={handleLogout}
              className="flex-shrink-0 text-xs border border-stone-200 px-4 py-2 rounded-xl hover:border-stone-400 hover:text-stone-700 transition text-stone-400">
              Sign out
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative py-4 px-5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors
                  ${tab === t.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
                <span className="hidden sm:inline mr-1.5">{t.icon}</span>{t.label}
                {tab === t.id && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ── ORDERS ──────────────────────────────────────────────────── */}
          {tab === 'orders' && (
            <motion.div key="orders" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
              {orders.length === 0 ? (
                <motion.div variants={fadeUp} className="text-center py-24">
                  <div className="text-5xl mb-4">🛍️</div>
                  <h3 className="text-lg font-bold text-stone-800 mb-1">No orders yet</h3>
                  <p className="text-sm text-stone-400 mb-8">Your future orders will appear here</p>
                  <button onClick={() => navigate('/women')}
                    className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition">
                    Start Shopping
                  </button>
                </motion.div>
              ) : orders.map(order => {
                const si = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: '#6b7280', bg: '#f9fafb' }
                const currentStep = STATUS_STEPS.indexOf(order.status)
                const canCancel = ['working', 'finishing'].includes(order.status)

                return (
                  <motion.div key={order._id} variants={fadeUp}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

                    {/* Status stripe */}
                    <div className="h-1" style={{ background: si.color, opacity: 0.6 }} />

                    <div className="p-5 space-y-4">
                      {/* Header row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">Order</p>
                          <p className="font-mono text-sm font-bold text-stone-800">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ color: si.color, background: si.bg }}>
                          {si.label}
                        </span>
                      </div>

                      {/* Progress steps */}
                      {order.status !== 'cancelled' && (
                        <div className="flex items-center gap-1">
                          {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`w-full h-1.5 rounded-full transition-all duration-500
                                ${i < currentStep ? 'bg-stone-800' : i === currentStep ? 'bg-stone-500' : 'bg-stone-100'}`} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-3">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0] ? (
                                <img src={`http://localhost:8000${item.product.images[0]}`}
                                  className="w-12 h-12 rounded-xl object-cover border border-stone-100" alt="" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 text-lg">💎</div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-stone-800">{item.product?.name || 'Jewellery'}</p>
                                <p className="text-xs text-stone-400 mt-0.5 capitalize">
                                  {item.selectedMetal} · {item.selectedPurity} · {item.selectedWeight} tola
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-stone-800">Rs {item.itemTotal?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-stone-50 pt-3 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex flex-wrap gap-3 text-xs text-stone-400">
                          <span className="capitalize">📦 {order.deliveryType === 'cod' ? 'Cash on Delivery' : order.deliveryType === 'pickup' ? 'Store Pickup' : 'Online'}</span>
                          {order.grandTotal - order.advancePaid > 0 && (
                            <span className="text-amber-500 font-medium">Due Rs {(order.grandTotal - order.advancePaid).toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <button onClick={() => handleCancelOrder(order._id)} disabled={cancellingId === order._id}
                              className="text-xs border border-rose-200 text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-40">
                              {cancellingId === order._id ? '…' : 'Cancel'}
                            </button>
                          )}
                          <button onClick={() => printReceipt(order)}
                            className="text-xs border border-stone-200 text-stone-500 px-3 py-1.5 rounded-lg hover:border-stone-400 hover:bg-stone-50 transition">
                            🧾 Receipt
                          </button>
                          <div className="text-right">
                            <p className="text-[10px] text-stone-400">Total</p>
                            <p className="text-sm font-bold text-stone-900">Rs {order.grandTotal?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {order.statusHistory?.length > 0 && (
                        <details className="text-xs text-stone-400">
                          <summary className="cursor-pointer hover:text-stone-600 select-none">View history</summary>
                          <div className="mt-2 space-y-1 pl-2 border-l-2 border-stone-100">
                            {order.statusHistory.map((h, i) => (
                              <div key={i} className="flex gap-3">
                                <span className="text-stone-300">{new Date(h.updatedAt).toLocaleDateString()}</span>
                                <span className="capitalize font-medium text-stone-500">{ORDER_STATUS_LABELS[h.status]?.label || h.status}</span>
                                {h.note && <span>— {h.note}</span>}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* ── ACCOUNT ─────────────────────────────────────────────────── */}
          {tab === 'account' && (
            <motion.div key="account" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} className="max-w-lg space-y-5">

              {/* Completion prompt */}
              {score < 100 && (
                <motion.div variants={fadeUp}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm flex-shrink-0">✨</div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Complete your profile</p>
                    <p className="text-xs text-amber-600 mt-0.5">Missing: {missing.join(', ')}</p>
                  </div>
                </motion.div>
              )}

              {/* Avatar section */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-stone-100 p-6">
                <h3 className="text-sm font-bold text-stone-800 mb-4">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-100 flex-shrink-0">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center text-white text-xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <button onClick={() => avatarRef.current?.click()}
                      disabled={avatarUploading}
                      className="text-sm font-semibold text-stone-700 border border-stone-200 px-4 py-2 rounded-xl hover:border-stone-400 transition disabled:opacity-50">
                      {avatarUploading ? 'Uploading…' : avatarSrc ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <p className="text-xs text-stone-400 mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
                  </div>
                </div>
              </motion.div>

              {/* Personal info */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-stone-800">Personal Information</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Update your name, phone, gender and birthday</p>
                </div>

                <div>
                  <label className={lbl}>Full Name</label>
                  <input className={inp} value={accForm.name}
                    onChange={e => setAccForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                </div>

                <div>
                  <label className={lbl}>Phone Number</label>
                  <input className={inp} type="tel" value={accForm.phone}
                    onChange={e => setAccForm(p => ({ ...p, phone: e.target.value }))} placeholder="98XXXXXXXX" />
                </div>

                <div>
                  <label className={lbl}>Date of Birth</label>
                  <input className={inp} type="date" value={accForm.dateOfBirth}
                    onChange={e => setAccForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>

                <div>
                  <label className={lbl}>Gender</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GENDER_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setAccForm(p => ({ ...p, gender: p.gender === opt.value ? '' : opt.value }))}
                        className={`py-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1
                          ${accForm.gender === opt.value
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}>
                        <span className="text-base leading-none">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-50 pt-4">
                  <label className={lbl}>Email Address</label>
                  <input className={inp + ' bg-stone-50 text-stone-400 cursor-not-allowed'} value={user?.email} disabled />
                  <p className="text-xs text-stone-400 mt-1">Email address cannot be changed</p>
                </div>

                <button onClick={handleSaveAccount} disabled={accSaving}
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-700 transition disabled:opacity-50 active:scale-[.98]">
                  {accSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── ADDRESSES ───────────────────────────────────────────────── */}
          {tab === 'addresses' && (
            <motion.div key="addresses" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4 max-w-lg">

              {(account?.addresses || []).length === 0 && !showAddrForm && (
                <motion.div variants={fadeUp} className="text-center py-20">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-base font-bold text-stone-800 mb-1">No saved addresses</p>
                  <p className="text-sm text-stone-400 mb-6">Save an address for faster checkout</p>
                </motion.div>
              )}

              {(account?.addresses || []).map(addr => (
                <motion.div key={addr._id} variants={fadeUp}
                  className="bg-white rounded-2xl border border-stone-100 p-4 flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-sm flex-shrink-0">
                      {addr.label?.toLowerCase() === 'work' ? '🏢' : '🏠'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-700">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-stone-800">{addr.fullName}</p>
                      <p className="text-xs text-stone-400">{addr.phone}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{addr.address}, {addr.city}, {addr.district}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr._id)}
                    className="text-xs text-rose-300 hover:text-rose-500 transition whitespace-nowrap">Remove</button>
                </motion.div>
              ))}

              <AnimatePresence>
                {showAddrForm ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
                    <h3 className="font-bold text-sm text-stone-800">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { k: 'label',    label: 'Label',    placeholder: 'Home / Work', col: 1 },
                        { k: 'fullName', label: 'Full Name', placeholder: 'Recipient name', col: 1 },
                        { k: 'phone',    label: 'Phone',    placeholder: '98XXXXXXXX', col: 1 },
                        { k: 'city',     label: 'City',     placeholder: 'Kathmandu', col: 1 },
                        { k: 'address',  label: 'Address',  placeholder: 'Street, Locality', col: 2 },
                        { k: 'district', label: 'District', placeholder: 'Bagmati', col: 2 },
                      ].map(f => (
                        <div key={f.k} className={f.col === 2 ? 'col-span-2' : ''}>
                          <label className={lbl}>{f.label}</label>
                          <input className={inp} placeholder={f.placeholder}
                            value={addrForm[f.k]}
                            onChange={e => setAddrForm(p => ({ ...p, [f.k]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={addrForm.isDefault}
                        onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                        className="rounded accent-stone-800" />
                      <span className="text-sm text-stone-600">Set as default address</span>
                    </label>
                    <div className="flex gap-3">
                      <button onClick={handleSaveAddress} disabled={addrSaving}
                        className="flex-1 bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition disabled:opacity-50">
                        {addrSaving ? 'Saving…' : 'Save Address'}
                      </button>
                      <button onClick={() => setShowAddrForm(false)}
                        className="flex-1 border border-stone-200 py-3 rounded-xl text-sm text-stone-500 hover:border-stone-400 transition">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button variants={fadeUp} onClick={() => setShowAddrForm(true)}
                    className="w-full border-2 border-dashed border-stone-200 rounded-2xl py-4 text-sm text-stone-400 hover:border-stone-400 hover:text-stone-600 transition">
                    + Add New Address
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── SIZES ───────────────────────────────────────────────────── */}
          {tab === 'sizes' && (
            <motion.div key="sizes" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-stone-100 p-6 max-w-md space-y-5">
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-bold text-stone-800">Your Size Profile</h3>
                <p className="text-xs text-stone-400 mt-0.5">Saved sizes auto-fill when you shop</p>
              </motion.div>
              {[
                { k: 'finger', label: 'Finger (mm)',  placeholder: 'e.g. 52', hint: 'For rings' },
                { k: 'neck',   label: 'Neck (cm)',    placeholder: 'e.g. 35', hint: 'For necklaces, tilhari, pote' },
                { k: 'wrist',  label: 'Wrist (cm)',   placeholder: 'e.g. 16', hint: 'For bracelets, churra' },
                { k: 'ankle',  label: 'Ankle (cm)',   placeholder: 'e.g. 22', hint: 'For anklets' },
              ].map(f => (
                <motion.div key={f.k} variants={fadeUp}>
                  <label className={lbl}>{f.label}</label>
                  <input className={inp} type="number" placeholder={f.placeholder}
                    value={sizeProfile[f.k]}
                    onChange={e => setSizeProfile(p => ({ ...p, [f.k]: e.target.value }))} />
                  <p className="text-xs text-stone-400 mt-1">{f.hint}</p>
                </motion.div>
              ))}
              <motion.div variants={fadeUp}>
                <label className={lbl}>Notes</label>
                <input className={inp} placeholder="e.g. I prefer slightly loose fit"
                  value={sizeProfile.notes}
                  onChange={e => setSizeProfile(p => ({ ...p, notes: e.target.value }))} />
              </motion.div>
              <motion.button variants={fadeUp} onClick={handleSaveSize} disabled={saving}
                className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-700 transition disabled:opacity-50 active:scale-[.98]">
                {saving ? 'Saving…' : 'Save Size Profile'}
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
