import React, { useEffect } from "react";
import { X, ShieldCheck, FileText, RotateCcw, Lock, CheckCircle2, Phone, Mail } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Policy & Legal Modal
// Covers: Privacy Policy, Terms of Service, Refund Policy,
// Security Policy, and Halal Dining Rules.
// ============================================================

export const POLICIES = {
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    urduTitle: "رازداری کی پالیسی (Customer Data Protection)",
    icon: ShieldCheck,
    badge: "100% Secure & Confidential",
    sections: [
      {
        heading: "1. Kaunsa Data Jamah Hota Hai? (Information We Collect)",
        content:
          "Jab aap Al Madina Restaurant par order dete hain ya account banate hain, hum sirf zaroori maloomat lete hain: Aapka Naam, Phone Number, Delivery Address, aur Email. Hum kabhi bhi aapke credit/debit card ke sensitive pins ya passwords save nahi karte.",
      },
      {
        heading: "2. Data Kahan Aur Kyun Istemaal Hota Hai?",
        content:
          "Yeh maloomat sirf aapke khane ki taaza tayyari, Rider ke zariye live delivery, aur WhatsApp pe order confirmation ke liye istemaal hoti hai. Hum kisi bhi 3rd-party marketing company ya advertisers ko aapka number ya data nahi bechte.",
      },
      {
        heading: "3. Supabase Database Security",
        content:
          "Tamam customer records Supabase ke encrypted cloud database mein Row-Level Security (RLS) ke zariye mehfooz hain. Sirf aap apne profile ka data access kar sakte hain.",
      },
      {
        heading: "4. Data Delete Karne Ka Haq",
        content:
          "Aap jab chahein apne Profile section mein jaa kar ya hamari helpline (+92 307 0769139) par rabta kar ke apna data ya chat history mukammal delete karwa sakte hain.",
      },
    ],
  },
  terms: {
    id: "terms",
    title: "Terms of Service",
    urduTitle: "شرائط و ضوابط (Order & Dining Terms)",
    icon: FileText,
    badge: "Fair & Transparent",
    sections: [
      {
        heading: "1. Order Timing & Delivery",
        content:
          "Al Madina Restaurant rozana dopahar 12:00 PM se raat 12:00 AM tak active rehta hai. Delivery ka dorania aam tor par 30 se 45 minute hota hai (traffic aur mausam ke mutabiq tabdeel ho sakta hai).",
      },
      {
        heading: "2. Payment Methods & Rates",
        content:
          "Tamam dishes ke rates Pakistani Rupees (PKR) mein hain aur menu par wazeh hain. Hum Cash on Delivery (COD), JazzCash, EasyPaisa aur Online Bank Transfer qubool karte hain.",
      },
      {
        heading: "3. Order Cancellation Policy",
        content:
          "Order dene ke baad 5 minutes ke andar aap WhatsApp ya call par rabta kar ke baghair kisi charge ke order cancel karwa sakte hain. Ek bar kitchen mein handi/karahi dum par lagne ke baad cancellation mumkin nahi hogi.",
      },
      {
        heading: "4. Dine-in & Table Booking Etiquette",
        content:
          "Family cabins aur Shahi Dastarkhwan par baithne ke liye pur-sukoon mahol banaye rakhna zaroori hai taakay tamam mehmanon ka ahtaram barqarar rahe.",
      },
    ],
  },
  refund: {
    id: "refund",
    title: "Refund & Replacement Policy",
    urduTitle: "ریفنڈ اور تبدیلی کی پالیسی (100% Taste Guarantee)",
    icon: RotateCcw,
    badge: "100% Satisfaction Guarantee",
    sections: [
      {
        heading: "1. 100% Shahi Quality Guarantee",
        content:
          "Agar aapka khana theek nahi pohncha, thanda tha, ya order mein koi ghalati hui, toh hum foran doosra taaza khana baghair kisi izafi charge ke rider ke hath bhejte hain, ya mukammal raqam refund karte hain.",
      },
      {
        heading: "2. Missing Item Claim",
        content:
          "Agar bag mein se koi naan, raita, salad ya drink reh gaya ho, hamara rider foran 15-20 minute mein missing item aapki dahleez par pohncha dega, ya utni raqam aapko foran refund kar di jayegi.",
      },
      {
        heading: "3. Refund Processing Time",
        content:
          "Cash on delivery ka refund hamara rider foran cash ya JazzCash/EasyPaisa ke zariye 1-2 ghante mein ada kar deta hai. Card refunds 1-3 business days mein bank account mein wapis aa jate hain.",
      },
      {
        heading: "4. Helpline for Immediate Claims",
        content:
          "Kisi bhi shikayat ke liye rider ke jane ke foran baad 0307-0769139 par call ya WhatsApp karein, hamari support team foran hal nikale gi.",
      },
    ],
  },
  security: {
    id: "security",
    title: "Security Policy",
    urduTitle: "سیکیورٹی پالیسی (Bank-Grade Digital Protection)",
    icon: Lock,
    badge: "Bank-Grade Encryption",
    sections: [
      {
        heading: "1. End-to-End SSL/TLS Encryption",
        content:
          "Al Madina Restaurant website 256-bit SSL encryption ke zariye mehfooz hai. Browser se server tak jane wala har order, review aur chat message encrypted protocol par muntaqil hota hai.",
      },
      {
        heading: "2. Password Security & Hashing",
        content:
          "Aapka password kabhi bhi plain text mein save nahi hota. Supabase Auth ke zariye industry-standard cryptographic bcrypt salt hashing istemaal hoti hai.",
      },
      {
        heading: "3. Mobile Phone Verification",
        content:
          "Fake orders aur unauthorized account access ko rokne ke liye customer ke verified phone number ka nizam banaya gaya hai.",
      },
      {
        heading: "4. Admin Access Controls",
        content:
          "Sirf tasdeeq shuda Restaurant Owner aur Manager ke paas secure session-based Admin Dashboard ka ikhtiyar hota hai.",
      },
    ],
  },
  halal: {
    id: "halal",
    title: "Halal Dining Rules & Shariat Pledge",
    urduTitle: "حلال ڈائننگ کے اصول اور شرعی عہد (100% Zabihah Halal)",
    icon: CheckCircle2,
    badge: "100% Zabihah Halal Certified",
    sections: [
      {
        heading: "1. 100% Zabihah Halal Gosht (Mandi Bakra & Pure Poultry)",
        content:
          "Al Madina Restaurant ka shahi bakra aur chicken rozana subah Karachi ki qanuni mandi se zinda khareed kar sharai usoolon ke mutabiq dasti zabah kiya jata hai. Machine se kata hua ya frozen imported gosht qatai istemaal nahi hota.",
      },
      {
        heading: "2. Khalis Desi Ghee & Organic Masale",
        content:
          "Tamam karahiyan khalis desi ghee aur certified cooking oil mein tayyar hoti hain. Kisi qisam ke sharai tor par mashkook ajza, haram stabilizers, ya contaminated chemicals ka istemaal sakhti se mamnoo hai.",
      },
      {
        heading: "3. Mukammal Nasha-Aawar Ashya Par Pabandi",
        content:
          "Restaurant ki hadood aur kitchen mein kisi qisam ki sharab, nasha-aawar cheezein ya gher-sharai sar-garmiyan sakhti se mana hain.",
      },
      {
        heading: "4. Sunnah Hygiene & Family Dastarkhwan",
        content:
          "Kitchen staff ke liye paaki (Taharah) aur safai Sunnah ke mutabiq laazmi hai. Parivarik (Family) izzat aur parda-daar mahol ke liye alag Shahi Cabins dastiyab hain.",
      },
    ],
  },
};

export default function PolicyModal({ type = "privacy", onClose, onSelectType }) {
  const current = POLICIES[type] || POLICIES.privacy;
  const IconComponent = current.icon;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-[#D4AF37]/40 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Bar */}
        <div className="w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#F0DFA0] to-[#D4AF37]" />

        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <IconComponent size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Amiri', serif" }}>
                  {current.title}
                </h2>
                <span className="text-[10px] bg-[#D4AF37]/15 text-[#F0DFA0] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full font-medium">
                  {current.badge}
                </span>
              </div>
              <p className="text-xs text-[#D4AF37]/80 mt-0.5">{current.urduTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shrink-0"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Policy Tab Switcher */}
        <div className="px-5 pt-3 pb-2 flex gap-1.5 overflow-x-auto border-b border-white/5 no-scrollbar bg-black/30">
          {Object.values(POLICIES).map((p) => {
            const isActive = p.id === current.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectType && onSelectType(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {p.title}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-white/80 leading-relaxed max-h-[60vh]">
          {current.sections.map((sec, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h3 className="text-sm font-bold text-[#F0DFA0] mb-2">{sec.heading}</h3>
              <p className="text-white/70">{sec.content}</p>
            </div>
          ))}

          {/* Official Restaurant Seal */}
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold text-white">Al Madina Restaurant Karachi</p>
              <p className="text-[11px] text-white/50">25, 2 1/2 Korangi, Sector 36-B, Karachi · Est. 2018</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#D4AF37]">
              <span className="flex items-center gap-1">
                <Phone size={13} /> 0307-0769139
              </span>
              <span className="flex items-center gap-1">
                <Mail size={13} /> info@almadina.pk
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <p className="text-[11px] text-white/40">Zabita-e-Akhlaaq & Certified Culinary Trust</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] hover:bg-[#F0DFA0] text-black transition-all"
          >
            Samajh Gaya / Close
          </button>
        </div>
      </div>
    </div>
  );
}
