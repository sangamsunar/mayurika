import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Women from './pages/Women';
import Men from './pages/Men';
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Footer from "./components/Footer";
import axios from 'axios'
import { Login } from "./pages/Login.jsx"
import { Register } from "./pages/Register.jsx"
import { Toaster } from 'react-hot-toast'
import { UserContextProvider } from "../context/userContext.jsx";
import { ForgotPassword } from './pages/ForgotPassword'
import { VerifyOtp } from './pages/VerifyOtp'
import { ResetPassword } from './pages/ResetPassword'
import { VerifyEmail } from './pages/VerifyEmail'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import About from './pages/About'
import ReturnPolicy from './pages/ReturnPolicy'

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Navbar />
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/men" element={<Men />} />
          <Route path="/women" element={<Women />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Protected */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;