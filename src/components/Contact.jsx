import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Contact Section
// Matches theme: black background, gold accents, white text.
// Form is UI-only for now — wiring to a real submit endpoint
// (e.g. a Supabase table or email service) comes later.
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
          filter: grayscale(0.3) contrast(1.05);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
            Contact
          </p>
          <h2 className="am-contact-heading text-3xl sm:text-4xl font-bold">
            We'd love to hear from you
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: info + map */}
          <div>
            <div className="space-y-4 mb-8">
              <div className="am-contact-info-card">
                <span className="am-contact-icon"><MapPin size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Address</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    25, 2 1/2 korangi, 2 1/2 korangi, Sector 33 B Korangi, Karachi, Pakistan
                  </p>
                </div>
              </div>
              <div className="am-contact-info-card">
                <span className="am-contact-icon"><Phone size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Phone</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>+92 307 0769139</p>
                </div>
              </div>
              <div className="am-contact-info-card">
                <span className="am-contact-icon"><Mail size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Email</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>almadinarestaurant@gmail.com</p>
                </div>
              </div>
              <div className="am-contact-info-card">
                <span className="am-contact-icon"><Clock size={18} /></span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Hours</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Every Day. Start from 12PM to 12AM 
                  </p>
                </div>
              </div>
            </div>

            <div className="am-map-frame">
              <iframe
                title="Al Madina Restaurant location"
                src="<iframe 
                src="https://maps.app.goo.gl/2fLad7o6LhvHxoye9"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: contact form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>Your name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. M. Hakim"
                className="am-input"
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="HKCoder@gmail.com"
                className="am-input"
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
                rows={5}
                className="am-input resize-none"
                required
              />
            </div>
            <button type="submit" className="am-submit-btn w-full py-3 rounded-md text-sm inline-flex items-center justify-center gap-2">
              <Send size={16} />
              Send message
            </button>
            {sent && (
              <p className="text-sm text-center" style={{ color: "#D4AF37" }}>
                Thanks — your message has been noted.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}