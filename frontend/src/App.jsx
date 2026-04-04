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
import { UserContextProvider } from "../context/userContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials= true

function App() {
  return (
    <UserContextProvider>
    <BrowserRouter>
      <Navbar/>
      <Toaster position="bottom-right" toastOptions={{duration: 2000}}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/cart" element={<Cart />}/>
        <Route path="/wishlist" element={<Wishlist />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/forgot-password" element={<Forgot-Password />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
      <Footer />
    </BrowserRouter>
    </UserContextProvider>

  );
}

export default App;
