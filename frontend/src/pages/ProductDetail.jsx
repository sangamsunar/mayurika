import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { ModelViewerDetail } from '../components/ModelViewer'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { toast } from 'react-hot-toast'

const PURITY_MULTIPLIER = {
    '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
    '999': 1.0, '925': 0.925
}
const GOLD_PURITIES = ['24K', '23K', '22K', '18K']
const SILVER_PURITIES = ['999', '925']

const METAL_COLORS = { gold: 'bg-yellow-400', silver: 'bg-gray-300', roseGold: 'bg-rose-300' }
const METAL_LABELS = { gold: 'Gold', silver: 'Silver', roseGold: 'Rose Gold' }

// Gold dot colors per carat — matches real life
const GOLD_CARAT_COLORS = {
    '24K': 'bg-yellow-400',
    '23K': 'bg-yellow-500',
    '22K': 'bg-amber-500',
    '18K': 'bg-orange-400',
}

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
    earring: null,
    cufflink: null,
}

// Measurement Modal
function MeasurementModal({ measureInfo, measurement, setMeasurement, measurementNote, setMeasurementNote, onClose, onSave }) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="font-bold text-lg">Size Measurement</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
                </div>

                {/* Guide image */}
                <div className="px-6 pt-4">
                    <img
                        src="/measurementGuide.webp"
                        alt="How to measure"
                        className="w-full rounded-lg border border-gray-100"
                        onError={e => e.target.style.display = 'none'}
                    />
                </div>

                {/* Input */}
                <div className="px-6 py-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            {measureInfo.label} ({measureInfo.unit})
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                value={measurement}
                                onChange={e => setMeasurement(e.target.value)}
                                placeholder={measureInfo.placeholder}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                                autoFocus
                            />
                            <span className="text-sm text-gray-500 font-medium">{measureInfo.unit}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label>
                        <input
                            type="text"
                            value={measurementNote}
                            onChange={e => setMeasurementNote(e.target.value)}
                            placeholder="e.g. slightly loose preferred"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                        />
                    </div>

                    <p className="text-xs text-gray-400">
                        💡 Not sure of your size? You can adjust this before placing the final order.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:border-gray-500 transition">
                        Cancel
                    </button>
                    <button onClick={onSave}
                        className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                        Save Measurement
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ProductDetail() {
    const { id } = useParams()
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

    useEffect(() => { fetchData() }, [id])

    const fetchData = async () => {
        try {
            const [productRes, rateRes] = await Promise.all([
                axios.get(`/products/${id}`),
                axios.get('/gold-rate')
            ])
            const p = productRes.data
            setProduct(p)
            setGoldRate(rateRes.data)

            const defaultMetal = p.metalOptions?.[0] || 'gold'
            setSelectedMetal(defaultMetal)
            const defaultPurity = defaultMetal === 'silver'
                ? (p.purityOptions?.silver?.[0] || '999')
                : (p.purityOptions?.gold?.[0] || '24K')
            setSelectedPurity(defaultPurity)

            const avg = parseFloat(((p.minWeightTola + p.maxWeightTola) / 2).toFixed(1))
            setSelectedWeight(avg)
            setInputWeight(avg.toString())

            // Prefill measurement from saved profile
            try {
                const { data: profile } = await axios.get('/size-profile')
                const measureKey = MEASUREMENT_MAP[p.category]?.key
                if (measureKey && profile.sizeProfile?.[measureKey]) {
                    setMeasurement(profile.sizeProfile[measureKey].toString())
                }
            } catch (_) { }

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const handleMetalChange = (metal) => {
        setSelectedMetal(metal)
        const newPurity = metal === 'silver'
            ? (product.purityOptions?.silver?.[0] || '999')
            : (product.purityOptions?.gold?.[0] || '24K')
        setSelectedPurity(newPurity)
    }

    const handleWeightInput = (val) => {
        setInputWeight(val)
        const num = parseFloat(val)
        if (!isNaN(num)) setSelectedWeight(Math.min(Math.max(num, product.minWeightTola), product.maxWeightTola))
    }

    const handleWeightBlur = () => setInputWeight(selectedWeight.toString())

    const calculatePrice = () => {
        if (!product || !goldRate) return { goldCost: 0, subtotal: 0, tax: 0, total: 0 }
        const rate = selectedMetal === 'silver' ? goldRate.silverPerTola : goldRate.fineGoldPerTola
        const multiplier = PURITY_MULTIPLIER[selectedPurity] || 1
        const goldCost = selectedWeight * rate * multiplier
        const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
        const tax = subtotal * 0.02
        return {
            goldCost: Math.round(goldCost),
            subtotal: Math.round(subtotal),
            tax: Math.round(tax),
            total: Math.round(subtotal + tax)
        }
    }

    const price = calculatePrice()

    const availablePurities = selectedMetal === 'silver'
        ? SILVER_PURITIES.filter(p => product?.purityOptions?.silver?.includes(p))
        : GOLD_PURITIES.filter(p => product?.purityOptions?.gold?.includes(p))

    const measureInfo = product ? MEASUREMENT_MAP[product.category] : null

    const handleSaveMeasurement = () => {
        setShowMeasureModal(false)
        toast.success('Measurement saved!')
    }

    const handleAddToCart = () => {
        guardAction(async () => {
            const { data } = await axios.post('/cart', {
                productId: product._id, selectedMetal, selectedPurity, selectedWeight
            })
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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
    if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-400">Product not found</div>

    return (
        <>
            {/* Measurement Modal */}
            {showMeasureModal && measureInfo && (
                <MeasurementModal
                    measureInfo={measureInfo}
                    measurement={measurement}
                    setMeasurement={setMeasurement}
                    measurementNote={measurementNote}
                    setMeasurementNote={setMeasurementNote}
                    onClose={() => setShowMeasureModal(false)}
                    onSave={handleSaveMeasurement}
                />
            )}

            <div className="h-screen bg-gray-50 flex overflow-hidden">

                {/* ── LEFT: Viewer ── */}
                <div className="w-1/2 h-screen bg-white border-r flex flex-col">

                    {/* Main view — fixed height, no overflow */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {activeView === '3d' && product.model3D ? (
                            <ModelViewerDetail modelUrl={product.model3D} metal={selectedMetal} purity={selectedPurity} />
                        ) : activeView !== '3d' ? (
                            <div className="w-full h-full flex items-center justify-center p-6">
                                <img
                                    src={`http://localhost:8000${activeView}`}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                    alt={product.name}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No preview</div>
                        )}
                    </div>

                    {/* Thumbnails — fixed height */}
                    <div className="flex-shrink-0 flex gap-2 px-4 py-3 border-t overflow-x-auto">
                        {product.model3D && (
                            <button onClick={() => setActiveView('3d')}
                                className={`w-14 h-14 rounded-lg border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all
                  ${activeView === '3d' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                                3D
                            </button>
                        )}
                        {product.images?.map((img, i) => (
                            <button key={i} onClick={() => setActiveView(img)}
                                className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all
                  ${activeView === img ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}>
                                <img src={`http://localhost:8000${img}`} className="w-full h-full object-cover" alt={`view ${i + 1}`} />
                            </button>
                        ))}
                    </div>

                    <p className="flex-shrink-0 text-xs text-gray-400 text-center pb-2">
                        {activeView === '3d' ? '🖱 Drag to rotate · Scroll to zoom' : '← Click 3D to return to model view'}
                    </p>
                </div>

                {/* ── RIGHT: Info — scrollable ── */}
                <div className="w-1/2 h-screen overflow-y-auto">
                    <div className="p-6 space-y-5 max-w-lg">

                        {/* Badges */}
                        <div className="flex gap-2 flex-wrap">
                            {product.isTraditional && <span className="bg-black text-white text-xs px-3 py-1 rounded-full">Traditional</span>}
                            {product.hallmark && <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">Hallmark</span>}
                            {product.customizable && <span className="border border-gray-300 text-gray-500 text-xs px-3 py-1 rounded-full">Customizable</span>}
                        </div>

                        {/* Name */}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                                {product.category} · {product.style?.type}
                                {product.style?.subStyle && ` · ${product.style.subStyle}`}
                            </p>
                            <h1 className="text-xl font-bold leading-tight">{product.name}</h1>
                            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed line-clamp-3">{product.description}</p>
                        </div>

                        {/* Metal Toggle */}
                        {product.metalOptions?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                                    Metal — <span className="capitalize font-normal text-black">{METAL_LABELS[selectedMetal]}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.metalOptions.map(m => (
                                        <button key={m} onClick={() => handleMetalChange(m)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all
                        ${selectedMetal === m ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}>
                                            <span className={`w-3 h-3 rounded-full ${METAL_COLORS[m]}`} />
                                            {METAL_LABELS[m]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Purity — with real gold colors */}
                        {availablePurities.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                                    Purity — <span className="font-normal text-black">{selectedPurity}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {availablePurities.map(p => (
                                        <button key={p} onClick={() => setSelectedPurity(p)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm transition-all
                        ${selectedPurity === p ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}>
                                            {selectedMetal === 'gold' && (
                                                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${GOLD_CARAT_COLORS[p] || 'bg-yellow-400'}`} />
                                            )}
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Higher karat = more pure = higher price</p>
                            </div>
                        )}

                        {/* Weight Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Weight</p>
                                <div className="flex items-center gap-1">
                                    <input type="number" value={inputWeight} step="0.1"
                                        onChange={e => handleWeightInput(e.target.value)}
                                        onBlur={handleWeightBlur}
                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-black" />
                                    <span className="text-sm text-gray-400">tola</span>
                                </div>
                            </div>
                            <input type="range"
                                min={product.minWeightTola} max={product.maxWeightTola} step="0.1"
                                value={selectedWeight}
                                onChange={e => { const v = parseFloat(e.target.value); setSelectedWeight(v); setInputWeight(v.toString()) }}
                                className="w-full accent-black" />
                            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                                <span>{product.minWeightTola} tola (min)</span>
                                <span>{product.maxWeightTola} tola (max)</span>
                            </div>
                        </div>

                        {/* Measurement button — compact */}
                        {measureInfo && (
                            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold text-blue-700">Size Measurement</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {measurement ? `${measurement} ${measureInfo.unit} saved` : 'Not set yet'}
                                    </p>
                                </div>
                                <button onClick={() => setShowMeasureModal(true)}
                                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex-shrink-0">
                                    {measurement ? 'Edit' : '+ Add Size'}
                                </button>
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">Price Breakdown</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    {selectedMetal === 'silver' ? 'Silver' : 'Gold'} cost
                                    ({selectedWeight}t · {selectedPurity} · {Math.round((PURITY_MULTIPLIER[selectedPurity] || 1) * 100)}%)
                                </span>
                                <span>Rs {price.goldCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Making charge</span>
                                <span>Rs {product.makingChargePerTola?.toLocaleString()}</span>
                            </div>
                            {product.jartiAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Jarti (loss)</span>
                                    <span>Rs {product.jartiAmount?.toLocaleString()}</span>
                                </div>
                            )}
                            {product.stoneCharge > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Stone charge</span>
                                    <span>Rs {product.stoneCharge?.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax (2%)</span>
                                <span>Rs {price.tax.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-sm">
                                <span>Total</span>
                                <span>Rs {price.total.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-400">* Delivery charge added at checkout</p>
                        </div>

                        {/* Gold rate */}
                        {goldRate && (
                            <p className="text-xs text-gray-400">
                                Today's rate — Gold: Rs {goldRate.fineGoldPerTola?.toLocaleString()}/tola ·
                                Silver: Rs {goldRate.silverPerTola?.toLocaleString()}/tola
                                {goldRate.isManual ? ' (manual)' : ' (live)'}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-1">
                            <button onClick={handleAddToCart}
                                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition text-sm">
                                Add to Cart
                            </button>
                            <button onClick={handleAddToWishlist}
                                className="w-full border border-black text-black py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                                ♡ Add to Wishlist
                            </button>
                            {product.pickupAvailable && (
                                <p className="text-xs text-center text-gray-400">🏪 Store pickup available — No delivery charge</p>
                            )}
                        </div>

                        {/* WhatsApp */}
                        <div className="border-t pt-4 pb-6">
                            <p className="text-sm text-gray-500">Want a completely different design?</p>
                            <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-1.5 text-sm text-green-600 hover:text-green-700 font-medium">
                                💬 Chat with us on WhatsApp
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}