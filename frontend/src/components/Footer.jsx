import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

        <div className="col-span-2 md:col-span-1">
          <h2 className="text-xl font-bold tracking-widest mb-4">MARYURIKA</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Handcrafted jewellery from the heart of Kathmandu. Tradition meets modern design.</p>
          <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-green-400 hover:text-green-300 text-sm font-medium">
            💬 WhatsApp Us
          </a>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-400">Shop</h3>
          <ul className="space-y-2 text-sm">
            {[['Women', '/women'], ['Men', '/men'], ['Wedding', '/search?style=wedding'], ['Youth', '/search?style=youth'], ['Traditional', '/search?style=traditional'], ['All Products', '/search']].map(([label, path]) => (
              <li key={label}><Link to={path} className="text-gray-300 hover:text-white transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-400">Info</h3>
          <ul className="space-y-2 text-sm">
            {[['About Us', '/about'], ['Return Policy', '/return-policy'], ['Track Order', '/profile']].map(([label, path]) => (
              <li key={label}><Link to={path} className="text-gray-300 hover:text-white transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-400">Visit Us</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Kathmandu, Nepal</p>
          <p className="text-gray-400 text-sm mt-1">Sun–Fri · 10AM–7PM</p>
          <a href="https://maps.app.goo.gl/yrSCeXrXMU2mAK387" target="_blank" rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 inline-block">📍 Get Directions</a>
        </div>
      </div>

      <div className="border-t border-gray-800 px-8 py-4 flex justify-between items-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Maryurika. All rights reserved.</p>
        <p>Made with ❤️ in Nepal</p>
      </div>
    </footer>
  )
}