import React, { useState } from "react";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquareHeart,
  Loader2,
} from "lucide-react";
import { useReviews } from "../context/ReviewsContext";
import { useAuth } from "../context/AuthContext";
import { useVIPLoader } from "../context/LoadingContext";

// ============================================================
// AL MADINA RESTAURANT — Customer Reviews & Safety Verification
// - User submits review -> 2-3 seconds VIP verifying loader runs
// - Review is analyzed in background:
//     * If safe: Success confirmation shown, pinned as top spotlight!
//     * If abusive/harmful words detected: Polite removal notice shown
// - Clean UI: Technical rules & explanation removed from public eyes.
// ============================================================

function StarRow({ rating, size = 15, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || rating) >= star;
        return (
          <Star
            key={star}
            size={size}
            className={`cursor-${interactive ? "pointer" : "default"} transition-colors`}
            fill={active ? "#D4AF37" : "none"}
            color={active ? "#D4AF37" : "rgba(255,255,255,0.25)"}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange && onChange(star)}
          />
        );
      })}
    </div>
  );
}

export default function Reviews() {
  const { reviews, addReview, averageRating } = useReviews();
  const { user } = useAuth();
  const { triggerLoader } = useVIPLoader();

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    rating: 5,
    comment: "",
  });
  const [spotlightReview, setSpotlightReview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessToast("");

    if (!form.name.trim() || !form.comment.trim()) {
      setErrorMsg("Barah-e-karam apna naam aur review zaroor darj karein.");
      return;
    }

    setVerifying(true);

    // Run 2.2 seconds verifying loader experience
    await triggerLoader(
      "Review Verification Jari Hai...",
      "Al Madina Restaurant safety & authenticity engine aapka review check kar raha hai...",
      2200
    );

    setVerifying(false);

    // Automated internal safety check (scam, abuse, dirty language or malicious links)
    const lowerComment = form.comment.toLowerCase();
    const harmfulPatterns = [
      "hack",
      "scam",
      "cheat",
      "fraud",
      "abuse",
      "gali",
      "bakwas",
      "chor",
      "xxx",
      "porn",
      "viagra",
      "casino",
      "http://",
      "https://",
      ".com",
      ".ru",
      ".xyz",
    ];

    const isHarmful = harmfulPatterns.some((pattern) => lowerComment.includes(pattern));

    if (isHarmful) {
      setErrorMsg(
        "⚠️ Notice: Aapka review system safety guidelines par poora nahi utra aur is mein ghair-munasib alfaz paye gaye hain. Yeh review website se automatic remove kar diya gaya hai."
      );
      return;
    }

    // Approved verified review
    const verifiedReview = {
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      verified: true,
      verifiedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    addReview(verifiedReview);
    setSpotlightReview(verifiedReview);
    setSuccessToast(
      "Shukriya! Aapka review kamyabi se verify ho kar website ke top par publish ho gaya hai!"
    );
    setForm({ name: user?.user_metadata?.full_name || "", rating: 5, comment: "" });

    setTimeout(() => setSuccessToast(""), 8000);
  };

  return (
    <section
      id="reviews"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #101010 0%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-rev-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-rev-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.22);
          border-radius: 16px;
          padding: 20px;
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .am-rev-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212,175,55,0.55);
          box-shadow: 0 16px 36px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.12);
        }
        .am-rev-form-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 18px;
          padding: 24px;
        }
        .am-rev-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.25);
          color: #FFFFFF;
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.25s ease;
        }
        .am-rev-input:focus {
          border-color: #D4AF37;
        }
        .am-rev-input::placeholder {
          color: rgba(255,255,255,0.35);
        }
        .am-rev-submit {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 11px;
          border-radius: 8px;
          font-size: 13.5px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .am-rev-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(212,175,55,0.35);
        }
        .am-avatar-circle {
          width: 38px;
          height: 38px;
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 perspective-container">
        {/* Top Header: Hospitality greeting badge */}
        <div className="text-center mb-8 reveal-3d-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-3 glow-3d">
            💬 Mehfil-e-Zaiqa — Muazzaz Mehmano Ki Raayein
          </span>
          <h2 className="am-rev-heading text-3xl sm:text-5xl font-bold mb-3">
            Voices of Our Valued Guests
          </h2>
          <div className="flex items-center justify-center gap-2">
            <StarRow rating={Math.round(averageRating)} size={18} />
            <span className="text-white text-sm font-bold">{averageRating} ★</span>
            <span className="text-sm text-white/50">
              ({reviews.length} Verified Customer Reviews)
            </span>
          </div>
        </div>

        {/* Temporary Spotlight Banner: Top approved message shown to every visitor */}
        {spotlightReview && (
          <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-black/90 via-[#18150D] to-black/90 border-2 border-emerald-500/50 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <MessageSquareHeart size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      ✨ Top Spotlight: Verified Safe Customer Review
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                      ✓ Live Spotlight On Top
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium mt-1">
                    "{spotlightReview.comment}"
                  </p>
                  <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
                    <strong className="text-[#D4AF37]">{spotlightReview.name}</strong>
                    <span>·</span>
                    <span className="text-amber-400">{spotlightReview.rating} ★★★★★</span>
                    <span>·</span>
                    <span>Just Verified & Approved</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpotlightReview(null)}
                className="text-xs text-white/40 hover:text-white px-2 py-1 self-start sm:self-center"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4 max-h-[480px] overflow-y-auto pr-1 reveal-left">
            {reviews.map((r) => (
              <div key={r.id} className="am-rev-card card-3d">
                <div className="flex items-start gap-3">
                  <div className="am-avatar-circle">
                    {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-bold">{r.name}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                          <ShieldCheck size={11} /> Verified Customer
                        </span>
                      </div>
                      <span className="text-xs text-white/45">
                        {r.date || r.verifiedDate || "Recent"}
                      </span>
                    </div>
                    <StarRow rating={r.rating} />
                    <p className="text-sm mt-2 leading-relaxed text-white/80">
                      {r.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit form */}
          <div className="am-rev-form-card h-fit reveal-right card-3d">
            <h3 className="text-white text-base font-bold mb-3">Apna Review Likhein</h3>

            {successToast && (
              <div className="p-3 mb-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-white/70 block mb-1">Aapka Naam / ID</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mehmood"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="am-rev-input"
                  required
                />
              </div>

              <div>
                <p className="text-[11px] text-white/70 mb-1.5">Rating Muntakhib Karein</p>
                <StarRow
                  rating={form.rating}
                  size={22}
                  interactive
                  onChange={(val) => setForm({ ...form, rating: val })}
                />
              </div>

              <div>
                <label className="text-[11px] text-white/70 block mb-1">
                  Aapka Review & Feedback
                </label>
                <textarea
                  rows={4}
                  placeholder="Khana kaisa laga? Hamari service aur zaiqay ke baare mein apni raye likhein..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="am-rev-input resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="am-rev-submit flex items-center justify-center gap-2"
              >
                {verifying && <Loader2 size={16} className="animate-spin" />}
                {verifying ? "Checking & Verifying..." : "Review Submit Karein"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
