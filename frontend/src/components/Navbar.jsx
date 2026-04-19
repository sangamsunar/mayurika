import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import cart from "../assets/nav_icons/cart.svg";
import wishlist from "../assets/nav_icons/wishlist.svg";
import logo from "../assets/nav_icons/logo.png";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { UserContext } from "../../context/userContext";
import "../index.css";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const { guardAction } = useRequireAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    await axios.post('/logout');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="flex justify-evenly items-center h-22 relative bg-white border-b border-gray-100 px-4">

        {/* Left links — hidden on mobile */}
        <div className="hidden md:flex flex-1 gap-3 text-xs">
          <Link to="/men" className="pl-10 hover:text-gray-500 transition">MAN</Link>
          <Link to="/women" className="hover:text-gray-500 transition">WOMEN</Link>
        </div>

        {/* Logo */}
        <Link to="/" className="flex relative justify-center items-center group">
          <span className="font-bold text-center text-3xl group-hover:opacity-0 transition-opacity duration-300">
            MARYURIKA
          </span>
          <img src={logo} className="absolute w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" alt="logo" />
        </Link>

        {/* Right icons */}
        <div className="flex flex-1 justify-end items-center">
          <div className="flex pr-4 md:pr-10 justify-end items-center gap-3">

            {/* Search icon */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-600 hover:text-black transition" aria-label="Search">
              🔍
            </button>

            {/* Desktop auth links */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link to="/register" className="text-xs hover:text-gray-500 transition">Register</Link>
                  <Link to="/login" className="text-xs hover:text-gray-500 transition">Login</Link>
                </>
              ) : (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-xs font-medium hover:text-gray-500 transition">Admin</Link>
                  )}
                  <Link to="/profile" className="text-xs font-medium hover:text-gray-500 transition">
                    {user.name?.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout} className="text-xs hover:text-gray-500 transition">Logout</button>
                </>
              )}
            </div>

            <span onClick={() => guardAction(() => navigate('/wishlist'))} className="cursor-pointer" aria-label="Wishlist">
              <img src={wishlist} className="w-6" alt="wishlist" />
            </span>

            <span onClick={() => guardAction(() => navigate('/cart'))} className="cursor-pointer" aria-label="Cart">
              <img src={cart} className="w-5" alt="cart" />
            </span>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-1 ml-1"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-sm z-50 px-6 py-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jewellery… e.g. tilhari, gold ring, gothic"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition"
              />
              <button type="submit"
                className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:bg-gray-800 transition">
                Search
              </button>
              <button type="button" onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-gray-700 px-2">✕</button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b shadow-md z-40">
          <div className="px-6 py-5 space-y-4">

            {/* Nav links */}
            <div className="space-y-3">
              <Link to="/men" onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold uppercase tracking-wider text-gray-700 hover:text-black transition">
                Man
              </Link>
              <Link to="/women" onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold uppercase tracking-wider text-gray-700 hover:text-black transition">
                Women
              </Link>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              {!user ? (
                <>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="block w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                    Create Account
                  </Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="block w-full border border-gray-200 text-center py-3 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-400 transition">
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 pb-2">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="block text-sm text-gray-600 hover:text-black transition">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black transition">
                    My Profile & Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black transition">
                    Wishlist
                  </Link>
                  <Link to="/cart" onClick={() => setMenuOpen(false)}
                    className="block text-sm text-gray-600 hover:text-black transition">
                    Cart
                  </Link>
                  <button onClick={handleLogout}
                    className="block w-full text-left text-sm text-red-400 hover:text-red-600 transition pt-1">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
