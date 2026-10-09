import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { LoadingProvider } from './context/LoadingContext';

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
import NetworkSpeedLoader from './components/NetworkSpeedLoader';
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

function ScrollWatcher() {
  const location = useLocation();

  useEffect(() => {
    const observeTargets = () => {
      const targets = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-3d-up');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            } else {
              const rect = entry.target.getBoundingClientRect();
              if (rect.top > window.innerHeight * 1.05 || rect.bottom < -60) {
                entry.target.classList.remove('revealed');
              }
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
      );

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('revealed');
        }
        observer.observe(el);
      });

      return observer;
    };

    const obs = observeTargets();
    const timeout = setTimeout(observeTargets, 250);

    return () => {
      clearTimeout(timeout);
      if (obs) obs.disconnect();
    };
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
    <LoadingProvider>
      <CartProvider>
        <OrdersProvider>
          <FavoritesProvider>
            <ReviewsProvider>
              <BrowserRouter>
                <Navbar />
                <ScrollToHash />
                <ScrollWatcher />
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
                <NetworkSpeedLoader />
                <Footer />
              </BrowserRouter>
            </ReviewsProvider>
          </FavoritesProvider>
        </OrdersProvider>
      </CartProvider>
    </LoadingProvider>
  );
}

export default App;