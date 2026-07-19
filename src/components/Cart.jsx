import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Package } from "lucide-react";
import { useCart } from "../context/CartContext";

// ============================================================
// AL MADINA RESTAURANT — Cart Page
// Reads live data from CartContext (shared with Menu + Navbar).
// Matches theme: black background, gold accents, white text.
// ============================================================

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();

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
        .am-cart-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-cart-item {
          display: flex;
          gap: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px;
        }
        .am-cart-item img {
          width: 84px;
          height: 84px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .am-qty-stepper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 8px;
          padding: 4px 10px;
          width: fit-content;
        }
        .am-qty-btn {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: rgba(212,175,55,0.15);
          color: #D4AF37;
          font-size: 14px;
          font-weight: 600;
        }
        .am-remove-btn {
          color: rgba(255,255,255,0.4);
          transition: color 0.2s ease;
        }
        .am-remove-btn:hover { color: #E8846A; }
        .am-summary-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 14px;
          padding: 22px;
        }
        .am-checkout-btn {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 14px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <Link to="/#menu" className="inline-flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            <ArrowLeft size={15} /> Continue browsing menu
          </Link>
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm" style={{ color: "#D4AF37" }}>
            <Package size={15} /> Order history
          </Link>
        </div>

        <h1 className="am-cart-heading text-3xl font-bold mb-8">Your cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={40} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            <p style={{ color: "rgba(255,255,255,0.55)" }}>Your cart is empty.</p>
            <Link to="/#menu" className="inline-block mt-4 text-sm font-medium" style={{ color: "#D4AF37" }}>
              Browse the menu →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="am-cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white text-sm font-medium">{item.name}</h3>
                      <button className="am-remove-btn" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="am-qty-stepper">
                        <button className="am-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                        <button className="am-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <span className="text-white font-semibold text-sm">
                        Rs {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="am-summary-card h-fit">
              <h3 className="text-white text-base font-medium mb-4">Order summary</h3>
              <div className="flex justify-between text-sm mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span>Subtotal</span>
                <span>Rs {cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-white font-semibold pt-3 border-t border-white/10">
                <span>Total</span>
                <span>Rs {cartTotal}</span>
              </div>
              <Link to="/checkout" className="am-checkout-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                Proceed to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}