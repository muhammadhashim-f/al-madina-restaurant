import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { Menu, X, ShoppingCart, User, ChevronDown, Search, Heart } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Navbar (v2: gradient + motion)
// Design tokens:
//   emerald-deep  : #0A2F23   (gradient start)
//   emerald-mid   : #1B5C42   (gradient mid)
//   emerald-light : #2C7A57   (gradient end / hover glow)
//   gold          : #D4AF37   (accent, dividers, active state)
//   gold-soft     : #F0DFA0   (text highlights)
//   ivory         : #FBF7EF   (light text / bg)
//   maroon        : #7A1F2B  ->  #96283A (CTA gradient)
// Display font : "Amiri" (Arabic-inspired serif) — logo + wordmark
// Body font    : "Work Sans" — nav links, buttons
// Signature    : animated gold arch-motif divider + soft glow behind logo
// Effects      : scroll-shrink + blur, gold shimmer sweep on hover,
//                pulsing cart badge, animated underline, slide-in mobile menu
// ============================================================

const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Menu", href: "/#menu" },
  { label: "Reservations", href: "/reservations" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}#menu`);
  };

  const { user, isLoggedIn, signOut } = useAuth();
  const { cartCount } = useCart();
  const { favorites } = useFavorites();

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "U";

  const handleLogout = async () => {
    await signOut();
    setProfileOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        @keyframes shimmerSweep {
          0% { background-position: -150% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        /* Logo loader animation defined below with real 2-minute delay */
        /* Brand name scan/shine — reverted to original continuous speed, no hold */
        .am-brand-shine {
          background: linear-gradient(100deg, #FFFFFF 0%, #FFFFFF 42%, #000000 50%, #FFFFFF 58%, #FFFFFF 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: scanText 3.2s linear infinite;
        }
        @keyframes scanText {
          0%   { background-position: 160% 0; }
          100% { background-position: -60% 0; }
        }
        /* Logo loader — draws fully in ~2s, then holds for a real 2-minute pause, then resets */
        @keyframes ringDraw {
          0%     { stroke-dashoffset: 100; }
          1.6%   { stroke-dashoffset: 0; }
          100%   { stroke-dashoffset: 0; }
        }
        @keyframes dotGrow {
          0%     { transform: scale(0); }
          1.6%   { transform: scale(1); }
          98%    { transform: scale(1); }
          100%   { transform: scale(0); }
        }
        /* Robust plain CSS text-color classes (not relying on Tailwind arbitrary values) */
        .am-white { color: #FFFFFF; }
        .am-white:hover { color: #F0DFA0; }
        .am-glow-text {
          color: #FFFFFF;
          text-shadow: 0 0 6px rgba(212,175,55,0.6), 0 1px 2px rgba(0,0,0,0.5);
        }
        .am-navbar {
          background: linear-gradient(115deg, #0A0A0A 0%, #181818 50%, #0A0A0A 100%);
          transition: box-shadow 0.35s ease, padding 0.35s ease;
        }
        .am-navbar.scrolled {
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
        .am-navbar-inner {
          transition: height 0.35s ease;
        }
        .am-link {
          position: relative;
          overflow: hidden;
        }
        .am-link::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent);
          background-size: 60% 100%;
          background-repeat: no-repeat;
          background-position: -150% 0;
          transition: background-position 0.6s ease;
        }
        .am-link:hover::before {
          background-position: 250% 0;
        }
        .am-underline {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 2px;
          height: 1.5px;
          background: linear-gradient(90deg, #D4AF37, #F0DFA0);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .am-link:hover .am-underline {
          transform: scaleX(1);
        }
        .am-cart-badge {
          animation: pulseBadge 2s ease-in-out infinite;
        }
        .am-logo-glow {
          position: absolute;
          width: 60px;
          height: 60px;
          left: -11px;
          top: -11px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,175,55,0.45) 0%, transparent 70%);
          animation: glowPulse 3s ease-in-out infinite;
          pointer-events: none;
        }
        .am-cta {
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(212,175,55,0.45);
        }
        .am-mobile-panel {
          animation: fadeSlideDown 0.3s ease;
        }
        .am-icon-btn {
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .am-icon-btn:hover {
          background: rgba(212,175,55,0.14);
          transform: translateY(-1px);
        }
        .am-search-wrap {
          display: flex;
          align-items: center;
          overflow: hidden;
          transition: width 0.35s ease, background 0.25s ease;
          border-radius: var(--radius, 8px);
        }
        .am-search-wrap.closed {
          width: 40px;
          background: transparent;
        }
        .am-search-wrap.open {
          width: 200px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(212,175,55,0.4);
        }
        .am-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #FFFFFF;
          font-size: 13px;
          width: 100%;
          padding: 0 8px;
        }
        .am-search-input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .am-mobile-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 12px;
        }
      `}</style>

      <nav className={`am-navbar fixed top-0 left-0 w-full z-50 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`am-navbar-inner flex items-center justify-between ${scrolled ? "h-16" : "h-20"}`}>
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3 shrink-0 relative">
              <div className="relative">
                <span className="am-logo-glow" />
                <ArchLogo />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="am-brand-shine text-2xl tracking-wide"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  Al Madina
                </span>
                <span className="am-glow-text text-[11px] tracking-[0.25em] uppercase">
                  Restaurant
                </span>
              </div>
            </a>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="am-link px-4 py-2 text-sm font-medium am-white transition-colors rounded-md"
                >
                  {link.label}
                  <span className="am-underline" />
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className={`am-search-wrap ${searchOpen ? "open" : "closed"}`}>
                <button
                  type="button"
                  aria-label="Toggle search"
                  onClick={() => searchOpen ? handleSearch({ preventDefault: () => {} }) : setSearchOpen(true)}
                  className="p-2 shrink-0"
                >
                  <Search size={19} className="am-white" />
                </button>
                {searchOpen && (
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes... (Enter)"
                    className="am-search-input"
                  />
                )}
              </form>

              {/* Favorites */}
              <Link
                to="/favorites"
                aria-label="View favorites"
                className="am-icon-btn relative p-2 rounded-full"
              >
                <Heart size={19} className="am-white" />
                {favorites.length > 0 && (
                  <span className="am-cart-badge absolute -top-0.5 -right-0.5 bg-[#96283A] text-[#F5E9C8] text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                id="am-navbar-cart-btn"
                to="/cart"
                aria-label="View cart"
                className="am-icon-btn relative p-2 rounded-full"
              >
                <ShoppingCart size={20} className="am-white" />
                {cartCount > 0 && (
                  <span className="am-cart-badge absolute -top-0.5 -right-0.5 bg-[#96283A] text-[#F5E9C8] text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth / Profile */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="am-icon-btn flex items-center gap-2 pl-1 pr-2 py-1 rounded-full"
                  >
                    {user?.user_metadata?.avatar_url ? (
                      <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ border: "1.5px solid rgba(212,175,55,0.5)" }}
                      />
                    ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#0A2F23] text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #F0DFA0, #D4AF37)" }}
                    >
                      {initials}
                      </div>
                    )}
                    <ChevronDown size={14} className="am-white" />
                  </button>
                  {profileOpen && (
                    <div className="am-mobile-panel absolute right-0 mt-2 w-48 bg-[#181818] border border-white/10 rounded-lg shadow-lg py-2 text-sm">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-white hover:bg-white/10">My Profile</Link>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-white hover:bg-white/10">Order History</Link>
                      <Link to="/reservations" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-white hover:bg-white/10">Reservations</Link>
                      <div className="my-1 border-t border-white/10" />
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-[#E8846A] hover:bg-white/10">Log out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="am-icon-btn flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium am-white rounded-md">
                  <User size={17} />
                  Login
                </Link>
              )}

              <Link
                to="/reservations"
                className="am-cta ml-1 px-5 py-2 text-[#0A0A0A] text-sm font-semibold rounded-md"
              >
                Reserve a table
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="am-icon-btn md:hidden p-2 am-white rounded-md"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Signature: gold arch-motif divider */}
        <ArchDivider />

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="am-mobile-panel md:hidden bg-[#0A0A0A] border-t border-white/10 px-4 pb-6 pt-2">
            <form
              className="am-mobile-search mt-3"
              onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}
            >
              <Search size={18} className="am-white shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes... (Enter)"
                className="am-search-input"
              />
            </form>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 am-glow-text text-sm font-medium border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between mt-4">
              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-1.5 text-sm text-[#E8846A]"
                >
                  <User size={17} /> Log out
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-sm am-white">
                  <User size={17} /> Login
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Link to="/favorites" onClick={() => setMobileOpen(false)} className="relative p-2">
                  <Heart size={20} className="am-white" />
                  {favorites.length > 0 && (
                    <span className="am-cart-badge absolute -top-0.5 -right-0.5 bg-[#96283A] text-[#F5E9C8] text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Link>
                <Link id="am-navbar-cart-btn-mobile" to="/cart" onClick={() => setMobileOpen(false)} className="relative p-2">
                  <ShoppingCart size={20} className="am-white" />
                  {cartCount > 0 && (
                    <span className="am-cart-badge absolute -top-0.5 -right-0.5 bg-[#96283A] text-[#F5E9C8] text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            <Link
              to="/reservations"
              className="am-cta block text-center mt-4 px-5 py-2.5 text-[#0A0A0A] text-sm font-semibold rounded-md"
            >
              Reserve a table
            </Link>
          </div>
        )}
      </nav>

      {/* Spacer so page content doesn't sit under the fixed navbar */}
      <div style={{ height: "82px" }} />
    </div>
  );
}

// Small arch-shaped mark evoking mosque architecture — used as the logo icon
// Same shape as before — no new element added. The arch + base outline itself
// now draws progressively like a loader, then holds, then resets and repeats.
// The center dot grows from 0 to full size in sync.
function ArchLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="relative">
      {/* Arch + base combined into one closed outline so it can draw as a loader */}
      <path
        d="M6 32 V19 C6 11.8 11.8 6 19 6 C26.2 6 32 11.8 32 19 V32 H6 Z"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="100"
        style={{ animation: "ringDraw 122s ease-in-out infinite" }}
      />

      {/* Animated growing center dot */}
      <circle
        cx="19"
        cy="17"
        r="3.2"
        stroke="#D4AF37"
        strokeWidth="1.4"
        style={{
          transformOrigin: "19px 17px",
          animation: "dotGrow 122s ease-in-out infinite",
        }}
      />
    </svg>
  );
}

// Repeating geometric arch pattern — thin signature divider under the navbar
function ArchDivider() {
  return (
    <div className="w-full h-2 overflow-hidden opacity-90" style={{ background: "linear-gradient(90deg, #D4AF37, #F0DFA0, #D4AF37)" }}>
      <svg width="100%" height="8" preserveAspectRatio="none">
        <pattern id="archPattern" width="24" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8 Q12 -4 24 8" fill="#0A2F23" />
        </pattern>
        <rect width="100%" height="8" fill="url(#archPattern)" />
      </svg>
    </div>
  );
}