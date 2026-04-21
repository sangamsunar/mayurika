import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/nav_icons/logo.png";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { UserContext } from "../../context/userContext";
import { useWishlist } from "../../context/wishlistContext";
import { SearchIcon, CartIcon, HeartIcon, UserIcon, MenuIcon, XIcon } from "./Icons";

const NAV_LINKS = [
  { label: "MAN", to: "/men" },
  { label: "WOMEN", to: "/women" },
  { label: "UNISEX", to: "/unisex" },
  { label: "ABOUT", to: "/about" },
]

export default function Navbar() {
  const { user, setUser } = useContext(UserContext)
  const { ids: wishlistIds } = useWishlist()
  const { guardAction } = useRequireAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80)
  }, [searchOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const handleLogout = async () => {
    await axios.post("/logout")
    setUser(null)
    toast.success("See you soon")
    navigate("/")
    setMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const wishlistCount = wishlistIds.size

  return (
    <>
      {/* ── Main Navbar ───────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-[#04040A]/60 backdrop-blur-2xl border-b border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]"
          }`}
        style={{
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.6)" : "blur(16px) saturate(1.4)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 md:h-[72px] flex items-center justify-between gap-6">

          {/* ── Left nav ────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-7 flex-1">

            {/* Admin link — before MAN */}
            {user?.role === "admin" && (
              <Link to="/admin"
                className={`text-[11px] tracking-[0.16em] font-medium transition-colors duration-200 relative group
                  ${location.pathname === "/admin" ? "text-[#C9A96E]" : "text-ink-muted hover:text-ink"}`}
              >
                ADMIN
                <span className={`absolute -bottom-0.5 left-0 h-px bg-[#C9A96E] transition-all duration-300
                  ${location.pathname === "/admin" ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            )}

            {NAV_LINKS.map(({ label, to }) => (
              <Link key={to} to={to}
                className={`text-[11px] tracking-[0.16em] font-medium transition-colors duration-200 relative group
                  ${location.pathname === to ? "text-[#C9A96E]" : "text-ink-muted hover:text-ink"}`}
              >
                {label}
                <span className={`absolute -bottom-0.5 left-0 h-px bg-[#C9A96E] transition-all duration-300
                  ${location.pathname === to ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </nav>

          {/* ── Logo ─────────────────────────────────── */}
          <Link to="/" className="flex-shrink-0 flex items-center justify-center relative group">
            <span className="font-display font-bold text-2xl md:text-3xl tracking-[0.2em] text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
              MAYURIKA
            </span>
            <img src={logo} className="absolute w-12 group-hover:opacity-0 transition-opacity duration-300" alt="logo" />
          </Link>

          {/* ── Right icons ──────────────────────────── */}
          <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.08] transition-all"
              aria-label="Search"
            >
              <SearchIcon size={18} strokeWidth={1.6} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => guardAction(() => navigate("/wishlist"))}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.08] transition-all"
              aria-label="Wishlist"
            >
              <HeartIcon size={18} strokeWidth={1.6} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A96E] rounded-full" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => guardAction(() => navigate("/cart"))}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.08] transition-all"
              aria-label="Cart"
            >
              <CartIcon size={18} strokeWidth={1.6} />
            </button>

            {/* Auth / Profile — desktop */}
            <div className="hidden md:flex items-center gap-1 ml-1">
              {!user ? (
                <>
                  <Link to="/login"
                    className="px-3 py-1.5 text-[11px] tracking-[0.1em] text-ink-muted hover:text-ink transition-colors">
                    SIGN IN
                  </Link>
                  <Link to="/register"
                    className="px-4 py-1.5 text-[11px] tracking-[0.1em] bg-[#C9A96E] text-[#07070A] font-semibold rounded-md hover:bg-[#E8D4A0] transition-colors">
                    JOIN
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Link to="/profile"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.1em] text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-white/[0.08]"
                  >
                    <UserIcon size={14} strokeWidth={1.6} />
                    {user.name?.split(" ")[0]?.toUpperCase()}
                  </Link>
                  <button onClick={handleLogout}
                    className="px-3 py-1.5 text-[11px] tracking-[0.1em] text-red-400/70 hover:text-red-400 transition-colors">
                    LOGOUT
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.08] transition-all ml-1"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Menu"
            >
              {menuOpen ? <XIcon size={18} strokeWidth={1.6} /> : <MenuIcon size={18} strokeWidth={1.6} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── NO SPACER — hero image bleeds behind navbar ───────────────── */}
      <div className="h-16 md:h-[72px]" />

      {/* ── Search Overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#07070A]/95 backdrop-blur-2xl flex flex-col items-center justify-center px-6"
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="w-full max-w-2xl"
            >
              <p className="text-[10px] tracking-[0.3em] text-ink-dim uppercase text-center mb-8">
                What are you looking for?
              </p>
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jewellery — tilhari, gold ring, gothic…"
                  className="w-full bg-transparent border-0 border-b border-white/20 focus:border-[#C9A96E] text-ink text-2xl md:text-3xl font-display pb-4 pt-2 pr-12 outline-none placeholder:text-ink-dim transition-colors"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-muted hover:text-[#C9A96E] transition-colors">
                  <SearchIcon size={22} strokeWidth={1.4} />
                </button>
              </form>
              <button
                onClick={() => setSearchOpen(false)}
                className="mt-8 mx-auto flex items-center gap-2 text-[11px] tracking-[0.2em] text-ink-dim hover:text-ink-muted transition-colors"
              >
                <XIcon size={12} /> ESC TO CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Full-Screen Menu ────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0, 0.32, 1] }}
            className="fixed inset-0 z-[55] bg-[#07070A] flex flex-col"
          >
            <div className="flex justify-between items-center px-6 h-16">
              <span className="font-display font-bold text-xl tracking-[0.2em] text-ink">MAYURIKA</span>
              <button onClick={() => setMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.06] transition-all">
                <XIcon size={18} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
              <nav className="space-y-1 mb-10">
                {NAV_LINKS.map(({ label, to }, i) => (
                  <motion.div key={to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}>
                    <Link to={to} onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between py-4 border-b border-white/[0.05] group
                        ${location.pathname === to ? "text-[#C9A96E]" : "text-ink"}`}>
                      <span className="font-display text-3xl font-light tracking-wide">{label}</span>
                      <span className={`text-xs tracking-widest transition-colors ${location.pathname === to ? "text-[#C9A96E]" : "text-ink-dim group-hover:text-ink-muted"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto border-t border-white/[0.07] pt-6"
              >
                {!user ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/register" onClick={() => setMenuOpen(false)}
                      className="w-full py-3.5 bg-[#C9A96E] text-[#07070A] font-semibold text-sm tracking-widest text-center rounded-xl hover:bg-[#E8D4A0] transition-colors">
                      CREATE ACCOUNT
                    </Link>
                    <Link to="/login" onClick={() => setMenuOpen(false)}
                      className="w-full py-3.5 glass text-ink text-sm tracking-widest text-center rounded-xl hover:bg-white/[0.06] transition-colors">
                      SIGN IN
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/20 border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E] text-sm font-bold font-display">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{user.name}</p>
                        <p className="text-xs text-ink-dim">{user.email}</p>
                      </div>
                    </div>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 py-2.5 text-sm text-[#C9A96E] hover:text-[#E8D4A0] transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 text-sm text-ink-muted hover:text-ink transition-colors">
                      My Profile & Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 text-sm text-ink-muted hover:text-ink transition-colors">
                      Wishlist {wishlistCount > 0 && <span className="text-xs text-[#C9A96E]">({wishlistCount})</span>}
                    </Link>
                    <Link to="/cart" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 text-sm text-ink-muted hover:text-ink transition-colors">
                      Cart
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 py-2.5 text-sm text-red-400/70 hover:text-red-400 transition-colors w-full text-left mt-2 border-t border-white/[0.05] pt-4">
                      Sign out
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}