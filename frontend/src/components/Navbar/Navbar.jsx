// Navbar.jsx
import { Link } from "react-router-dom";
import cart from "../../assets/nav_icons/cart.svg";
import wishlist from "../../assets/nav_icons/wishlist.svg";
import logo from "../../assets/nav_icons/logo.png";
import "../../index.css";

const navStyle = "flex justify-evenly items-center h-22";

function Navbar() {
  return (
    <nav className={navStyle}>
      <div className="flex flex-1 gap-3 text-xs">
        <Link to="/men" className="pl-10">MAN</Link>
        <Link to="/women">WOMEN</Link>
      </div>

      <Link to="/" className="flex realtive justify-center items-center">
        {/* opacity-100 transition-opacity duration-300 hover:opacity-0 */}
        <snap 
          className="group:hover-hidden font-bold text-center text-3xl group-hover:opacity-0 transition-opacity duration-300">
          MARYURIKA
        </snap>
        
        <img src={logo} className="absolute w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
        {/* opacity-0 transition-opacity duration-300 hover:opacity-100 */}
      </Link>

      <div className="flex flex-1 justify-end items-center">
        <div className="flex pr-10 justify-end items-center gap-3">
          <Link to="/wishlist">
            <img src={wishlist} className="w-6" />
          </Link>
          <Link to="/cart">
            <img src={cart} className="w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
