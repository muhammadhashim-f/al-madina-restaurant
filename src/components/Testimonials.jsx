import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Testimonials Section (Home page)
// Matches theme: black background, gold accents, white text.
// Simple carousel — one review at a time, prev/next + dots.
// Replace TESTIMONIALS with real customer reviews later.
// ============================================================

const TESTIMONIALS = [
  {
    id: 1,
    name: "Ayesha Raza",
    role: "Regular guest",
    rating: 5,
    quote:
      "The mutton karahi tastes exactly like a home-cooked family recipe. Service is warm and the ambiance never feels rushed.",
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    role: "Food blogger",
    rating: 5,
    quote:
      "Al Madina has quietly become my go-to for biryani. Consistent quality every single time, and the delivery is always on schedule.",
  },
  {
    id: 3,
    name: "Sana Malik",
    role: "First-time visitor",
    rating: 4,
    quote:
      "Booked a table for a family dinner and everyone left happy. The staff went out of their way to accommodate a last-minute request.",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const current = TESTIMONIALS[index];

  return (
    <section
      className="w-full"
      style={{ background: "linear-gradient(180deg, #101010 0%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-testi-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-testi-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 18px;
          transition: opacity 0.35s ease;
        }
        .am-testi-quote-icon { color: rgba(212,175,55,0.3); }
        .am-testi-nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.4);
          color: #D4AF37;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .am-testi-nav-btn:hover {
          background: #D4AF37;
          color: #0A0A0A;
        }
        .am-testi-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transition: background 0.25s ease, transform 0.25s ease;
          cursor: pointer;
        }
        .am-testi-dot.active {
          background: #D4AF37;
          transform: scale(1.3);
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
          Guest reviews
        </p>
        <h2 className="am-testi-heading text-3xl sm:text-4xl font-bold mb-12">
          What our guests say
        </h2>

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button className="am-testi-nav-btn shrink-0" onClick={prev} aria-label="Previous review">
            <ChevronLeft size={18} />
          </button>

          <div key={current.id} className="am-testi-card p-8 sm:p-10 flex-1">
            <Quote size={32} className="am-testi-quote-icon mx-auto mb-5" />
            <p
              className="text-base sm:text-lg leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Amiri', serif" }}
            >
              "{current.quote}"
            </p>
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  fill={i < current.rating ? "#D4AF37" : "none"}
                  stroke={i < current.rating ? "#D4AF37" : "rgba(255,255,255,0.3)"}
                />
              ))}
            </div>
            <p className="text-white text-sm font-medium">{current.name}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{current.role}</p>
          </div>

          <button className="am-testi-nav-btn shrink-0" onClick={next} aria-label="Next review">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((t, i) => (
            <span
              key={t.id}
              className={`am-testi-dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}