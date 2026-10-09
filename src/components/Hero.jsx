import React from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, CalendarCheck } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-hero-eyebrow {
          letter-spacing: 0.3em;
          color: #D4AF37;
        }
        .am-hero-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
          line-height: 1.15;
        }
        .am-hero-heading .accent {
          color: #D4AF37;
        }
        .am-btn-primary {
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
        .am-btn-outline {
          background: transparent;
          border: 1.5px solid rgba(212,175,55,0.55);
          color: #FFFFFF;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .am-btn-outline:hover {
          border-color: #D4AF37;
          background: rgba(212,175,55,0.08);
        }
        .am-hero-bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: radial-gradient(circle, #D4AF37 1.5px, transparent 1.5px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .am-arch-frame {
          position: relative;
        }
        .am-arch-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          clip-path: path('M0,420 V150 C0,67 67,0 150,0 H270 C353,0 420,67 420,150 V420 Z');
        }
        .am-arch-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(ellipse at center, rgba(212,175,55,0.25) 0%, transparent 70%);
          z-index: -1;
        }
      `}</style>

      <div className="am-hero-bg-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative perspective-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy with 3D reveal from left */}
          <div className="reveal-left">
            <p className="am-hero-eyebrow text-xs font-semibold uppercase mb-4 inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              Est. in the heart of Karachi
            </p>
            <h1 className="am-hero-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Where every dish <br />
              tells a <span className="accent">story</span>
            </h1>
            <p
              className="text-base sm:text-lg mb-9 max-w-md leading-relaxed"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Traditional recipes, slow-cooked spices, and warm hospitality —
              Al Madina brings the authentic taste of home to your table,
              whether you dine in or order for live bike delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#menu"
                className="am-btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold shadow-xl hover:scale-105 transition-transform"
              >
                <UtensilsCrossed size={18} />
                Order now
              </a>
              <Link
                to="/reservations"
                className="am-btn-outline inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
              >
                <CalendarCheck size={18} />
                Reserve a table
              </Link>
            </div>
          </div>

          {/* Right: 3D Image Showcase with reveal from right & floating badges */}
          <div className="relative reveal-right">
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/35 shadow-2xl card-3d">
              <img
                src="/Images/Hero/Hero.jpg"
                alt="Al Madina Restaurant"
                className="w-full h-[400px] lg:h-[480px] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Floating 3D Badge 1: Live Bike GPS */}
            <div className="absolute -bottom-6 -left-4 sm:left-4 z-20 bg-black/90 border border-[#D4AF37]/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-float-3d">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                🏍️
              </div>
              <div>
                <p className="text-white text-xs font-bold">Live Bike Tracking</p>
                <p className="text-[11px] text-white/50">OSRM Road GPS in Karachi</p>
              </div>
            </div>

            {/* Floating 3D Badge 2: Authentic Biryani */}
            <div className="absolute -top-4 -right-2 sm:right-6 z-20 bg-black/90 border border-[#D4AF37]/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-float-3d-reverse">
              <span className="text-xl">🍛</span>
              <div>
                <p className="text-white text-xs font-bold">100% Authentic</p>
                <p className="text-[10px] text-[#D4AF37]">Slow Cooked Spices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}