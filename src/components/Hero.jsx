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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <p className="am-hero-eyebrow text-xs font-medium uppercase mb-4">
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
              whether you dine in or order for delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#menu"
                className="am-btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-semibold"
              >
                <UtensilsCrossed size={18} />
                Order now
              </a>
              <Link
                to="/reservations"
                className="am-btn-outline inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-semibold"
              >
                <CalendarCheck size={18} />
                Reserve a table
              </Link>
            </div>
          </div>
          <img src="../Images/Hero/Hero.jpg" alt="Restaurant" />
        </div>
      </div>
    </section>
  );
}