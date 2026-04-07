import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModelViewerCard } from './ModelViewer'
import { useRequireAuth } from '../hooks/useRequireAuth'

export default function ProductCard({ product, goldRate }) {
  const navigate = useNavigate()
  const { guardAction } = useRequireAuth()
  const [selectedMetal, setSelectedMetal] = useState(product.metalOptions?.[0] || 'gold')

  // Purity multipliers
  const PURITY_MULTIPLIER = {
    '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
    '999': 1.0, '925': 0.925
  }

  // Calculate price at average weight
  const avgWeight = (product.minWeightTola + product.maxWeightTola) / 2
  const defaultPurity = selectedMetal === 'silver'
    ? (product.purityOptions?.silver?.[0] || '999')
    : (product.purityOptions?.gold?.[0] || '24K')
  const multiplier = PURITY_MULTIPLIER[defaultPurity] || 1
  const rate = selectedMetal === 'silver'
    ? (goldRate?.silverPerTola || 0)
    : (goldRate?.fineGoldPerTola || 0)

  const goldCost = avgWeight * rate * multiplier
  const subtotal = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
  const tax = subtotal * 0.02
  const totalPrice = Math.round(subtotal + tax)

  const METAL_COLORS = {
    gold: 'bg-yellow-400',
    silver: 'bg-gray-300',
    roseGold: 'bg-rose-300'
  }

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* 3D Viewer */}
      <div className="w-full h-64 bg-gray-50 relative">
        {product.model3D ? (
          <ModelViewerCard modelUrl={product.model3D} metal={selectedMetal} />
        ) : product.images?.[0] ? (
          <img
            src={`http://localhost:8000${product.images[0]}`}
            className="w-full h-full object-cover"
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No preview
          </div>
        )}

        {/* Metal toggle on card */}
        {product.metalOptions?.length > 1 && (
          <div
            className="absolute bottom-2 right-2 flex gap-1"
            onClick={e => e.stopPropagation()}
          >
            {product.metalOptions.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMetal(m)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${METAL_COLORS[m]} ${selectedMetal === m ? 'border-black scale-110' : 'border-white'}`}
                title={m}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isTraditional && (
            <span className="bg-black text-white text-xs px-2 py-0.5 rounded">Traditional</span>
          )}
          {product.hallmark && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">Hallmark</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category} · {product.style?.type}</p>

        <div className="mt-3 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="font-semibold text-sm">
              Rs {totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{avgWeight} tola avg</p>
          </div>

          <button
            onClick={e => {
              e.stopPropagation()
              guardAction(() => {
                // add to wishlist logic later
              })
            }}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg"
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  )
}