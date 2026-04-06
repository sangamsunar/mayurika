// Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import cart from "../assets/nav_icons/cart.svg";
import wishlist from "../assets/nav_icons/wishlist.svg";
import logo from "../assets/nav_icons/logo.png";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { UserContext } from "../../context/userContext";
import "../index.css";

const navStyle = "flex justify-evenly items-center h-22";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const { guardAction } = useRequireAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.post('/logout');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className={navStyle}>
      <div className="flex flex-1 gap-3 text-xs">
        <Link to="/men" className="pl-10">MAN</Link>
        <Link to="/women">WOMEN</Link>
      </div>

      <Link to="/" className="flex relative justify-center items-center">
        <span className="group:hover-hidden font-bold text-center text-3xl group-hover:opacity-0 transition-opacity duration-300">
          MARYURIKA
        </span>
        <img src={logo} className="absolute w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="flex flex-1 justify-end items-center">
        <div className="flex pr-10 justify-end items-center gap-3">

          {!user ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}

          <span onClick={() => guardAction(() => navigate('/wishlist'))} className="cursor-pointer">
            <img src={wishlist} className="w-6" />
          </span>

          <span onClick={() => guardAction(() => navigate('/cart'))} className="cursor-pointer">
            <img src={cart} className="w-5" />
          </span>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}  
        </div>
      </div>
    </nav>
  );
}

export default Navbar;