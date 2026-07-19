import React, { useState } from "react";
import { X } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Gallery Section
// Matches theme: black background, gold accents, white text.
// Click any photo to open a lightbox preview.
// Replace GALLERY_IMAGES with real food/ambience photos.
// ============================================================

const GALLERY_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=700&auto=format&fit=crop", alt: "Signature grilled platter" },
  { id: 2, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=700&auto=format&fit=crop", alt: "Restaurant dining area" },
  { id: 3, src: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=700&auto=format&fit=crop", alt: "Chicken biryani" },
  { id: 4, src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=700&auto=format&fit=crop", alt: "Table setting" },
  { id: 5, src: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=700&auto=format&fit=crop", alt: "Mutton karahi" },
  { id: 6, src: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?q=80&w=700&auto=format&fit=crop", alt: "Restaurant interior" },
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
            Gallery
          </p>
          <h2 className="am-gallery-heading text-3xl sm:text-4xl font-bold">
            A glimpse inside Al Madina
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={img.id}
              className="am-gallery-item"
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