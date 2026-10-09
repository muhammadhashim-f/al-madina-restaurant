import React, { useState } from "react";
import { X } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Gallery Section
// Matches theme: black background, gold accents, white text.
// Click any photo to open a lightbox preview.
// Replace GALLERY_IMAGES with real food/ambience photos.
// ============================================================

const GALLERY_IMAGES = [
  { id: 1, src: "/Images/Gallery/Signature grilled platter.jpg", alt: "Signature grilled platter" },
  { id: 2, src: "/Images/Gallery/Restaurant dining area.webp", alt: "Restaurant dining area" },
  { id: 3, src: "/Images/Gallery/Chicken biryani.webp", alt: "Chicken biryani" },
  { id: 4, src: "/Images/Gallery/Table setting.webp", alt: "Table setting" },
  { id: 5, src: "/Images/Gallery/Mutton karahi.webp", alt: "Mutton karahi" },
];

export default function Gallery() {
  const [selected, setSelected] = useState(null);

  return (
    <section
      id="gallery"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-gallery-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .am-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease, filter 0.5s ease;
        }
        .am-gallery-item:hover img {
          transform: scale(1.08);
          filter: brightness(0.75);
        }
        .am-gallery-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 14px;
          opacity: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%);
          transition: opacity 0.3s ease;
        }
        .am-gallery-item:hover .am-gallery-overlay {
          opacity: 1;
        }
        .am-lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: am-fade-in 0.25s ease;
        }
        @keyframes am-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .am-lightbox-img {
          max-width: 90vw;
          max-height: 85vh;
          border-radius: 10px;
          border: 1px solid rgba(212,175,55,0.4);
        }
        .am-lightbox-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          transition: background 0.25s ease;
        }
        .am-lightbox-close:hover {
          background: #D4AF37;
          color: #0A0A0A;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 perspective-container">
        <div className="text-center mb-12 reveal-3d-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-3 glow-3d">
            📸 Shahi Mehmaan Nawazi & Karachi Dawat Ki Jhalak
          </span>
          <h2 className="am-gallery-heading text-3xl sm:text-4xl font-bold">
            A Glimpse Inside Al Madina's Dining Hall
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={img.id}
              className={`am-gallery-item card-3d ${i % 2 === 0 ? "reveal-left" : "reveal-right"}`}
              style={{ aspectRatio: i % 3 === 0 ? "4/5" : "4/4" }}
              onClick={() => setSelected(img)}
            >
              <img src={img.src} alt={img.alt} />
              <div className="am-gallery-overlay">
                <p className="text-white text-xs font-medium">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="am-lightbox-backdrop" onClick={() => setSelected(null)}>
          <button className="am-lightbox-close" onClick={() => setSelected(null)} aria-label="Close">
            <X size={20} />
          </button>
          <img src={selected.src} alt={selected.alt} className="am-lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}