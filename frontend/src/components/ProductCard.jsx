import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LazyModelViewerCard } from './ModelViewer'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useWishlist } from '../../context/wishlistContext'
import { HeartIcon } from './Icons'
import { toast } from 'react-hot-toast'

const PURITY_MULTIPLIER = {
  '24K': 1.0, '23K': 0.958, '22K': 0.916, '18K': 0.75,
  '999': 1.0, '925': 0.925
}

const METAL_COLORS = {
  gold:   'bg-[#C9A96E]',
  silver: 'bg-[#C0C0C0]',
}

export default function ProductCard({ product, goldRate }) {
  const navigate = useNavigate()
  const { guardAction } = useRequireAuth()
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist()
  const [selectedMetal, setSelectedMetal] = useState(product.metalOptions?.[0] || 'gold')

  const isWishlisted = wishlistIds.has(product._id)

  const avgWeight   = (product.minWeightTola + product.maxWeightTola) / 2
  const defaultPurity = selectedMetal === 'silver'
    ? (product.purityOptions?.silver?.[0] || '999')
    : (product.purityOptions?.gold?.[0] || '24K')
  const multiplier  = PURITY_MULTIPLIER[defaultPurity] || 1
  const rate        = selectedMetal === 'silver'
    ? (goldRate?.silverPerTola || 0)
    : (goldRate?.fineGoldPerTola || 0)
  const goldCost    = avgWeight * rate * multiplier
  const subtotal    = goldCost + product.makingChargePerTola + product.jartiAmount + product.stoneCharge
  const totalPrice  = Math.round(subtotal * 1.02)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-[#C9A96E]/25 group-hover:shadow-[0_8px_40px_rgba(201,169,110,0.08)]">

        {/* ── 3D / Image ───────────────────────────────── */}
        <div className="w-full aspect-square bg-surface-2 relative overflow-hidden">
          {product.model3D ? (
            <LazyModelViewerCard modelUrl={product.model3D} metal={selectedMetal} purity={defaultPurity} />
          ) : product.images?.[0] ? (
            <img
              src={`http://localhost:8000${product.images[0]}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={product.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-dim text-xs tracking-widest uppercase">
              No preview
            </div>
          )}

          {/* Metal toggle */}
          {product.metalOptions?.length > 1 && (
            <div
              className="absolute bottom-3 right-3 flex gap-1.5"
              onClick={e => e.stopPropagation()}
            >
              {product.metalOptions.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMetal(m)}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${METAL_COLORS[m]}
                    ${selectedMetal === m ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-transparent scale-110' : 'opacity-60 hover:opacity-100'}`}
                  title={m}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isTraditional && (
              <span className="glass-sm text-[#C9A96E] text-[10px] px-2 py-0.5 rounded-md tracking-wider font-medium">
                Traditional
              </span>
            )}
            {product.hallmark && (
              <span className="bg-[#C9A96E]/20 border border-[#C9A96E]/30 text-[#C9A96E] text-[10px] px-2 py-0.5 rounded-md tracking-wider font-medium">
                Hallmark
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={e => {
              e.stopPropagation()
              guardAction(() => {
                toggleWishlist(product._id)
                toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', { duration: 1500 })
              })
            }}
            className={`absolute top-3 right-3 w-8 h-8 glass-sm rounded-lg flex items-center justify-center transition-all duration-200
              ${isWishlisted ? 'text-rose-400 border-rose-400/30' : 'text-ink-dim hover:text-rose-400 opacity-0 group-hover:opacity-100'}`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <HeartIcon size={14} filled={isWishlisted} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Info ────────────────────────────────────── */}
        <div className="p-4 border-t border-white/[0.05]">
          <h3 className="font-display text-ink text-base font-medium leading-snug truncate">
            {product.name}
          </h3>
          <p className="text-ink-dim text-xs capitalize mt-0.5 tracking-wide">
            {product.category}{product.style?.type ? ` · ${product.style.type}` : ''}
          </p>

          <div className="mt-3 flex justify-between items-end">
            <div>
              <p className="text-ink-dim text-[10px] tracking-wider uppercase">From</p>
              <p className="text-ink font-medium text-sm mt-0.5">
                Rs {totalPrice.toLocaleString()}
              </p>
              <p className="text-ink-dim text-[10px]">{avgWeight} tola avg</p>
            </div>

            <div className="w-6 h-6 flex items-center justify-center">
              {/* decorative line accent on hover */}
              <div className="w-4 h-px bg-[#C9A96E]/0 group-hover:bg-[#C9A96E]/40 transition-all duration-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
