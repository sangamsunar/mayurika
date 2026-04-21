import { useState, useEffect, useRef, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import AdminAnalytics from './AdminAnalytics'
import { ModelViewerDetail } from '../components/ModelViewer'

const BASE_URL = 'http://localhost:8000'

const EMPTY_FORM = {
  name: '', description: '', category: '', gender: '', ageGroup: 'adult',
  styleType: '', subStyle: '', occasion: '', metalOptions: [],
  purityGold: [], puritySilver: [], minWeightTola: '', maxWeightTola: '',
  makingChargePerTola: '', jartiAmount: '0', stoneCharge: '0',
  measurementType: 'none', isTraditional: false, hallmark: false,
  customizable: true, pickupAvailable: true, region: 'Nepali', inStock: true
}

const ORDER_STATUSES = ['working', 'finishing', 'packaging', 'transit', 'ready_for_pickup', 'delivered', 'cancelled']
const STATUS_LABELS = {
  working: 'Being Made', finishing: 'Finishing', packaging: 'Packaging',
  transit: 'In Transit', ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered', cancelled: 'Cancelled'
}
const STATUS_COLORS = {
  working: 'bg-blue-500/15   text-blue-400   border border-blue-500/25',
  finishing: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  packaging: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  transit: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  ready_for_pickup: 'bg-teal-500/15   text-teal-400   border border-teal-500/25',
  delivered: 'bg-[#C9A96E]/12  text-[#C9A96E]  border border-[#C9A96E]/25',
  cancelled: 'bg-red-500/15    text-red-400    border border-red-500/25'
}

const inp = [
  'w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all',
  'bg-white/[0.04] border border-white/[0.08] text-[#F0EBE1]',
  'placeholder:text-[rgba(240,235,225,0.25)]',
  'focus:border-[rgba(201,169,110,0.45)] focus:bg-white/[0.06]',
].join(' ')

const lbl = 'block text-[10px] font-semibold text-[rgba(240,235,225,0.4)] mb-1.5 uppercase tracking-[0.15em]'

export default function AdminDashboard() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  const [tab, setTab] = useState('analytics')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // ── Image state ───────────────────────────────────────────
  // newImages: File objects the admin just selected
  const [newImages, setNewImages] = useState([])
  // existingImages: paths already saved on the server (e.g. /uploads/images/xxx.jpg)
  const [existingImages, setExistingImages] = useState([])

  const [model, setModel] = useState(null)
  const [modelPreviewUrl, setModelPreviewUrl] = useState(null)
  const prevBlobUrl = useRef(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manualRate, setManualRate] = useState({ fineGoldPerTola: '', silverPerTola: '', tejabiGoldPerTola: '' })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/')
  }, [user])

  useEffect(() => {
    fetchProducts(); fetchGoldRate(); fetchOrders(); fetchCustomers()
  }, [])

  const fetchProducts = async () => { const { data } = await axios.get('/products'); setProducts(data) }
  const fetchGoldRate = async () => { const { data } = await axios.get('/gold-rate'); setGoldRate(data) }
  const fetchOrders = async () => { const { data } = await axios.get('/admin/orders'); if (!data.error) setOrders(data) }
  const fetchCustomers = async () => { const { data } = await axios.get('/admin/customers'); if (!data.error) setCustomers(data) }

  const handleScrape = async () => {
    setLoading(true)
    const { data } = await axios.post('/gold-rate/scrape')
    if (data.error) toast.error(data.error)
    else { toast.success('Rate scraped!'); fetchGoldRate() }
    setLoading(false)
  }

  const handleManualRate = async () => {
    const { data } = await axios.post('/gold-rate/manual', manualRate)
    if (data.error) toast.error(data.error)
    else { toast.success('Rate updated!'); fetchGoldRate() }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const fd = new FormData()

    Object.entries(form).forEach(([key, val]) => {
      if (['metalOptions', 'purityGold', 'puritySilver', 'styleType', 'subStyle'].includes(key)) return
      fd.append(key, val)
    })
    fd.append('style', JSON.stringify({ type: form.styleType, subStyle: form.subStyle || null }))
    fd.append('metalOptions', JSON.stringify(form.metalOptions))
    fd.append('purityOptions', JSON.stringify({ gold: form.purityGold, silver: form.puritySilver }))

    // Send the list of existing images the admin wants to keep
    fd.append('existingImages', JSON.stringify(existingImages))

    // Append any newly selected image files
    newImages.forEach(img => fd.append('images', img))

    if (model) fd.append('model', model)

    try {
      if (editingId) {
        const { data } = await axios.put(`/products/${editingId}`, fd)
        if (data.error) {
          toast.error(data.error)
        } else {
          toast.success('Product updated!')
          resetForm()
          await fetchProducts()
          setTab('products') // ← bring admin back to the products list
        }
      } else {
        const { data } = await axios.post('/products', fd)
        if (data.error) {
          toast.error(data.error)
        } else {
          toast.success('Product created!')
          resetForm()
          await fetchProducts()
          setTab('products') // ← bring admin back to the products list
        }
      }
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name, description: product.description,
      category: product.category, gender: product.gender, ageGroup: product.ageGroup,
      styleType: product.style?.type || '', subStyle: product.style?.subStyle || '',
      occasion: product.occasion || '', metalOptions: product.metalOptions || [],
      purityGold: product.purityOptions?.gold || [], puritySilver: product.purityOptions?.silver || [],
      minWeightTola: product.minWeightTola, maxWeightTola: product.maxWeightTola,
      makingChargePerTola: product.makingChargePerTola, jartiAmount: product.jartiAmount,
      stoneCharge: product.stoneCharge, measurementType: product.measurementType,
      isTraditional: product.isTraditional, hallmark: product.hallmark,
      customizable: product.customizable, pickupAvailable: product.pickupAvailable,
      region: product.region, inStock: product.inStock
    })
    // Load existing images from the product so admin can see and optionally remove them
    setExistingImages(product.images || [])
    setNewImages([])

    if (prevBlobUrl.current) { URL.revokeObjectURL(prevBlobUrl.current); prevBlobUrl.current = null }
    setModelPreviewUrl(product.model3D ? `${BASE_URL}${product.model3D}` : null)
    setTab('add')
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    const { data } = await axios.delete(`/products/${id}`)
    if (data.error) toast.error(data.error)
    else { toast.success('Deleted!'); fetchProducts() }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { data } = await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus, note: statusNote })
    if (data.error) toast.error(data.error)
    else { toast.success('Status updated!'); fetchOrders(); setSelectedOrder(null); setStatusNote('') }
  }

  const handleModelChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current)
    const blobUrl = URL.createObjectURL(file)
    prevBlobUrl.current = blobUrl; setModel(file); setModelPreviewUrl(blobUrl)
  }

  // Remove an existing (already-saved) image from the keep list
  const removeExistingImage = (path) => {
    setExistingImages(prev => prev.filter(p => p !== path))
  }

  // Remove a newly selected (not yet uploaded) image
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    if (prevBlobUrl.current) { URL.revokeObjectURL(prevBlobUrl.current); prevBlobUrl.current = null }
    setForm(EMPTY_FORM); setNewImages([]); setExistingImages([]); setModel(null); setModelPreviewUrl(null); setEditingId(null)
  }

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const TABS = ['analytics', 'products', 'add', 'orders', 'customers', 'gold rate']

  return (
    <div className="min-h-screen" style={{ background: '#04040A', color: '#F0EBE1' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 px-8 py-4 flex justify-between items-center"
        style={{ background: 'rgba(8,8,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-0.5 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #C9A96E, #0D9488)' }} />
          <h1 className="font-display text-xl font-bold tracking-widest uppercase" style={{ color: '#F0EBE1' }}>
            Mayurika Admin
          </h1>
        </div>
        <span className="text-sm" style={{ color: 'rgba(240,235,225,0.4)' }}>
          Welcome,{' '}
          <span style={{ color: 'rgba(240,235,225,0.7)' }}>{user?.name}</span>
        </span>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────── */}
      <div className="px-8 flex gap-1 overflow-x-auto no-scrollbar"
        style={{ background: 'rgba(8,8,15,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="relative py-3.5 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-200 rounded-t-lg"
            style={{
              color: tab === t ? '#C9A96E' : 'rgba(240,235,225,0.35)',
              background: tab === t ? 'rgba(201,169,110,0.06)' : 'transparent',
              borderBottom: tab === t ? '2px solid #C9A96E' : '2px solid transparent',
            }}>
            {t === 'add' ? (editingId ? 'Edit Product' : 'Add Product') : t}
            {t === 'orders' && orders.filter(o => o.status === 'working').length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                {orders.filter(o => o.status === 'working').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Analytics ──────────────────────────────────────────── */}
      {tab === 'analytics' && <AdminAnalytics />}

      {/* ── Content Pane ───────────────────────────────────────── */}
      <div className="px-8 py-7 max-w-6xl mx-auto">

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>Catalogue</p>
                <h2 className="font-display text-2xl font-semibold" style={{ color: '#F0EBE1' }}>
                  All Products <span style={{ color: 'rgba(240,235,225,0.3)', fontSize: '1rem' }}>({products.length})</span>
                </h2>
              </div>
              <button onClick={() => { resetForm(); setTab('add') }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all"
                style={{ background: '#C9A96E', color: '#04040A' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
                onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
                + Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24" style={{ color: 'rgba(240,235,225,0.28)' }}>No products yet.</div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#08080F' }}>
                <table className="w-full text-sm">
                  <thead style={{ background: '#0E0E18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <tr>
                      {['Image', 'Name', 'Category', 'Gender', 'Style', 'Stock', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(240,235,225,0.35)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p._id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                        <td className="px-4 py-3">
                          {p.images?.[0]
                            ? <img
                              src={`${BASE_URL}${p.images[0]}`}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg"
                              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                            />
                            : null}
                          <div className="w-10 h-10 rounded-lg items-center justify-center text-xs"
                            style={{ background: '#141420', color: 'rgba(240,235,225,0.3)', display: p.images?.[0] ? 'none' : 'flex' }}>
                            N/A
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#F0EBE1' }}>{p.name}</td>
                        <td className="px-4 py-3 capitalize" style={{ color: 'rgba(240,235,225,0.55)' }}>{p.category}</td>
                        <td className="px-4 py-3 capitalize" style={{ color: 'rgba(240,235,225,0.55)' }}>{p.gender}</td>
                        <td className="px-4 py-3 capitalize" style={{ color: 'rgba(240,235,225,0.55)' }}>{p.style?.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.inStock ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                            {p.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleEdit(p)}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,225,0.6)' }}
                            onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(201,169,110,0.4)'; e.currentTarget.style.color = '#C9A96E' }}
                            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(240,235,225,0.6)' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{ border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(248,113,113,0.7)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#F87171' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.7)' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD / EDIT PRODUCT TAB */}
        {tab === 'add' && (
          <form onSubmit={handleSubmit}
            className="rounded-2xl p-7 space-y-7"
            style={{ background: '#08080F', border: '1px solid rgba(255,255,255,0.06)' }}>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>
                  {editingId ? 'Modify' : 'Create'}
                </p>
                <h2 className="font-display text-2xl font-semibold" style={{ color: '#F0EBE1' }}>
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              {editingId && (
                <button type="button" onClick={() => { resetForm(); setTab('products') }}
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(240,235,225,0.35)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(240,235,225,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,225,0.35)'}>
                  ← Cancel Edit
                </button>
              )}
            </div>

            <div className="divider-gold" />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Product Name</label>
                <input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Traditional Tilhari Necklace" required />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={inp} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Category</label>
                <select className={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select</option>
                  {['ring', 'necklace', 'bracelet', 'earring', 'anklet', 'chain', 'cufflink', 'tayo', 'tilhari', 'churra', 'pote', 'kantha', 'set'].map(c =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Gender</label>
                <select className={inp} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Age Group</label>
                <select className={inp} value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
                  <option value="adult">Adult</option>
                  <option value="youth">Youth</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Style</label>
                <select className={inp} value={form.styleType} onChange={e => setForm({ ...form, styleType: e.target.value, subStyle: '' })}>
                  <option value="">Select</option>
                  <option value="traditional">Traditional</option>
                  <option value="wedding">Wedding</option>
                  <option value="casual">Casual</option>
                  <option value="youth">Youth</option>
                </select>
              </div>
              {form.styleType === 'youth' && (
                <div>
                  <label className={lbl}>Sub Style</label>
                  <select className={inp} value={form.subStyle} onChange={e => setForm({ ...form, subStyle: e.target.value })}>
                    <option value="">Select</option>
                    {['gothic', 'cybersilian', 'streetwear', 'minimalist', 'cottagecore'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={lbl}>Occasion</label>
                <select className={inp} value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>
                  <option value="">Select</option>
                  {['wedding', 'casual', 'festival', 'daily', 'gifting'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Metal Options */}
            <div>
              <label className={lbl}>Metal Options</label>
              <div className="flex gap-5">
                {['gold', 'silver'].map(m => (
                  <label key={m} className="flex items-center gap-2.5 text-sm cursor-pointer"
                    style={{ color: 'rgba(240,235,225,0.7)' }}>
                    <input type="checkbox"
                      checked={form.metalOptions.includes(m)}
                      onChange={() => setForm({ ...form, metalOptions: toggle(form.metalOptions, m) })}
                      className="accent-gold" />
                    <span className="capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {form.metalOptions.includes('gold') && (
                <div>
                  <label className={lbl}>Gold Purity</label>
                  <div className="flex gap-4 flex-wrap">
                    {['24K', '23K', '22K', '18K'].map(p => (
                      <label key={p} className="flex items-center gap-1.5 text-sm cursor-pointer"
                        style={{ color: 'rgba(240,235,225,0.7)' }}>
                        <input type="checkbox" checked={form.purityGold.includes(p)}
                          onChange={() => setForm({ ...form, purityGold: toggle(form.purityGold, p) })}
                          className="accent-gold" />{p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {form.metalOptions.includes('silver') && (
                <div>
                  <label className={lbl}>Silver Purity</label>
                  <div className="flex gap-4 flex-wrap">
                    {['999', '925'].map(p => (
                      <label key={p} className="flex items-center gap-1.5 text-sm cursor-pointer"
                        style={{ color: 'rgba(240,235,225,0.7)' }}>
                        <input type="checkbox" checked={form.puritySilver.includes(p)}
                          onChange={() => setForm({ ...form, puritySilver: toggle(form.puritySilver, p) })}
                          className="accent-gold" />{p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Min Weight (Tola)</label><input className={inp} type="number" step="0.1" value={form.minWeightTola} onChange={e => setForm({ ...form, minWeightTola: e.target.value })} required /></div>
              <div><label className={lbl}>Max Weight (Tola)</label><input className={inp} type="number" step="0.1" value={form.maxWeightTola} onChange={e => setForm({ ...form, maxWeightTola: e.target.value })} required /></div>
              <div><label className={lbl}>Making Charge (Rs/Tola)</label><input className={inp} type="number" value={form.makingChargePerTola} onChange={e => setForm({ ...form, makingChargePerTola: e.target.value })} required /></div>
              <div><label className={lbl}>Jarti Amount (Rs)</label><input className={inp} type="number" value={form.jartiAmount} onChange={e => setForm({ ...form, jartiAmount: e.target.value })} /></div>
              <div><label className={lbl}>Stone Charge (Rs)</label><input className={inp} type="number" value={form.stoneCharge} onChange={e => setForm({ ...form, stoneCharge: e.target.value })} /></div>
              <div>
                <label className={lbl}>Measurement Type</label>
                <select className={inp} value={form.measurementType} onChange={e => setForm({ ...form, measurementType: e.target.value })}>
                  <option value="none">None</option>
                  <option value="circumference">Circumference</option>
                  <option value="length">Length</option>
                  <option value="diameter">Diameter</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              {[['isTraditional', 'Traditional'], ['hallmark', 'Hallmark'], ['customizable', 'Customizable'], ['pickupAvailable', 'Pickup Available'], ['inStock', 'In Stock']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 text-sm cursor-pointer"
                  style={{ color: 'rgba(240,235,225,0.7)' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })}
                    className="accent-gold" />
                  {label}
                </label>
              ))}
            </div>

            {/* ── IMAGES SECTION ────────────────────────────────────── */}
            <div>
              <label className={lbl}>Product Images</label>

              {/* Existing images (only shown when editing) */}
              {existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(240,235,225,0.3)' }}>
                    Current images — click × to remove
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((imgPath) => (
                      <div key={imgPath} className="relative group">
                        <img
                          src={`${BASE_URL}${imgPath}`}
                          alt="existing"
                          className="w-20 h-20 object-cover rounded-xl"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imgPath)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                          style={{ background: '#EF4444', color: '#fff', border: '2px solid #04040A' }}
                          title="Remove this image">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New image picker */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => setNewImages(Array.from(e.target.files))}
                className="text-sm"
                style={{ color: 'rgba(240,235,225,0.55)' }}
              />

              {/* Preview newly selected images */}
              {newImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(240,235,225,0.3)' }}>
                    New images to upload — click × to remove
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {newImages.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-20 h-20 object-cover rounded-xl"
                          style={{ border: '1px solid rgba(201,169,110,0.3)' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: '#EF4444', color: '#fff', border: '2px solid #04040A' }}>
                          ×
                        </button>
                        <p className="text-[9px] mt-1 truncate max-w-[80px]" style={{ color: 'rgba(240,235,225,0.3)' }}>{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingImages.length === 0 && newImages.length === 0 && (
                <p className="text-xs mt-1.5" style={{ color: 'rgba(240,235,225,0.25)' }}>
                  No images yet. Select up to 5.
                </p>
              )}
            </div>

            {/* 3D Model */}
            <div>
              <label className={lbl}>3D Model (.glb / .gltf)</label>
              <input type="file" accept=".glb,.gltf" onChange={handleModelChange}
                className="text-sm" style={{ color: 'rgba(240,235,225,0.55)' }} />
              {model && <p className="text-xs mt-1" style={{ color: 'rgba(240,235,225,0.3)' }}>{model.name}</p>}

              {modelPreviewUrl && (
                <div className="mt-4">
                  <p className={lbl}>3D Preview</p>
                  <div className="w-full h-72 rounded-xl overflow-hidden" style={{ background: '#04040A', border: '1px solid rgba(201,169,110,0.15)' }}>
                    <ModelViewerDetail modelUrl={modelPreviewUrl} metal={form.metalOptions[0] || 'gold'} purity={form.purityGold[0] || '22K'} />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'rgba(240,235,225,0.25)' }}>Drag to rotate · Scroll to zoom</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {editingId && (
                <button type="button"
                  onClick={() => { resetForm(); setTab('products') }}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-widest transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,225,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-widest transition-all disabled:opacity-40"
                style={{ background: '#C9A96E', color: '#04040A' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#E8D4A0' }}
                onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
                {loading ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div>
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>Management</p>
              <h2 className="font-display text-2xl font-semibold" style={{ color: '#F0EBE1' }}>
                All Orders <span style={{ color: 'rgba(240,235,225,0.3)', fontSize: '1rem' }}>({orders.length})</span>
              </h2>
            </div>

            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
                <div className="rounded-2xl max-w-lg w-full p-7 max-h-[90vh] overflow-y-auto"
                  style={{ background: '#0E0E18', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>Order Details</p>
                      <h3 className="font-display text-xl font-bold" style={{ color: '#F0EBE1' }}>
                        #{selectedOrder._id.slice(-8).toUpperCase()}
                      </h3>
                    </div>
                    <button onClick={() => { setSelectedOrder(null); setStatusNote('') }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-xl transition-colors"
                      style={{ color: 'rgba(240,235,225,0.4)', background: 'rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#F0EBE1'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,225,0.4)'}>
                      ×
                    </button>
                  </div>

                  <div className="space-y-3 mb-5">
                    {[
                      ['Customer', selectedOrder.user?.name],
                      ['Email', selectedOrder.user?.email],
                      ['Delivery', selectedOrder.deliveryType],
                      ['Total', `Rs ${selectedOrder.grandTotal?.toLocaleString()}`],
                      ['Advance Paid', `Rs ${selectedOrder.advancePaid?.toLocaleString()}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'rgba(240,235,225,0.38)' }}>{k}</span>
                        <span className="font-medium capitalize" style={{ color: '#F0EBE1' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.deliveryAddress && (
                    <div className="rounded-xl p-4 text-sm mb-5"
                      style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="font-semibold mb-1.5" style={{ color: '#C9A96E' }}>Delivery Address</p>
                      <p style={{ color: 'rgba(240,235,225,0.6)' }}>{selectedOrder.deliveryAddress.fullName} · {selectedOrder.deliveryAddress.phone}</p>
                      <p style={{ color: 'rgba(240,235,225,0.6)' }}>{selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}</p>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className="font-semibold text-sm mb-3" style={{ color: 'rgba(240,235,225,0.55)' }}>Items</p>
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,235,225,0.6)' }}>
                        <span>{item.product?.name || 'Product'} · {item.selectedMetal} {item.selectedPurity} {item.selectedWeight}t</span>
                        <span style={{ color: '#C9A96E' }}>Rs {item.itemTotal?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold text-sm" style={{ color: 'rgba(240,235,225,0.55)' }}>Update Status</p>
                    <select className={inp} defaultValue={selectedOrder.status} id="statusSelect">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
                      placeholder="Optional note (e.g. Dispatched via Blue Dart)"
                      className={inp} />
                    <button
                      onClick={() => { const sel = document.getElementById('statusSelect'); handleUpdateStatus(selectedOrder._id, sel.value) }}
                      className="w-full py-3 rounded-xl font-semibold text-sm tracking-widest transition-all"
                      style={{ background: '#C9A96E', color: '#04040A' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-24" style={{ color: 'rgba(240,235,225,0.28)' }}>No orders yet.</div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#08080F' }}>
                <table className="w-full text-sm">
                  <thead style={{ background: '#0E0E18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Total', 'Delivery', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(240,235,225,0.35)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order._id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#C9A96E' }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-xs" style={{ color: '#F0EBE1' }}>{order.user?.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(240,235,225,0.35)' }}>{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(240,235,225,0.55)' }}>
                          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 font-semibold text-xs" style={{ color: '#C9A96E' }}>
                          Rs {order.grandTotal?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 capitalize text-xs" style={{ color: 'rgba(240,235,225,0.55)' }}>{order.deliveryType}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-white/10 text-white/60'}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(240,235,225,0.35)' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedOrder(order)}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,225,0.6)' }}
                            onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(201,169,110,0.4)'; e.currentTarget.style.color = '#C9A96E' }}
                            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(240,235,225,0.6)' }}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {tab === 'customers' && (
          <div>
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>Directory</p>
              <h2 className="font-display text-2xl font-semibold" style={{ color: '#F0EBE1' }}>
                All Customers <span style={{ color: 'rgba(240,235,225,0.3)', fontSize: '1rem' }}>({customers.length})</span>
              </h2>
            </div>
            {customers.length === 0 ? (
              <div className="text-center py-24" style={{ color: 'rgba(240,235,225,0.28)' }}>No customers yet.</div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#08080F' }}>
                <table className="w-full text-sm">
                  <thead style={{ background: '#0E0E18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <tr>
                      {['Name', 'Email', 'Phone', 'Gender', 'Orders', 'Total Spent', 'Joined', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(240,235,225,0.35)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c._id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', color: '#C9A96E' }}>
                              {c.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-xs" style={{ color: '#F0EBE1' }}>{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(240,235,225,0.45)' }}>{c.email}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(240,235,225,0.45)' }}>{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-xs capitalize" style={{ color: 'rgba(240,235,225,0.45)' }}>
                          {c.gender ? c.gender.replace('_', ' ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#F0EBE1' }}>{c.orderCount}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#C9A96E' }}>
                          {c.totalSpent > 0 ? `Rs ${c.totalSpent.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(240,235,225,0.35)' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${c.isVerified ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'}`}>
                            {c.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* GOLD RATE TAB */}
        {tab === 'gold rate' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-7" style={{ background: '#08080F', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="mb-5">
                <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>Live Prices</p>
                <h2 className="font-display text-2xl font-semibold" style={{ color: '#F0EBE1' }}>Current Gold & Silver Rate</h2>
              </div>
              {goldRate ? (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['Fine Gold (9999)', goldRate.fineGoldPerTola, '#C9A96E', 'rgba(201,169,110,0.1)', 'rgba(201,169,110,0.2)'],
                    ['Tejabi Gold', goldRate.tejabiGoldPerTola, '#E8D4A0', 'rgba(232,212,160,0.08)', 'rgba(232,212,160,0.18)'],
                    ['Silver', goldRate.silverPerTola, '#94A3B8', 'rgba(148,163,184,0.08)', 'rgba(148,163,184,0.18)'],
                  ].map(([label, val, color, bg, border]) => (
                    <div key={label} className="rounded-xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
                      <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(240,235,225,0.38)' }}>{label}</p>
                      <p className="text-2xl font-bold" style={{ color }}>Rs {val?.toLocaleString()}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(240,235,225,0.28)' }}>per tola</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'rgba(240,235,225,0.35)' }}>No rate found</p>}

              <div className="mt-5 flex gap-3 items-center">
                <button onClick={handleScrape} disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-40"
                  style={{ background: '#C9A96E', color: '#04040A' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#E8D4A0' }}
                  onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
                  {loading ? 'Scraping…' : 'Scrape from fenegosida.org'}
                </button>
                {goldRate && (
                  <span className="text-xs" style={{ color: 'rgba(240,235,225,0.3)' }}>
                    {goldRate.isManual ? '— Set manually' : `— Last scraped: ${new Date(goldRate.lastScraped).toLocaleString()}`}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-7" style={{ background: '#08080F', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="mb-5">
                <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(240,235,225,0.3)' }}>Override</p>
                <h2 className="font-display text-2xl font-semibold" style={{ color: '#F0EBE1' }}>Set Rate Manually</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['fineGoldPerTola', 'Fine Gold / Tola (Rs)', '291400'],
                  ['tejabiGoldPerTola', 'Tejabi Gold / Tola (Rs)', '0'],
                  ['silverPerTola', 'Silver / Tola (Rs)', '4780'],
                ].map(([key, label, ph]) => (
                  <div key={key}>
                    <label className={lbl}>{label}</label>
                    <input className={inp} type="number" value={manualRate[key]}
                      onChange={e => setManualRate({ ...manualRate, [key]: e.target.value })} placeholder={ph} />
                  </div>
                ))}
              </div>
              <button onClick={handleManualRate}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all"
                style={{ background: '#C9A96E', color: '#04040A' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E8D4A0'}
                onMouseLeave={e => e.currentTarget.style.background = '#C9A96E'}>
                Save Manual Rate
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}