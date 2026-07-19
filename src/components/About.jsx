import React from "react";
import { ChefHat, Wheat, Heart } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — About Us Section
// Matches theme: black background, gold accents, white text.
// Replace the story text, chef name/photo, and values as needed.
// ============================================================

const VALUES = [
  {
    icon: Wheat,
    title: "Fresh ingredients",
    text: "Sourced daily from trusted local markets, never frozen.",
  },
  {
    icon: ChefHat,
    title: "Traditional recipes",
    text: "Passed down through generations, cooked the slow way.",
  },
  {
    icon: Heart,
    title: "Made with care",
    text: "Every plate is prepared like it's for our own family.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #121212 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-about-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-about-frame {
          position: relative;
        }
        .am-about-frame img {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(212,175,55,0.3);
        }
        .am-chef-badge {
          position: absolute;
          bottom: -20px;
          left: 20px;
          background: #0A0A0A;
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .am-value-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .am-value-card:hover {
          border-color: rgba(212,175,55,0.4);
          transform: translateY(-3px);
        }
        .am-value-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(212,175,55,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Image with chef badge */}
          <div className="am-about-frame mb-6 lg:mb-0">
            <img
              src="../Images/Gallery/Chef.avif"
              alt="Al Madina Restaurant kitchen"
            />
            <div className="am-chef-badge">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #D4AF37, #F0DFA0)", color: "#0A0A0A" }}
              >
                CS
              </div>
              <div>
                <p className="text-white text-sm font-medium">Chef Salman Aziz</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Head Chef, 18 yrs experience</p>
              </div>
            </div>
          </div>

          {/* Story */}
          <div>
            <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
              Our story
            </p>
            <h2 className="am-about-heading text-3xl sm:text-4xl font-bold mb-6">
              A family kitchen, grown into Karachi's table
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.72)" }}>
              Al Madina started as a small family kitchen, cooking the recipes
              our grandmothers taught us. Today, we still cook the same way —
              slow, patient, and without shortcuts — because that's what
              turns a simple meal into a memory.
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              Every spice blend, every marinade, every karahi is made fresh
              in-house daily. We believe good food starts with good
              ingredients and ends with people leaving the table happier
              than when they arrived.
            </p>
          </div>
        </div>

        {/* Values row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="am-value-card">
              <div className="am-value-icon mb-4">
                <v.icon size={19} />
              </div>
              <h3 className="text-white text-[15px] font-medium mb-1.5">{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}