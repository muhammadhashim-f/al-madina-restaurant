import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Al Madina Application Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Amiri', serif", fontSize: "28px", color: "#D4AF37", marginBottom: "12px" }}>
            Al Madina Restaurant
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", maxWidth: "400px", marginBottom: "20px" }}>
            Website reload karne ki zaroorat hai. Barah-e-karam page ko refresh karein.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", background: "linear-gradient(135deg, #D4AF37, #F0DFA0)", color: "#000", fontWeight: "bold", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            Reload Website
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ReservationsProvider } from './context/ReservationsContext';
import { LoadingProvider } from './context/LoadingContext';
import { PolicyProvider } from './context/PolicyContext';

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
import ScrollProgressBar from './components/ScrollProgressBar';
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
    let observer = null;

    const checkAndReveal = () => {
      const targets = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-3d-up');
      if (observer) observer.disconnect();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            } else {
              const rect = entry.target.getBoundingClientRect();
              if (rect.top > window.innerHeight * 1.1 || rect.bottom < -80) {
                entry.target.classList.remove('revealed');
              }
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
      );

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('revealed');
        }
        observer.observe(el);
      });
    };

    checkAndReveal();
    const t1 = setTimeout(checkAndReveal, 150);
    const t2 = setTimeout(checkAndReveal, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (observer) observer.disconnect();
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
    <ErrorBoundary>
      <LoadingProvider>
        <CartProvider>
          <OrdersProvider>
            <FavoritesProvider>
              <ReviewsProvider>
                <ReservationsProvider>
                  <PolicyProvider>
                    <BrowserRouter>
                      <ScrollProgressBar />
                      <Navbar />
                      <ScrollToHash />
                      <ScrollWatcher />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Auth />} />
                        <Route path="/signup" element={<Auth />} />
                        <Route path="/auth" element={<Auth />} />
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
                  </PolicyProvider>
                </ReservationsProvider>
              </ReviewsProvider>
            </FavoritesProvider>
          </OrdersProvider>
        </CartProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;