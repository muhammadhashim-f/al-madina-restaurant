import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
} from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Footer
// Matches Navbar theme: black gradient background, gold accents,
// white text, Amiri display font for headings, arch-motif divider.
// ============================================================

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Reservations", href: "#reservations" },
  { label: "About Us", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "#privacy" },
  { label: "Terms of service", href: "#terms" },
  { label: "Refund policy", href: "#refund" },
];

const HOURS = [
  { day: "Monday - Thursday", time: "12:00 PM - 11:00 PM" },
  { day: "Friday - Saturday", time: "12:00 PM - 1:00 AM" },
  { day: "Sunday", time: "1:00 PM - 11:00 PM" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-footer {
          background: linear-gradient(180deg, #0A0A0A 0%, #141414 100%);
        }
        .am-footer-heading {
          font-family: 'Amiri', serif;
          color: #F0DFA0;
          text-shadow: 0 0 6px rgba(212,175,55,0.35);
        }
        .am-footer-link {
          color: rgba(255,255,255,0.75);
          transition: color 0.25s ease, padding-left 0.25s ease;
          display: inline-block;
        }
        .am-footer-link:hover {
          color: #D4AF37;
          padding-left: 4px;
        }
        .am-social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F0DFA0;
          transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .am-social-icon:hover {
          background: #D4AF37;
          color: #0A0A0A;
          border-color: #D4AF37;
          transform: translateY(-2px);
        }
        .am-newsletter-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.35);
          color: #FFFFFF;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px 0 0 8px;
          outline: none;
          flex: 1;
          min-width: 0;
        }
        .am-newsletter-input::placeholder {
          color: rgba(255,255,255,0.45);
        }
        .am-newsletter-btn {
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          border: none;
          padding: 0 16px;
          border-radius: 0 8px 8px 0;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: filter 0.2s ease;
        }
        .am-newsletter-btn:hover {
          filter: brightness(1.08);
        }
        .am-contact-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          line-height: 1.5;
        }
        .am-owner-badge {
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 10px;
          padding: 14px 16px;
        }
      `}</style>

      <div className="am-footer w-full">
        {/* Signature arch divider on top of footer, matching navbar */}
        <ArchDivider />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand + about */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArchLogo />
                <span
                  className="text-xl"
                  style={{ fontFamily: "'Amiri', serif", color: "#FFFFFF" }}
                >
                  Al Madina
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Authentic flavors, warm hospitality. Serving Karachi with
                traditional recipes and a modern dining experience since day one.
              </p>
              <div className="flex gap-3 mt-5">
                <a href="#" aria-label="Facebook" className="am-social-icon">
                  <FacebookIcon size={16} />
                </a>
                <a href="#" aria-label="Instagram" className="am-social-icon">
                  <InstagramIcon size={16} />
                </a>
                <a href="#" aria-label="Twitter" className="am-social-icon">
                  <TwitterIcon size={16} />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="am-footer-heading text-lg mb-4">Quick links</h4>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="am-footer-link text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

{/* Opening hours */}
<div>
  <h4 className="am-footer-heading text-lg mb-4">Opening hours</h4>
  <ul className="space-y-3">
    <li className="am-contact-row">
      <Clock size={15} className="mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
      <div>
        <p className="text-white text-sm font-medium">Every Day </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline", }}>
          Start 12PM to 12AM.
        </p>
      </div>
    </li>
  </ul>
</div>


            {/* Contact + newsletter */}
            <div>
              <h4 className="am-footer-heading text-lg mb-4">Get in touch</h4>
              <div className="space-y-3 mb-5">
                <div className="am-contact-row">
                  <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
                  <span>2 1/2 korangi, Sector 36 B Korangi, Karachi, Pakistan</span>
                </div>
                <div className="am-contact-row">
                  <Phone size={15} className="mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
                  <span>+92 307 0769139</span>
                </div>
                <div className="am-contact-row">
                  <Mail size={15} className="mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
                  <span>almadinarestaurant@gmail.com</span>
                </div>
              </div>

              <p className="text-sm font-medium text-white mb-2">Newsletter</p>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="am-newsletter-input"
                  required
                />
                <button type="submit" className="am-newsletter-btn">
                  <Send size={14} />
                  Join
                </button>
              </form>
              {subscribed && (
                <p className="text-xs mt-2" style={{ color: "#D4AF37" }}>
                  Subscribed. Watch your inbox for offers.
                </p>
              )}
            </div>
          </div>

          {/* Owner contact strip */}
          <div className="am-owner-badge mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Business inquiries and site owner contact</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                For partnerships, catering, or feedback about this website
              </p>
            </div>
            <a
              href="mailto:owner@almadinarestaurant.pk"
              className="text-sm font-medium"
              style={{ color: "#D4AF37" }}
            >
              almadinarestaurant@gmail.com
            </a>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              &copy; {new Date().getFullYear()} Al Madina Restaurant. All rights reserved.
            </p>
            <div className="flex gap-5">
              {LEGAL_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="am-footer-link text-xs">
                  {link.label}
                </a>
              ))}
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Powered by Al Madina Digital
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Custom inline social icons (lucide-react no longer ships brand/logo icons)
function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.21 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.21 22 17.08 22 12.06Z" />
    </svg>
  );
}
function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TwitterIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 3H21.6L15.7 9.8L22.6 21H17.1L12.8 14.9L7.9 21H5.2L11.5 13.7L4.9 3H10.5L14.3 8.6L18.9 3ZM17.9 19.3H19.4L9.6 4.6H8L17.9 19.3Z" />
    </svg>
  );
}

// Same arch mark used in the navbar, kept static here (no loader animation in footer)
function ArchLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 38 38" fill="none">
      <path
        d="M6 32 V19 C6 11.8 11.8 6 19 6 C26.2 6 32 11.8 32 19 V32 H6 Z"
        stroke="#D4AF37"
        strokeWidth="2"
      />
      <circle cx="19" cy="17" r="3.2" stroke="#D4AF37" strokeWidth="1.4" />
    </svg>
  );
}

// Same signature gold arch-motif divider used under the navbar
function ArchDivider() {
  return (
    <div className="w-full h-2 overflow-hidden opacity-90" style={{ background: "linear-gradient(90deg, #D4AF37, #F0DFA0, #D4AF37)" }}>
      <svg width="100%" height="8" preserveAspectRatio="none">
        <pattern id="archPatternFooter" width="24" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0 Q12 12 24 0" fill="#0A0A0A" />
        </pattern>
        <rect width="100%" height="8" fill="url(#archPatternFooter)" />
      </svg>
    </div>
  );
}