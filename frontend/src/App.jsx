// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Women from './pages/Women';
import Men from './pages/Men';
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Footer from "./components/Footer";
import axios from 'axios'
import {Login} from "./pages/Login.jsx"
import {Register} from "./pages/Register.jsx"
import {Toaster} from 'react-hot-toast'

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials= true

function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <Toaster position="bottom-right" toastOptions={{duration: 2000}}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/Cart" element={<Cart />}/>
        <Route path="/Wishlist" element={<Wishlist />}/>
        <Route path="/Register" element={<Register />}/>
        <Route path="/Login" element={<Login />}/>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
