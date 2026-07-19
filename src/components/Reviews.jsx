import React, { useState } from "react";
import { Star } from "lucide-react";
import { useReviews } from "../context/ReviewsContext";

// ============================================================
// AL MADINA RESTAURANT — Reviews & Ratings Section
// Reads/writes via ReviewsContext (shared, persisted state).
// Matches theme: black background, gold accents, white text.
// ============================================================

function StarRow({ rating, size = 14, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          onClick={interactive ? () => onChange(n) : undefined}
          style={{ cursor: interactive ? "pointer" : "default" }}
          fill={n <= rating ? "#D4AF37" : "none"}
          color={n <= rating ? "#D4AF37" : "rgba(255,255,255,0.3)"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { reviews, addReview, averageRating } = useReviews();
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.rating || !form.comment) return;
    addReview(form);
    setForm({ name: "", rating: 0, comment: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section
      id="reviews"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #121212 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-rev-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-rev-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 18px;
        }
        .am-rev-form-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 14px;
          padding: 24px;
        }
        .am-rev-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          outline: none;
        }
        .am-rev-input:focus { border-color: #D4AF37; }
        .am-rev-submit {
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-rev-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(212,175,55,0.35); }
        .am-avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #0A0A0A;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          flex-shrink: 0;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-4">
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
            Reviews
          </p>
          <h2 className="am-rev-heading text-3xl sm:text-4xl font-bold mb-3">
            What our guests are saying
          </h2>
          <div className="flex items-center justify-center gap-2">
            <StarRow rating={Math.round(averageRating)} size={18} />
            <span className="text-white text-sm font-medium">{averageRating}</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              ({reviews.length} reviews)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div key={r.id} className="am-rev-card">
                <div className="flex items-start gap-3">
                  <div className="am-avatar-circle">
                    {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="text-white text-sm font-medium">{r.name}</p>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{r.date}</span>
                    </div>
                    <StarRow rating={r.rating} />
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {r.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit form */}
          <div className="am-rev-form-card h-fit">
            <h3 className="text-white text-base font-medium mb-4">Share your experience</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="am-rev-input"
              />
              <div>
                <p className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Your rating</p>
                <StarRow
                  rating={form.rating}
                  size={22}
                  interactive
                  onChange={(n) => setForm({ ...form, rating: n })}
                />
              </div>
              <textarea
                placeholder="Tell us about your visit..."
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="am-rev-input resize-none"
              />
              <button type="submit" className="am-rev-submit w-full">
                Submit review
              </button>
              {submitted && (
                <p className="text-xs text-center" style={{ color: "#D4AF37" }}>
                  Thanks for your feedback!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}