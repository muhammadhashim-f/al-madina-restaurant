import React, { useState, useEffect } from "react";
import { Tag, Timer, ShoppingCart, Ban } from "lucide-react";
import { useCart } from "../context/CartContext";
import { flyToCart } from "../utils/flyToCart";

// ============================================================
// AL MADINA RESTAURANT — Discounts & Limited-Time Offers Section
// Matches theme: black background, gold accents, white text.
// Active offers show a live countdown + working "Add to cart".
// Expired offers stay visible but are grayed out with an
// "Offer expired" label and a disabled button (demo of both states).
// Replace OFFER_ITEMS with real promo dishes and end dates.
// ============================================================

const OFFER_ITEMS = [
  { id: 101, name: "Family Feast Platter", discount: 20, price: 2400, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() + 1000 * 60 * 60 * 5 },
  { id: 102, name: "Weekend Biryani Special", discount: 20, price: 850, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() + 1000 * 60 * 60 * 26 },
  { id: 103, name: "Grilled Combo for Two", discount: 20, price: 1600, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() + 1000 * 60 * 45 },
  { id: 104, name: "Mutton Karahi Deal", discount: 15, price: 1450, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() + 1000 * 60 * 60 * 10 },
  { id: 105, name: "Dal Makhani Combo", discount: 20, price: 700, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() + 1000 * 60 * 60 * 3 },
  { id: 106, name: "Chai & Dessert Duo", discount: 25, price: 400, image: "https://images.unsplash.com/photo-1666190092208-b704f65a7cd4?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() - 1000 * 60 * 60 * 2 }, // already expired
  { id: 107, name: "Lunch Hour Samosa Pack", discount: 20, price: 500, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() - 1000 * 60 * 30 }, // already expired
  { id: 108, name: "Fresh Lime Soda Combo", discount: 15, price: 300, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=600&auto=format&fit=crop", endsAt: Date.now() + 1000 * 60 * 60 * 48 },
];

function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(endsAt - Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(endsAt - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function OfferCard({ item }) {
  const { addToCart } = useCart();
  const countdown = useCountdown(item.endsAt);
  const isExpired = !countdown;
  const discountedPrice = Math.round(item.price * (1 - item.discount / 100));

  const handleAdd = (e) => {
    if (isExpired) return;
    flyToCart(item.image, e.currentTarget);
    addToCart({ id: item.id, name: item.name, price: discountedPrice, image: item.image });
  };

  return (
    <div className={`am-offer-card ${isExpired ? "expired" : ""}`}>
      <div className="relative">
        <img src={item.image} alt={item.name} />
        <span className="am-offer-badge">
          <Tag size={11} /> {item.discount}% OFF
        </span>
        {isExpired && <div className="am-expired-overlay">Offer expired</div>}
      </div>
      <div className="p-4">
        <h3 className="text-white text-[15px] font-medium mb-2">{item.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm line-through" style={{ color: "rgba(255,255,255,0.4)" }}>Rs {item.price}</span>
          <span className="text-white font-semibold">Rs {discountedPrice}</span>
        </div>

        {isExpired ? (
          <div className="am-countdown expired">
            <Ban size={13} />
            <span>Offer expired</span>
          </div>
        ) : (
          <div className="am-countdown">
            <Timer size={13} style={{ color: "#D4AF37" }} />
            <span>
              {String(countdown.hours).padStart(2, "0")}h{" "}
              {String(countdown.minutes).padStart(2, "0")}m{" "}
              {String(countdown.seconds).padStart(2, "0")}s left
            </span>
          </div>
        )}

        <button onClick={handleAdd} disabled={isExpired} className="am-offer-add-btn mt-3">
          <ShoppingCart size={13} />
          {isExpired ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

export default function Offers() {
  return (
    <section
      id="offers"
      className="w-full"
      style={{ background: "linear-gradient(180deg, #101010 0%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-offers-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-offer-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .am-offer-card:hover { transform: translateY(-4px); border-color: rgba(212,175,55,0.55); }
        .am-offer-card.expired { opacity: 0.55; }
        .am-offer-card.expired:hover { transform: none; }
        .am-offer-card img { width: 100%; height: 170px; object-fit: cover; }
        .am-offer-card.expired img { filter: grayscale(0.8); }
        .am-offer-badge {
          position: absolute; top: 10px; left: 10px;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A; font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 20px;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .am-expired-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-size: 13px; font-weight: 600; letter-spacing: 0.05em;
        }
        .am-countdown {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; color: #F0DFA0;
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 5px 10px; border-radius: 20px;
        }
        .am-countdown.expired {
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.15);
        }
        .am-offer-add-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          border: 1px solid rgba(212,175,55,0.5);
          color: #D4AF37;
          font-size: 12px; font-weight: 500;
          padding: 8px; border-radius: 8px;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .am-offer-add-btn:hover:not(:disabled) { background: #D4AF37; color: #0A0A0A; }
        .am-offer-add-btn:disabled {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.35);
          cursor: not-allowed;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#D4AF37", letterSpacing: "0.3em" }}>
            Limited time
          </p>
          <h2 className="am-offers-heading text-3xl sm:text-4xl font-bold">
            Today's specials, while they last
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFER_ITEMS.map((item) => (
            <OfferCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}