import { Link } from 'react-router-dom'
import { MapPinIcon, WhatsAppIcon, ArrowUpRightIcon } from './Icons'

const SHOP_LINKS = [['Women', '/women'], ['Men', '/men'], ['Unisex', '/unisex'], ['Wedding', '/search?style=wedding'], ['Youth', '/search?style=youth'], ['Traditional', '/search?style=traditional']]
const INFO_LINKS = [['About Us', '/about'], ['Return Policy', '/return-policy'], ['Track Order', '/profile']]

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/[0.05]">

      {/* Main grid */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-10 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">

        {/* Brand */}
        <div className="col-span-2">
          <p className="font-display text-2xl font-bold tracking-[0.2em] text-ink mb-4">MAYURIKA</p>
          <p className="text-ink-muted text-sm leading-relaxed max-w-xs">
            Handcrafted jewellery from the heart of Kathmandu — where ancient Nepali tradition meets modern design.
          </p>
          <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 mt-6 px-4 py-2.5 glass rounded-xl text-sm font-medium text-green-400 hover:bg-green-400/10 transition-all">
            <WhatsAppIcon size={16} />
            WhatsApp Us
            <ArrowUpRightIcon size={12} className="text-ink-dim" />
          </a>
        </div>

        {/* Shop */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-dim mb-5">Shop</p>
          <ul className="space-y-3">
            {SHOP_LINKS.map(([label, path]) => (
              <li key={label}><Link to={path} className="text-sm text-ink-muted hover:text-[#C9A96E] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-dim mb-5">Info</p>
          <ul className="space-y-3">
            {INFO_LINKS.map(([label, path]) => (
              <li key={label}><Link to={path} className="text-sm text-ink-muted hover:text-[#C9A96E] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Visit */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-dim mb-5">Visit Us</p>
          <p className="text-sm text-ink-muted leading-relaxed">Nepal</p>
          <p className="text-sm text-ink-muted mt-1">Sun – Fri · 10 AM – 7 PM</p>
          <a href="https://maps.app.goo.gl/yrSCeXrXMU2mAK387" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#C9A96E] hover:text-[#E8D4A0] transition-colors">
            <MapPinIcon size={14} strokeWidth={1.6} />
            Get Directions
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-8 md:mx-10 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />

      {/* Bottom bar */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-ink-dim tracking-wide">
        <p>© {new Date().getFullYear()} MAYURIKA. All rights reserved.</p>
        <p>Handcrafted with love in <span className="text-[#C9A96E]">Nepal</span></p>
      </div>
    </footer>
  )
}
