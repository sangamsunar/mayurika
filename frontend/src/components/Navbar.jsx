import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import cart from "../assets/nav_icons/cart.svg";
import wishlist from "../assets/nav_icons/wishlist.svg";
import logo from "../assets/nav_icons/logo.png";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { UserContext } from "../../context/userContext";
import "../index.css";

const navStyle = "flex justify-evenly items-center h-22 relative";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const { guardAction } = useRequireAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await axios.post('/logout');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
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
    <nav className={navStyle}>
      <div className="flex flex-1 gap-3 text-xs">
        <Link to="/men" className="pl-10">MAN</Link>
        <Link to="/women">WOMEN</Link>
      </div>

      <Link to="/" className="flex relative justify-center items-center">
        <span className="font-bold text-center text-3xl group-hover:opacity-0 transition-opacity duration-300">
          MARYURIKA
        </span>
        <img src={logo} className="absolute w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="flex flex-1 justify-end items-center">
        <div className="flex pr-10 justify-end items-center gap-3">

          {/* Search icon */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-600 hover:text-black transition">
            🔍
          </button>

          {!user ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-xs font-medium">Admin</Link>
              )}
              <Link to="/profile" className="text-xs font-medium">
                {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-xs">Logout</button>
            </>
          )}

          <span onClick={() => guardAction(() => navigate('/wishlist'))} className="cursor-pointer">
            <img src={wishlist} className="w-6" />
          </span>

          <span onClick={() => guardAction(() => navigate('/cart'))} className="cursor-pointer">
            <img src={cart} className="w-5" />
          </span>

        </div>
      </div>

      {/* Search dropdown */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-sm z-50 px-8 py-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jewellery... e.g. tilhari, gold ring, gothic"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black"
            />
            <button type="submit"
              className="bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
              Search
            </button>
            <button type="button" onClick={() => setSearchOpen(false)}
              className="text-gray-400 hover:text-gray-700 px-2">✕</button>
          </form>
        </div>
      )}
    </nav>
  );
}

export default Navbar;