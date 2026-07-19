import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ReviewsProvider } from './context/ReviewsContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Offers from './components/Offers';
import About from './components/About';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Reservations from './components/Reservations';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import Profile from './components/Profile';
import Favorites from './components/Favorites';
import ForgotPassword from './components/ForgotPassword';
import Tracking from './components/Tracking';
import Chatbot from './components/Chatbot';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Google/Supabase login ke baad URL mein "#access_token=..." jaisa
    // hash aata hai — wo ek page-section ka naam nahi hota, isliye use
    // scroll-target ke tor par treat nahi karna.
    const isNavigationHash = location.hash && /^#[a-zA-Z][\w-]*$/.test(location.hash);

    if (isNavigationHash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <Menu />
      <Offers />
      <About />
      <Gallery />
      <Reviews />
      <Contact />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <OrdersProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <BrowserRouter>
              <Navbar />
              <ScrollToHash />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/track/:orderId" element={<Tracking />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
              <Chatbot />
              <Footer />
            </BrowserRouter>
          </ReviewsProvider>
        </FavoritesProvider>
      </OrdersProvider>
    </CartProvider>
  );
}

export default App;