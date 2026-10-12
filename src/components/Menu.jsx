import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Flame, Leaf, ShoppingCart, Heart, Crown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useVIPLoader } from "../context/LoadingContext";
import { flyToCart } from "../utils/flyToCart";
import { CATEGORIES, MENU_ITEMS } from "../data/menuData";

// ============================================================
// AL MADINA RESTAURANT — Royal VIP Menu & Signature Collection
// - Every dish features mouth-watering VIP descriptions with ingredients & aroma notes.
// - Dedicated VIP Products Showcase section with 3D perspective cards.
// - Polished hospitality headers replacing raw section names.
// ============================================================

export default function Menu() {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { triggerLoader } = useVIPLoader();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery) setQuery(urlQuery);
  }, [searchParams]);

  const vipItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => item.isVIP);
  }, []);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "All"
          ? true
          : activeCategory === "👑 VIP Selection"
          ? item.isVIP
          : item.category === activeCategory;
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <section
      id="menu"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #101010 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-menu-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-menu-search {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.35);
          color: #FFFFFF;
        }
        .am-menu-search::placeholder { color: rgba(255,255,255,0.45); }
        .am-tab {
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.25s ease;
        }
        .am-tab:hover {
          border-color: #D4AF37;
          color: #FFFFFF;
        }
        .am-tab.active {
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          border-color: transparent;
          font-weight: 600;
        }
        .am-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.22);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .am-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(212,175,55,0.65);
          box-shadow: 0 16px 36px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.2);
        }
        .am-card img {
          width: 100%;
          height: 185px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .am-card:hover img { transform: scale(1.06); }
        .am-vip-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 3px 9px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(212,175,55,0.4);
          z-index: 10;
        }
        .am-fav-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(10,10,10,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          z-index: 10;
        }
        .am-fav-btn:hover { transform: scale(1.15); }
        .am-add-btn {
          background: transparent;
          border: 1.5px solid rgba(212,175,55,0.6);
          color: #D4AF37;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .am-add-btn:hover {
          background: #D4AF37;
          color: #0A0A0A;
          box-shadow: 0 6px 18px rgba(212,175,55,0.35);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 perspective-container">
        {/* Section Header: Replaced plain section name with appealing hospitality message */}
        <div className="text-center mb-12 reveal-3d-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-4 glow-3d">
            ✨ Dawat-e-Khas — Shahi Karachi Zaiqon Ka Markaz
          </span>
          <h2 className="am-menu-heading text-3xl sm:text-5xl font-bold mb-3">
            Crafted with Tradition, Served with Royal Love
          </h2>
          <p className="text-sm text-white/60 max-w-xl mx-auto">
            Har plate mein sadiyon purani Mughlai riwayat, taaza desi bakray ka gosht, asli desi ghee aur dum pukht zaiqon ka be-misaal sangam.
          </p>
        </div>

        {/* Dedicated VIP Products Section */}
        {activeCategory === "All" && !query && (
          <div className="mb-16 p-6 sm:p-8 bg-gradient-to-r from-black/85 via-[#16140D] to-black/85 border-2 border-[#D4AF37]/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(212,175,55,0.18)] relative overflow-hidden reveal-3d-up">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">
                  <Crown size={15} /> Exclusive VIP Signature Dishes
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Amiri', serif" }}>
                  Shahi Royal VIP Collection
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Hand-crafted by Head Chef Salman Aziz using vintage dum-pukht handi recipes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory("👑 VIP Selection")}
                className="px-4 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs text-[#F0DFA0] hover:bg-[#D4AF37] hover:text-black font-bold transition-all self-start sm:self-auto"
              >
                View all VIP dishes →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vipItems.slice(0, 3).map((item) => (
                <div
                  key={`vip-${item.id}`}
                  className="bg-black/75 border border-[#D4AF37]/45 rounded-2xl overflow-hidden card-3d p-4 flex flex-col justify-between hover:border-[#D4AF37] transition-all"
                >
                  <div>
                    <div className="relative rounded-xl overflow-hidden mb-3">
                      <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                      <span className="am-vip-badge">
                        <Crown size={12} /> VIP SIGNATURE
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-white text-base font-bold">{item.name}</h4>
                      <span className="text-[#D4AF37] font-bold text-sm">Rs {item.price}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      flyToCart(item.image, e.currentTarget);
                      triggerLoader(
                        "👑 Shahi Cart Update",
                        `"${item.name}" dastarkhwan cart mein darj kiya ja raha hai...`,
                        1200,
                        () => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })
                      );
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md"
                  >
                    <ShoppingCart size={14} /> Add VIP Dish to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative reveal-3d-up">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.5)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by dish name, handi, karahi, spices..."
            className="am-menu-search w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`am-tab px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium ${
                activeCategory === cat ? "active" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {filteredItems.length === 0 ? (
          <p className="text-center py-16" style={{ color: "rgba(255,255,255,0.5)" }}>
            No dishes match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-container">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`am-card card-3d relative flex flex-col justify-between ${index % 2 === 0 ? "reveal-left" : "reveal-right"}`}
              >
                <div>
                  <div className="relative">
                    <img src={item.image} alt={item.name} />
                    {item.isVIP && (
                      <span className="am-vip-badge">
                        <Crown size={11} /> VIP
                      </span>
                    )}
                    {item.discount > 0 && !item.isVIP && (
                      <span className="absolute top-2.5 left-2.5 bg-[#D4AF37] text-black text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {item.discount}% OFF
                      </span>
                    )}
                    <button
                      onClick={() => {
                        triggerLoader(
                          "💖 VIP Favorites",
                          `"${item.name}" aapki pasandeeda list mein update ho raha hai...`,
                          1100,
                          () => toggleFavorite({ id: item.id, name: item.name, price: item.price, image: item.image })
                        );
                      }}
                      className="am-fav-btn"
                      aria-label="Toggle favorite"
                    >
                      <Heart size={15} fill={isFavorite(item.id) ? "#E8846A" : "none"} color={isFavorite(item.id) ? "#E8846A" : "#FFFFFF"} />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-white text-[15px] font-bold leading-snug">{item.name}</h3>
                      <span className={item.isVeg ? "w-2 h-2 rounded-full bg-emerald-500 mt-1.5" : "w-2 h-2 rounded-full bg-red-500 mt-1.5"} />
                    </div>

                    <p className="text-xs mb-3 leading-relaxed text-white/70 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      {item.spicy && (
                        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "#E27D60" }}>
                          <Flame size={12} /> Spicy
                        </span>
                      )}
                      {item.isVeg && (
                        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "#4CAF50" }}>
                          <Leaf size={12} /> Veg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      {item.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs line-through text-white/40">Rs {item.price}</span>
                          <span className="text-white font-bold text-sm">
                            Rs {Math.round(item.price * (1 - item.discount / 100))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white font-bold text-sm">Rs {item.price}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        const finalPrice =
                          item.discount > 0
                            ? Math.round(item.price * (1 - item.discount / 100))
                            : item.price;
                        flyToCart(item.image, e.currentTarget);
                        triggerLoader(
                          "🛒 Shahi Cart Update",
                          `"${item.name}" shahi cart mein shamil kiya ja raha hai...`,
                          1200,
                          () => addToCart({ id: item.id, name: item.name, price: finalPrice, image: item.image })
                        );
                      }}
                      className="am-add-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs"
                    >
                      <ShoppingCart size={13} />
                      Add
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
