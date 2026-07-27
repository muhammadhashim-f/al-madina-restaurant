import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Flame, Leaf, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { flyToCart } from "../utils/flyToCart";



const CATEGORIES = ["All", "Starters", "Mains", "Desserts", "Drinks"];

const MENU_ITEMS = [
  {
    id: 1,
    name: "Chicken Seekh Kebab",
    category: "Starters",
    price: 650,
    isVeg: false,
    spicy: true,
    discount: 0,
    image: "../images/menu/Chicken Seekh Kebab.jpg",
    description: "Char-grilled minced chicken skewers with house spices.",
  },
  {
    id: 2,
    name: "Vegetable Samosa",
    category: "Starters",
    price: 250,
    isVeg: true,
    spicy: false,
    discount: 20,
    image: "../Images/menu/Vegetable Samosa.jpg",
    description: "Crisp pastry filled with spiced potatoes and peas.",
  },
  {
    id: 3,
    name: "Mutton Karahi",
    category: "Mains",
    price: 1450,
    isVeg: false,
    spicy: true,
    discount: 0,
    image: "../Images/menu/Mutton Karahi.jpg",
    description: "Slow-cooked mutton in a rich tomato and ginger gravy.",
  },
  {
    id: 4,
    name: "Chicken Biryani",
    category: "Mains",
    price: 850,
    isVeg: false,
    spicy: true,
    discount: 20,
    image: "../Images/menu/Chicken Biryani.jpg",
    description: "Fragrant basmati rice layered with spiced chicken.",
  },
  {
    id: 5,
    name: "Dal Makhani",
    category: "Mains",
    price: 600,
    isVeg: true,
    spicy: false,
    discount: 0,
    image: "../Images/menu/Dal-Makhani.jpg",
    description: "Black lentils simmered overnight with butter and cream.",
  },
  {
    id: 6,
    name: "Gulab Jamun",
    category: "Desserts",
    price: 300,
    isVeg: true,
    spicy: false,
    discount: 0,
    image: "../Images/menu/Gulab Jamun.jpg",
    description: "Warm milk dumplings soaked in cardamom syrup.",
  },
  {
    id: 7,
    name: "Kashmiri Chai",
    category: "Drinks",
    price: 200,
    isVeg: true,
    spicy: false,
    discount: 0,
    image: "../Images/menu/Kashmiri_Chai.png",
    description: "Pink tea with pistachio and rose petal garnish.",
  },
  {
    id: 8,
    name: "Fresh Lime Soda",
    category: "Drinks",
    price: 180,
    isVeg: true,
    spicy: false,
    discount: 0,
  {
    "../Images/menu/Fresh Lime Soda.jpg",
    "/Images/menu/chicken-seekh-kebab-2.jpg",
    "/Images/menu/chicken-seekh-kebab-3.jpg",
  },
    description: "Chilled soda with fresh lime, mint, and a hint of salt.",
  },
];

export default function Menu() {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery) setQuery(urlQuery);
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
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
        .am-menu-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-menu-search {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.35);
          color: #FFFFFF;
        }
        .am-menu-search::placeholder {
          color: rgba(255,255,255,0.45);
        }
        .am-tab {
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.25s ease;
        }
        .am-tab:hover {
          border-color: rgba(212,175,55,0.5);
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
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .am-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212,175,55,0.4);
        }
        .am-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .am-badge-veg {
          width: 16px;
          height: 16px;
          border: 1.5px solid #4CAF50;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .am-badge-veg .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4CAF50;
        }
        .am-badge-nonveg {
          width: 16px;
          height: 16px;
          border: 1.5px solid #C0392B;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .am-badge-nonveg .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #C0392B;
        }
        .am-fav-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(10,10,10,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .am-fav-btn:hover { transform: scale(1.1); }
        .am-discount-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #D4AF37;
          color: #0A0A0A;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
        }
        .am-add-btn {
          background: transparent;
          border: 1px solid rgba(212,175,55,0.5);
          color: #D4AF37;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .am-add-btn:hover {
          background: #D4AF37;
          color: #0A0A0A;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
            Our Menu
          </p>
          <h2 className="am-menu-heading text-3xl sm:text-4xl font-bold">
            Crafted with tradition, served with love
          </h2>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.5)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes..."
            className="am-menu-search w-full pl-11 pr-4 py-3 rounded-full text-sm outline-none"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`am-tab px-5 py-2 rounded-full text-sm ${activeCategory === cat ? "active" : ""}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="am-card relative">
                <div className="relative">
                  <img src={item.image} alt={item.name} />
                  {item.discount > 0 && (
                    <span className="am-discount-tag">{item.discount}% OFF</span>
                  )}
                  <button
                    onClick={() => toggleFavorite({ id: item.id, name: item.name, price: item.price, image: item.image })}
                    className="am-fav-btn"
                    aria-label="Toggle favorite"
                  >
                    <Heart size={15} fill={isFavorite(item.id) ? "#E8846A" : "none"} color={isFavorite(item.id) ? "#E8846A" : "#FFFFFF"} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-white text-[15px] font-medium leading-snug">{item.name}</h3>
                    <span className={item.isVeg ? "am-badge-veg" : "am-badge-nonveg"}>
                      <span className="dot" />
                    </span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
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
                  <div className="flex items-center justify-between">
                    <div>
                      {item.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Rs {item.price}
                          </span>
                          <span className="text-white font-semibold">
                            Rs {Math.round(item.price * (1 - item.discount / 100))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white font-semibold">Rs {item.price}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        const finalPrice =
                          item.discount > 0
                            ? Math.round(item.price * (1 - item.discount / 100))
                            : item.price;
                        flyToCart(item.image, e.currentTarget);
                        addToCart({ id: item.id, name: item.name, price: finalPrice, image: item.image });
                      }}
                      className="am-add-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
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