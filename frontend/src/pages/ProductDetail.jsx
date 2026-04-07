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

const METAL_COLORS = {
    gold: 'bg-yellow-400',
    silver: 'bg-gray-300',
    roseGold: 'bg-rose-300'
}

const METAL_LABELS = {
    gold: 'Gold',
    silver: 'Silver',
    roseGold: 'Rose Gold'
}

export default function ProductDetail() {
    const { id } = useParams()
    const { guardAction } = useRequireAuth()

    const [product, setProduct] = useState(null)
    const [goldRate, setGoldRate] = useState(null)
    const [loading, setLoading] = useState(true)

    // Selections
    const [selectedMetal, setSelectedMetal] = useState('gold')
    const [selectedPurity, setSelectedPurity] = useState('')
    const [selectedWeight, setSelectedWeight] = useState(0)
    const [inputWeight, setInputWeight] = useState('')

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const [productRes, rateRes] = await Promise.all([
                axios.get(`/products/${id}`),
                axios.get('/gold-rate')
            ])
            const p = productRes.data
            setProduct(p)
            setGoldRate(rateRes.data)

            // Set defaults
            const defaultMetal = p.metalOptions?.[0] || 'gold'
            setSelectedMetal(defaultMetal)

            const defaultPurity = defaultMetal === 'silver'
                ? p.purityOptions?.silver?.[0]
                : p.purityOptions?.gold?.[0]
            setSelectedPurity(defaultPurity || '')

            const avgWeight = (p.minWeightTola + p.maxWeightTola) / 2
            setSelectedWeight(avgWeight)
            setInputWeight(avgWeight.toString())

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    // Update purity when metal changes
    const handleMetalChange = (metal) => {
        setSelectedMetal(metal)
        const newPurity = metal === 'silver'
            ? product.purityOptions?.silver?.[0]
            : product.purityOptions?.gold?.[0]
        setSelectedPurity(newPurity || '')
    }

    // Handle weight input manually
    const handleWeightInput = (val) => {
        setInputWeight(val)
        const num = parseFloat(val)
        if (!isNaN(num)) {
            const clamped = Math.min(Math.max(num, product.minWeightTola), product.maxWeightTola)
            setSelectedWeight(clamped)
        }
    }

    const handleWeightBlur = () => {
        setInputWeight(selectedWeight.toString())
    }

    // Price calculation
    const calculatePrice = () => {
        if (!product || !goldRate) return { goldCost: 0, subtotal: 0, tax: 0, total: 0 }

        const rate = selectedMetal === 'silver'
            ? goldRate.silverPerTola
            : goldRate.fineGoldPerTola

        const multiplier = PURITY_MULTIPLIER[selectedPurity] || 1
        const goldCost = selectedWeight * rate * multiplier
        const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
        const tax = subtotal * 0.02
        const total = Math.round(subtotal + tax)

        return { goldCost: Math.round(goldCost), subtotal: Math.round(subtotal), tax: Math.round(tax), total }
    }

    const price = calculatePrice()

    // Current purities based on selected metal
    const currentPurities = selectedMetal === 'silver'
        ? product?.purityOptions?.silver || []
        : product?.purityOptions?.gold || []

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
        </div>
    )

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-400">Product not found</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* LEFT — 3D Viewer */}
            <div className="sticky top-0 w-1/2 h-screen bg-white border-r flex flex-col">
                {/* 3D Canvas */}
                <div className="flex-1">
                    {product.model3D ? (
                        <ModelViewerDetail modelUrl={product.model3D} metal={selectedMetal} />
                    ) : product.images?.[0] ? (
                        <img
                            src={`http://localhost:8000${product.images[0]}`}
                            className="w-full h-full object-contain p-8"
                            alt={product.name}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            No preview available
                        </div>
                    )}
                </div>

                {/* Image thumbnails below viewer */}
                {product.images?.length > 0 && (
                    <div className="flex gap-2 p-4 border-t overflow-x-auto">
                        {product.images.map((img, i) => (
                            <img
                                key={i}
                                src={`http://localhost:8000${img}`}
                                className="w-16 h-16 object-cover rounded border hover:border-black cursor-pointer flex-shrink-0"
                                alt={`view ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Viewer hint */}
                <p className="text-xs text-gray-400 text-center pb-3">
                    🖱 Drag to rotate · Scroll to zoom
                </p>
            </div>

            {/* RIGHT — Product Info */}
            <div className="w-1/2 overflow-y-auto">
                <div className="p-8 space-y-6 max-w-lg">

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                        {product.isTraditional && (
                            <span className="bg-black text-white text-xs px-3 py-1 rounded-full">Traditional</span>
                        )}
                        {product.hallmark && (
                            <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">Hallmark Certified</span>
                        )}
                        {product.customizable && (
                            <span className="border border-gray-300 text-gray-500 text-xs px-3 py-1 rounded-full">Customizable</span>
                        )}
                    </div>

                    {/* Name & Category */}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                            {product.category} · {product.style?.type}
                            {product.style?.subStyle && ` · ${product.style.subStyle}`}
                        </p>
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Metal Toggle */}
                    {product.metalOptions?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                                Metal — <span className="capitalize font-normal text-black">{METAL_LABELS[selectedMetal]}</span>
                            </p>
                            <div className="flex gap-3">
                                {product.metalOptions.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleMetalChange(m)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${selectedMetal === m ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                                    >
                                        <span className={`w-3 h-3 rounded-full ${METAL_COLORS[m]}`} />
                                        {METAL_LABELS[m]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Purity Selector */}
                    {currentPurities.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                                Purity — <span className="font-normal text-black">{selectedPurity}</span>
                            </p>
                            <div className="flex gap-2">
                                {currentPurities.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPurity(p)}
                                        className={`px-4 py-2 rounded border text-sm transition-all ${selectedPurity === p ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Weight Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Weight (Tola)</p>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={inputWeight}
                                    onChange={e => handleWeightInput(e.target.value)}
                                    onBlur={handleWeightBlur}
                                    step="0.1"
                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-black"
                                />
                                <span className="text-sm text-gray-400">tola</span>
                            </div>
                        </div>

                        <input
                            type="range"
                            min={product.minWeightTola}
                            max={product.maxWeightTola}
                            step="0.1"
                            value={selectedWeight}
                            onChange={e => {
                                const val = parseFloat(e.target.value)
                                setSelectedWeight(val)
                                setInputWeight(val.toString())
                            }}
                            className="w-full accent-black"
                        />

                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{product.minWeightTola} tola</span>
                            <span>{product.maxWeightTola} tola</span>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">Price Breakdown</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Gold cost ({selectedWeight} tola × {PURITY_MULTIPLIER[selectedPurity] * 100}% purity)
                            </span>
                            <span>Rs {price.goldCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Making charge</span>
                            <span>Rs {product.makingChargePerTola.toLocaleString()}</span>
                        </div>
                        {product.jartiAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Jarti (loss)</span>
                                <span>Rs {product.jartiAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {product.stoneCharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Stone charge</span>
                                <span>Rs {product.stoneCharge.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax (2%)</span>
                            <span>Rs {price.tax.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span>Rs {price.total.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-400">* Delivery charge calculated at checkout</p>
                    </div>

                    {/* Gold rate info */}
                    {goldRate && (
                        <p className="text-xs text-gray-400">
                            Today's gold rate: Rs {goldRate.fineGoldPerTola?.toLocaleString()} / tola ·
                            Silver: Rs {goldRate.silverPerTola?.toLocaleString()} / tola
                            {goldRate.isManual ? ' (manually set)' : ' (live rate)'}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={() => guardAction(() => toast.success('Added to cart!'))}
                            className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 transition"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => guardAction(() => toast.success('Added to wishlist!'))}
                            className="w-full border border-black text-black py-3 rounded font-medium hover:bg-gray-50 transition"
                        >
                            ♡ Add to Wishlist
                        </button>
                        {product.pickupAvailable && (
                            <p className="text-xs text-center text-gray-400">
                                🏪 Store pickup available — No delivery charge
                            </p>
                        )}
                    </div>

                    {/* Custom order */}
                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">Want a completely different design?</p>
                        <a
                            href="https://wa.me/977XXXXXXXXXX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            💬 Chat with us on WhatsApp
                        </a>
                    </div>

                </div>
            </div>
        </div>
    )
}