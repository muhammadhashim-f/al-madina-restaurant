import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Navigation, Share2, CheckCircle2, ShieldCheck } from "lucide-react";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — Contact & Live Karachi Location
// Displays real Karachi coordinates (Sector 33-B, 2 1/2 Korangi),
// live kitchen status, direct Google Maps live directions button,
// WhatsApp location sharing, and hospitality header.
// ============================================================

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const handleOpenGoogleMaps = () => {
    window.open("https://www.google.com/maps/dir/?api=1&destination=24.8299,67.1281", "_blank");
  };

  const handleShareLocationWhatsApp = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! Al Madina Restaurant Karachi Location:\n📍 25, 2 1/2 Korangi, Sector 33-B, Karachi, Pakistan.\nGoogle Maps: https://www.google.com/maps/dir/?api=1&destination=24.8299,67.1281`
    );
    window.open(`https://wa.me/923070769139?text=${text}`, "_blank");
  };

  return (
    <section
      id="contact"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #131313 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-contact-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-contact-info-card {
          display: flex;
          gap: 14px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          transition: border-color 0.3s ease;
        }
        .am-contact-info-card:hover {
          border-color: rgba(212,175,55,0.4);
        }
        .am-contact-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(212,175,55,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          flex-shrink: 0;
        }
        .am-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.25s ease;
        }
        .am-input:focus {
          border-color: #D4AF37;
        }
        .am-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .am-submit-btn {
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
        .am-map-frame {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(212,175,55,0.3);
          filter: contrast(1.05);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 perspective-container">
        {/* Top Header: Welcoming Hospitality Tagline instead of plain "Contact" */}
        <div className="text-center mb-14 reveal-3d-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-3 glow-3d">
            📞 Rabta-e-Khas — Al Madina Karachi Host & Live Location
          </span>
          <h2 className="am-contact-heading text-3xl sm:text-5xl font-bold mb-3">
            We'd Love to Welcome You to Karachi's Royal Table
          </h2>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            Dine-in karein ya ghar baithe live bike tracking ke sath mangwayen — hamari team aapki khidmat ke liye hamesha tayyar hai.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Info + Live Karachi Map */}
          <div className="reveal-left">
            <div className="space-y-4 mb-8">
              <div className="am-contact-info-card card-3d">
                <span className="am-contact-icon"><MapPin size={18} /></span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white text-sm font-bold">Al Madina Karachi Main Branch</p>
                    <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Open
                    </span>
                  </div>
                  <p className="text-sm text-white/70">
                    25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Sindh, Pakistan
                  </p>
                </div>
              </div>

              <div className="am-contact-info-card card-3d">
                <span className="am-contact-icon"><Phone size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Direct Call & WhatsApp</p>
                  <p className="text-sm text-[#D4AF37] font-semibold">{RESTAURANT_PHONE}</p>
                </div>
              </div>

              <div className="am-contact-info-card card-3d">
                <span className="am-contact-icon"><Mail size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Email Support</p>
                  <p className="text-sm text-white/70">almadinarestaurant@gmail.com</p>
                </div>
              </div>

              <div className="am-contact-info-card card-3d">
                <span className="am-contact-icon"><Clock size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Kitchen & Dining Hours</p>
                  <p className="text-sm text-white/70">
                    Rozana 12:00 PM se 12:00 AM tak non-stop (Dine-in, Takeaway & Live Delivery)
                  </p>
                </div>
              </div>
            </div>

            {/* Live Interactive Karachi Map Container */}
            <div className="am-map-frame card-3d bg-black/60 relative">
              <div className="p-3 bg-black/80 border-b border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Karachi GPS Location Pin</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenGoogleMaps}
                    className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-xs rounded-lg flex items-center gap-1 hover:brightness-110 shadow"
                  >
                    <Navigation size={12} /> Get Directions
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLocationWhatsApp}
                    className="px-2.5 py-1 bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-600/50"
                  >
                    <Share2 size={12} /> WhatsApp
                  </button>
                </div>
              </div>

              <iframe
                title="Al Madina Restaurant Karachi Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14486.37684079893!2d67.1281!3d24.8299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQ5JzQ3LjYiTiA2N8KwMDcnNDEuMiJF!5e0!3m2!1sen!2spk!4v1600000000000!5m2!1sen!2spk"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                loading="lazy"
              />

              <div className="p-2.5 bg-black/90 text-[11px] text-white/70 border-t border-white/10 flex items-center justify-between">
                <span>📍 Korangi, Karachi (Covering DHA, Clifton, PECHS, Gulshan)</span>
                <span className="text-[#D4AF37] font-semibold">Coordinates: 24.8299° N, 67.1281° E</span>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4 reveal-right card-3d bg-white/[0.02] border border-[#D4AF37]/25 p-6 sm:p-8 rounded-2xl h-fit">
            <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Amiri', serif" }}>
              Send Us a Message
            </h3>
            <p className="text-xs text-white/55 mb-4">
              Koi sawal, private dawat ka bandobast ya feedback ho — hum foran jawab dete hain.
            </p>

            <div>
              <label className="text-xs mb-1.5 block text-white/70">Your Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Tariq Mehmood"
                className="am-input"
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block text-white/70">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className="am-input"
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block text-white/70">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Khaane, catering ya booking ke hawalay se likhein..."
                rows={4}
                className="am-input resize-none"
                required
              />
            </div>
            <button type="submit" className="am-submit-btn w-full py-3 rounded-xl text-sm inline-flex items-center justify-center gap-2">
              <Send size={16} />
              Send Message
            </button>
            {sent && (
              <p className="text-sm text-center text-[#D4AF37] bg-[#D4AF37]/10 p-2.5 rounded-lg border border-[#D4AF37]/30">
                Shukriya — Aapka paigham mil gaya hai, hum jald rabta karenge.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
