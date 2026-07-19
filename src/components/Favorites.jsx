import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

// ============================================================
// AL MADINA RESTAURANT — Favorites (Wishlist) Page
// Reads live data from FavoritesContext (hearted in the Menu).
// Matches theme: black background, gold accents, white text.
// ============================================================

export default function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  return (
    <section
      className="w-full min-h-screen px-4 py-16"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-fav-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-fav-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .am-fav-card:hover { transform: translateY(-4px); border-color: rgba(212,175,55,0.4); }
        .am-fav-card img { width: 100%; height: 170px; object-fit: cover; }
        .am-fav-heart-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(10,10,10,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8846A;
        }
        .am-fav-add-btn {
          border: 1px solid rgba(212,175,55,0.5);
          color: #D4AF37;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .am-fav-add-btn:hover { background: #D4AF37; color: #0A0A0A; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <Link to="/#menu" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
          <ArrowLeft size={15} /> Continue browsing menu
        </Link>

        <h1 className="am-fav-heading text-3xl font-bold mb-8">Your favorites</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={40} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            <p style={{ color: "rgba(255,255,255,0.55)" }}>No favorites saved yet.</p>
            <Link to="/#menu" className="inline-block mt-4 text-sm font-medium" style={{ color: "#D4AF37" }}>
              Browse the menu →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <div key={item.id} className="am-fav-card relative">
                <img src={item.image} alt={item.name} />
                <button className="am-fav-heart-btn" onClick={() => toggleFavorite(item)} aria-label="Remove from favorites">
                  <Heart size={15} fill="#E8846A" />
                </button>
                <div className="p-4">
                  <h3 className="text-white text-[15px] font-medium mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Rs {item.price}</span>
                    <button className="am-fav-add-btn" onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}>
                      <ShoppingCart size={12} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}