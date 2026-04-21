import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { ModelViewerDetail } from '../components/ModelViewer'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { toast } from 'react-hot-toast'
import { UserContext } from '../../context/userContext'
import ProductCard from '../components/ProductCard'
import { XIcon, StarIcon, HeartIcon, CartIcon, WhatsAppIcon, CheckIcon, DiamondIcon } from '../components/Icons'

const PURITY_MULTIPLIER = { '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75, '999': 1.0, '925': 0.925 }
const GOLD_PURITIES = ['24K', '23K', '22K', '18K']
const SILVER_PURITIES = ['999', '925']
const METAL_DOT = {
  gold:   'bg-gradient-to-br from-[#F5D98C] to-[#C9A96E]',
  silver: 'bg-gradient-to-br from-gray-200 to-gray-400',
}
const METAL_LABELS = { gold: 'Gold', silver: 'Silver' }
const MEASUREMENT_MAP = {
  ring: { key: 'finger', label: 'Finger circumference', unit: 'mm', placeholder: 'e.g. 52' },
  necklace: { key: 'neck', label: 'Neck circumference', unit: 'cm', placeholder: 'e.g. 35' },
  tilhari: { key: 'neck', label: 'Neck circumference', unit: 'cm', placeholder: 'e.g. 35' },
  kantha: { key: 'neck', label: 'Neck circumference', unit: 'cm', placeholder: 'e.g. 35' },
  pote: { key: 'neck', label: 'Neck circumference', unit: 'cm', placeholder: 'e.g. 35' },
  bracelet: { key: 'wrist', label: 'Wrist circumference', unit: 'cm', placeholder: 'e.g. 16' },
  churra: { key: 'wrist', label: 'Wrist circumference', unit: 'cm', placeholder: 'e.g. 16' },
  anklet: { key: 'ankle', label: 'Ankle circumference', unit: 'cm', placeholder: 'e.g. 22' },
  chain: { key: 'neck', label: 'Neck circumference', unit: 'cm', placeholder: 'e.g. 35' },
  set: { key: 'neck', label: 'Neck circumference', unit: 'cm', placeholder: 'e.g. 35' },
  tayo: { key: 'neck', label: 'Head circumference', unit: 'cm', placeholder: 'e.g. 54' },
}

function Stars({ rating, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <StarIcon key={s} size={size} filled={s <= Math.round(rating)}
          className={s <= Math.round(rating) ? 'text-[#C9A96E]' : 'text-white/15'} />
      ))}
    </div>
  )
}

function MeasurementModal({ measureInfo, measurement, setMeasurement, measurementNote, setMeasurementNote, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: 'rgba(7,7,10,0.7)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl max-w-lg w-full overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display text-lg font-semibold text-ink">Size Measurement</h2>
          <button onClick={onClose} className="text-ink-dim hover:text-ink transition">
            <XIcon size={18} />
          </button>
        </div>
        <div className="px-6 pt-4">
          <img src="/measurementGuide.webp" alt="How to measure"
            className="w-full rounded-lg border border-white/[0.06]" onError={e => e.target.style.display = 'none'} />
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]">
              {measureInfo.label} ({measureInfo.unit})
            </label>
            <div className="flex gap-2 items-center">
              <input type="number" value={measurement} onChange={e => setMeasurement(e.target.value)}
                placeholder={measureInfo.placeholder} autoFocus className="inp-dark" />
              <span className="text-xs text-ink-dim font-medium tracking-wider">{measureInfo.unit}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-ink-dim mb-2 uppercase tracking-[0.2em]">Notes (optional)</label>
            <input value={measurementNote} onChange={e => setMeasurementNote(e.target.value)}
              placeholder="e.g. slightly loose preferred" className="inp-dark" />
          </div>
          <p className="text-[11px] text-ink-dim">Not sure? You can adjust before final order.</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 glass-sm py-3 rounded-xl text-sm text-ink-muted hover:border-white/20 hover:text-ink transition">Cancel</button>
          <button onClick={onSave} className="flex-1 btn-gold">Save</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const { guardAction } = useRequireAuth()

  const [product, setProduct] = useState(null)
  const [goldRate, setGoldRate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetal, setSelectedMetal] = useState('gold')
  const [selectedPurity, setSelectedPurity] = useState('24K')
  const [selectedWeight, setSelectedWeight] = useState(0)
  const [inputWeight, setInputWeight] = useState('')
  const [activeView, setActiveView] = useState('3d')
  const [showMeasureModal, setShowMeasureModal] = useState(false)
  const [measurement, setMeasurement] = useState('')
  const [measurementNote, setMeasurementNote] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState([])

  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => { fetchData() }, [id])

  useEffect(() => {
    if (!product) return
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    const updated = [id, ...stored.filter(i => i !== id)].slice(0, 6)
    localStorage.setItem('recentlyViewed', JSON.stringify(updated))
    const otherIds = updated.filter(i => i !== id)
    if (otherIds.length > 0) {
      Promise.all(otherIds.slice(0, 4).map(pid => axios.get(`/products/${pid}`).catch(() => null)))
        .then(results => setRecentlyViewed(results.filter(Boolean).map(r => r.data)))
    }
  }, [product])

  const fetchData = async () => {
    try {
      const [productRes, rateRes, reviewsRes] = await Promise.all([
        axios.get(`/products/${id}`),
        axios.get('/gold-rate'),
        axios.get(`/products/${id}/reviews`)
      ])
      const p = productRes.data
      setProduct(p)
      setGoldRate(rateRes.data)
      setReviews(reviewsRes.data)

      const defaultMetal = p.metalOptions?.[0] || 'gold'
      setSelectedMetal(defaultMetal)
      const defaultPurity = defaultMetal === 'silver' ? (p.purityOptions?.silver?.[0] || '999') : (p.purityOptions?.gold?.[0] || '24K')
      setSelectedPurity(defaultPurity)
      const avg = parseFloat(((p.minWeightTola + p.maxWeightTola) / 2).toFixed(1))
      setSelectedWeight(avg)
      setInputWeight(avg.toString())

      try {
        const { data: profile } = await axios.get('/size-profile')
        const measureKey = MEASUREMENT_MAP[p.category]?.key
        if (measureKey && profile.sizeProfile?.[measureKey]) setMeasurement(profile.sizeProfile[measureKey].toString())
      } catch (_) { }
    } catch (error) { console.log(error) }
    setLoading(false)
  }

  const handleMetalChange = (metal) => {
    setSelectedMetal(metal)
    const newPurity = metal === 'silver' ? (product.purityOptions?.silver?.[0] || '999') : (product.purityOptions?.gold?.[0] || '24K')
    setSelectedPurity(newPurity)
  }

  const handleWeightInput = (val) => {
    setInputWeight(val)
    const num = parseFloat(val)
    if (!isNaN(num)) setSelectedWeight(Math.min(Math.max(num, product.minWeightTola), product.maxWeightTola))
  }

  const calculatePrice = () => {
    if (!product || !goldRate) return { goldCost: 0, subtotal: 0, tax: 0, total: 0 }
    const rate = selectedMetal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
    const multiplier = PURITY_MULTIPLIER[selectedPurity] || 1
    const goldCost = selectedWeight * rate * multiplier
    const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
    const tax = subtotal * 0.02
    return { goldCost: Math.round(goldCost), subtotal: Math.round(subtotal), tax: Math.round(tax), total: Math.round(subtotal + tax) }
  }

  const price = calculatePrice()
  const availablePurities = selectedMetal === 'silver'
    ? SILVER_PURITIES.filter(p => product?.purityOptions?.silver?.includes(p))
    : GOLD_PURITIES.filter(p => product?.purityOptions?.gold?.includes(p))
  const measureInfo = product ? MEASUREMENT_MAP[product.category] : null

  const handleAddToCart = () => {
    guardAction(async () => {
      const { data } = await axios.post('/cart', { productId: product._id, selectedMetal, selectedPurity, selectedWeight })
      if (data.error) toast.error(data.error)
      else toast.success('Added to cart!')
    })
  }

  const handleAddToWishlist = () => {
    guardAction(async () => {
      const { data } = await axios.post('/wishlist', { productId: product._id })
      if (data.error) toast.error(data.error)
      else toast.success(data.message)
    })
  }

  const handleSubmitReview = async () => {
    if (!user) { toast.error('Please login to review'); return }
    if (!reviewForm.title || !reviewForm.body) { toast.error('Please fill in title and review'); return }
    setSubmittingReview(true)
    const { data } = await axios.post(`/products/${id}/reviews`, reviewForm)
    if (data.error) toast.error(data.error)
    else {
      setReviews(prev => [data, ...prev])
      setShowReviewForm(false)
      setReviewForm({ rating: 5, title: '', body: '' })
      toast.success('Review submitted!')
    }
    setSubmittingReview(false)
  }

  const handleDeleteReview = async (reviewId) => {
    const { data } = await axios.delete(`/products/${id}/reviews/${reviewId}`)
    if (data.error) toast.error(data.error)
    else { setReviews(prev => prev.filter(r => r._id !== reviewId)); toast.success('Review deleted') }
  }

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[#C9A96E] rounded-full animate-spin" />
    </div>
  )
  if (!product) return <div className="min-h-screen bg-void flex items-center justify-center text-ink-dim">Product not found</div>

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const labelCls = "text-[10px] font-semibold text-ink-dim uppercase tracking-[0.2em] mb-2"

  return (
    <>
      {showMeasureModal && measureInfo && (
        <MeasurementModal measureInfo={measureInfo}
          measurement={measurement} setMeasurement={setMeasurement}
          measurementNote={measurementNote} setMeasurementNote={setMeasurementNote}
          onClose={() => setShowMeasureModal(false)}
          onSave={() => { setShowMeasureModal(false); toast.success('Measurement saved!') }} />
      )}

      <div className="bg-void min-h-screen">
        <div className="lg:h-[calc(100vh-72px)] flex flex-col lg:flex-row overflow-hidden">

          {/* LEFT: Viewer */}
          <div className="w-full lg:w-1/2 lg:h-full bg-[#0F0F12] border-b lg:border-b-0 lg:border-r border-white/[0.05] flex flex-col">
            <div className="flex-1 min-h-[50vh] lg:min-h-0 overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, #C9A96E 0%, transparent 60%)' }} />
              {activeView === '3d' && product.model3D ? (
                <ModelViewerDetail modelUrl={product.model3D} metal={selectedMetal} purity={selectedPurity} />
              ) : activeView !== '3d' ? (
                <div className="w-full h-full flex items-center justify-center p-8 relative">
                  <img src={`http://localhost:8000${activeView}`} className="max-w-full max-h-full object-contain rounded-lg" alt={product.name} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DiamondIcon size={48} className="text-white/10" />
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex gap-2 px-4 py-3 border-t border-white/[0.05] overflow-x-auto no-scrollbar">
              {product.model3D && (
                <button onClick={() => setActiveView('3d')}
                  className={`w-14 h-14 rounded-xl border flex-shrink-0 flex items-center justify-center text-[10px] font-bold tracking-widest transition-all
                    ${activeView === '3d' ? 'bg-[#C9A96E] border-[#C9A96E] text-[#07070A]' : 'border-white/10 text-ink-dim hover:border-white/30'}`}>
                  3D
                </button>
              )}
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setActiveView(img)}
                  className={`w-14 h-14 rounded-xl border overflow-hidden flex-shrink-0 transition-all
                    ${activeView === img ? 'border-[#C9A96E]' : 'border-white/10 hover:border-white/30'}`}>
                  <img src={`http://localhost:8000${img}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <p className="flex-shrink-0 text-[10px] text-ink-dim text-center pb-3 tracking-wider">
              {activeView === '3d' ? 'DRAG TO ROTATE · SCROLL TO ZOOM' : 'CLICK 3D TO RETURN'}
            </p>
          </div>

          {/* RIGHT: Info */}
          <div className="w-full lg:w-1/2 lg:h-full overflow-y-auto">
            <div className="p-8 space-y-6 max-w-lg">

              <div className="flex gap-2 flex-wrap">
                {product.isTraditional && <span className="glass-sm text-[10px] font-semibold tracking-widest uppercase text-ink px-3 py-1 rounded-full">Traditional</span>}
                {product.hallmark && <span className="bg-[#C9A96E] text-[#07070A] text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full">Hallmark</span>}
                {product.customizable && <span className="glass-sm text-[10px] font-semibold tracking-widest uppercase text-ink-muted px-3 py-1 rounded-full">Customizable</span>}
              </div>

              <div>
                <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-2">
                  {product.category} · {product.style?.type}{product.style?.subStyle && ` · ${product.style.subStyle}`}
                </p>
                <h1 className="font-display text-3xl font-semibold text-ink leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <Stars rating={avgRating} size={14} />
                  <span className="text-xs text-ink-dim">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-ink-muted text-sm mt-4 leading-relaxed">{product.description}</p>
              </div>

              {product.metalOptions?.length > 0 && (
                <div>
                  <p className={labelCls}>Metal · <span className="text-[#C9A96E] font-normal normal-case tracking-normal">{METAL_LABELS[selectedMetal]}</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {product.metalOptions.map(m => {
                      const sel = selectedMetal === m
                      return (
                        <button key={m} onClick={() => handleMetalChange(m)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all
                            ${sel ? 'bg-[#C9A96E]/15 border-[#C9A96E]/50 text-[#C9A96E]' : 'border-white/[0.08] text-ink-muted hover:border-white/20'}`}>
                          <span className={`w-3 h-3 rounded-full ${METAL_DOT[m]}`} />{METAL_LABELS[m]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {availablePurities.length > 0 && (
                <div>
                  <p className={labelCls}>Purity · <span className="text-[#C9A96E] font-normal normal-case tracking-normal">{selectedPurity}</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {availablePurities.map(p => {
                      const sel = selectedPurity === p
                      return (
                        <button key={p} onClick={() => setSelectedPurity(p)}
                          className={`px-4 py-2 rounded-lg border text-sm transition-all
                            ${sel ? 'bg-[#C9A96E]/15 border-[#C9A96E]/50 text-[#C9A96E]' : 'border-white/[0.08] text-ink-muted hover:border-white/20'}`}>
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-ink-dim mt-2 tracking-wide">Higher karat = more pure = higher price</p>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className={labelCls + ' mb-0'}>Weight</p>
                  <div className="flex items-center gap-2">
                    <input type="number" value={inputWeight} step="0.1"
                      onChange={e => handleWeightInput(e.target.value)}
                      onBlur={() => setInputWeight(selectedWeight.toString())}
                      className="w-20 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-center text-ink focus:outline-none focus:border-[#C9A96E]/40 transition" />
                    <span className="text-[11px] text-ink-dim tracking-wider uppercase">tola</span>
                  </div>
                </div>
                <input type="range" min={product.minWeightTola} max={product.maxWeightTola} step="0.1" value={selectedWeight}
                  onChange={e => { const v = parseFloat(e.target.value); setSelectedWeight(v); setInputWeight(v.toString()) }}
                  className="w-full accent-[#C9A96E]" />
                <div className="flex justify-between text-[10px] text-ink-dim mt-1 tracking-wider">
                  <span>{product.minWeightTola}t MIN</span><span>{product.maxWeightTola}t MAX</span>
                </div>
              </div>

              {measureInfo && (
                <div className="glass-sm rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[#C9A96E] tracking-wider uppercase">Size Measurement</p>
                    <p className="text-xs text-ink-dim mt-1">{measurement ? `${measurement} ${measureInfo.unit} saved` : 'Not set yet'}</p>
                  </div>
                  <button onClick={() => setShowMeasureModal(true)}
                    className="text-[11px] tracking-wider bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#C9A96E] px-3 py-2 rounded-lg hover:bg-[#C9A96E]/25 transition">
                    {measurement ? 'Edit' : '+ Add Size'}
                  </button>
                </div>
              )}

              <div className="glass-sm rounded-xl p-5 space-y-2">
                <p className={labelCls}>Price Breakdown</p>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-dim">{selectedMetal === 'silver' ? 'Silver' : 'Gold'} cost ({selectedWeight}t · {selectedPurity})</span>
                  <span className="text-ink">Rs {price.goldCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-dim">Making charge</span>
                  <span className="text-ink">Rs {product.makingChargePerTola?.toLocaleString()}</span>
                </div>
                {product.jartiAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-dim">Jarti (loss)</span>
                    <span className="text-ink">Rs {product.jartiAmount?.toLocaleString()}</span>
                  </div>
                )}
                {product.stoneCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-dim">Stone charge</span>
                    <span className="text-ink">Rs {product.stoneCharge?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-ink-dim">Tax (2%)</span>
                  <span className="text-ink">Rs {price.tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/[0.06] pt-3 mt-2 flex justify-between items-center">
                  <span className="font-display text-base font-semibold text-ink">Total</span>
                  <span className="font-display text-xl font-semibold text-gradient-gold">Rs {price.total.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-ink-dim tracking-wide">* Delivery charge added at checkout</p>
              </div>

              {goldRate && (
                <p className="text-[10px] text-ink-dim tracking-wide">
                  Today's rate — Gold Rs {goldRate.fineGoldPerTola?.toLocaleString()}/tola · Silver Rs {goldRate.silverPerTola?.toLocaleString()}/tola {goldRate.isManual ? '(manual)' : '(live)'}
                </p>
              )}

              <div className="flex flex-col gap-2.5 pt-2">
                <button onClick={handleAddToCart} className="w-full btn-gold flex items-center justify-center gap-2">
                  <CartIcon size={16} /> Add to Cart
                </button>
                <button onClick={handleAddToWishlist}
                  className="w-full glass-sm border-[#C9A96E]/20 text-[#C9A96E] py-3 rounded-xl font-medium hover:bg-[#C9A96E]/10 transition text-sm flex items-center justify-center gap-2">
                  <HeartIcon size={16} /> Add to Wishlist
                </button>
                {product.pickupAvailable && (
                  <p className="text-[11px] text-center text-ink-dim tracking-wide">Store pickup available — No delivery charge</p>
                )}
              </div>

              <div className="border-t border-white/[0.06] pt-5 pb-8">
                <p className="text-sm text-ink-muted">Want a completely different design?</p>
                <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition">
                  <WhatsAppIcon size={16} /> Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.05]">
          <div className="flex justify-between items-start gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-2">Reviews</p>
              <h2 className="font-display text-3xl font-semibold text-ink">What customers say</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Stars rating={avgRating} size={14} />
                  <span className="text-xs text-ink-muted">{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            {user && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="btn-gold">Write a Review</button>
            )}
            {!user && (
              <button onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                className="glass-sm px-5 py-2.5 rounded-xl text-sm text-ink-muted hover:border-white/20 hover:text-ink transition">
                Login to Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="glass rounded-2xl p-6 mb-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-ink">Your Review</h3>
              <div>
                <p className={labelCls}>Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className="transition-colors">
                      <StarIcon size={24} filled={s <= reviewForm.rating}
                        className={s <= reviewForm.rating ? 'text-[#C9A96E]' : 'text-white/15 hover:text-[#C9A96E]/50'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Summarize your experience" className="inp-dark" />
              </div>
              <div>
                <label className={labelCls}>Review</label>
                <textarea value={reviewForm.body} onChange={e => setReviewForm({ ...reviewForm, body: e.target.value })}
                  placeholder="Tell others about your experience with this product..."
                  rows={4} className="inp-dark resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowReviewForm(false)}
                  className="flex-1 glass-sm py-3 rounded-xl text-sm text-ink-muted hover:border-white/20 hover:text-ink transition">Cancel</button>
                <button onClick={handleSubmitReview} disabled={submittingReview}
                  className="flex-1 btn-gold disabled:opacity-50">
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-16 text-ink-dim">
              <p className="font-display text-lg text-ink-muted mb-1">No reviews yet</p>
              <p className="text-sm">Be the first to review this product</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="glass rounded-2xl p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Stars rating={review.rating} />
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                            <CheckIcon size={10} strokeWidth={3} /> Verified
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-base font-semibold text-ink">{review.title}</h4>
                      <p className="text-[11px] text-ink-dim mt-1">{review.user?.name} · {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    {(user?._id === review.user?._id || user?.role === 'admin') && (
                      <button onClick={() => handleDeleteReview(review._id)} className="text-[11px] text-rose-400 hover:text-rose-300 transition tracking-wider">Delete</button>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted mt-4 leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {recentlyViewed.length > 0 && goldRate && (
          <div className="max-w-7xl mx-auto px-6 pb-16 border-t border-white/[0.05] pt-16">
            <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-2">You recently saw</p>
            <h2 className="font-display text-3xl font-semibold text-ink mb-8">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.map(p => <ProductCard key={p._id} product={p} goldRate={goldRate} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
