// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Women from './pages/Women/Women';
import Men from './pages/Men/Men';
import Navbar from "./components/Navbar/Navbar";
import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/Wishlist/Wishlist"
import Footer from "./components/Footer/Footer"
function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/Cart" element={<Cart />}/>
        <Route path="/Wishlist" element={<Wishlist />}/>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
