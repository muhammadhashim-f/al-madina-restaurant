import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Truck, Store, CreditCard, Wallet, CheckCircle2, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useAuth } from "../context/AuthContext";
import { geocodeAddress } from "../utils/geocode";

// ============================================================
// AL MADINA RESTAURANT — Checkout Page
// Matches theme: black background, gold accents, white text.
// Card payment is a UI placeholder — real Stripe checkout will
// replace the "Card" option once the backend is connected.
// Requires the user to be logged in before an order can be
// placed, and geocodes the delivery address to real coordinates
// so the tracking page can draw a real road route to it.
// ============================================================

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { isLoggedIn, user } = useAuth();

  const [fulfillment, setFulfillment] = useState("delivery"); // "delivery" | "pickup"
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "card"
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [placedOrder, setPlacedOrder] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const deliveryFee = fulfillment === "delivery" ? 150 : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name || !form.phone || (fulfillment === "delivery" && !form.address)) return;

    setPlaceError("");
    setPlacing(true);

    let deliveryLocation = null;
    if (fulfillment === "delivery") {
      try {
        const geo = await geocodeAddress(form.address);
        deliveryLocation = { lat: geo.lat, lng: geo.lng };
      } catch (err) {
        setPlacing(false);
        setPlaceError(err.message);
        return;
      }
    }

    const order = addOrder({
      items,
      fulfillment,
      paymentMethod,
      customer: form,
      total: grandTotal,
      deliveryLocation,
      userId: user.id,
    });
    clearCart();
    setPlacing(false);
    setPlacedOrder(order);
  };

  if (placedOrder) {
    return (
      <section
        className="w-full min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}
          >
            <CheckCircle2 size={26} style={{ color: "#D4AF37" }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Amiri', serif" }}>
            Order placed
          </h2>
          <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
            Order <span style={{ color: "#D4AF37" }}>#{placedOrder.id}</span> confirmed.
          </p>
          <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.65)" }}>
            {placedOrder.fulfillment === "delivery"
              ? "We'll deliver it to your address soon."
              : "It'll be ready for pickup shortly."}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/orders" className="am-co-btn px-6 py-2.5 rounded-md text-sm font-semibold">
              View order history
            </Link>
            <Link to="/#menu" className="am-co-btn-outline px-6 py-2.5 rounded-md text-sm font-semibold">
              Order more
            </Link>
          </div>
          <style>{`
            .am-co-btn { background: linear-gradient(135deg, #D4AF37, #F0DFA0); color: #0A0A0A; }
            .am-co-btn-outline { border: 1.5px solid rgba(212,175,55,0.5); color: #FFFFFF; }
          `}</style>
        </div>
      </section>
    );
  }

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
        .am-co-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-toggle-row { display: flex; gap: 12px; margin-bottom: 24px; }
        .am-toggle-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.25s ease;
        }
        .am-toggle-option.active {
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          border-color: transparent;
          font-weight: 600;
        }
        .am-co-label { font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block; }
        .am-co-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px;
          border-radius: 8px;
          outline: none;
        }
        .am-co-input:focus { border-color: #D4AF37; }
        .am-summary-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 14px;
          padding: 22px;
        }
        .am-place-btn {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 13px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 16px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-place-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(212,175,55,0.35); }
        .am-place-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <ArrowLeft size={15} /> Back to cart
        </Link>
        <h1 className="am-co-heading text-3xl font-bold mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ color: "rgba(255,255,255,0.55)" }}>Your cart is empty — nothing to check out yet.</p>
            <Link to="/#menu" className="inline-block mt-4 text-sm font-medium" style={{ color: "#D4AF37" }}>
              Browse the menu →
            </Link>
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}
            >
              <Lock size={22} style={{ color: "#D4AF37" }} />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Login required to order</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
              For order security and tracking, please log in or create an account before placing your order.
            </p>
            <Link to="/login" className="am-place-btn inline-block px-8">
              Log in / Sign up
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Fulfillment */}
              <div>
                <label className="am-co-label">How would you like your order?</label>
                <div className="am-toggle-row">
                  <button
                    type="button"
                    className={`am-toggle-option ${fulfillment === "delivery" ? "active" : ""}`}
                    onClick={() => setFulfillment("delivery")}
                  >
                    <Truck size={16} /> Delivery
                  </button>
                  <button
                    type="button"
                    className={`am-toggle-option ${fulfillment === "pickup" ? "active" : ""}`}
                    onClick={() => setFulfillment("pickup")}
                  >
                    <Store size={16} /> Pickup
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="am-co-label">Full name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="am-co-input" required />
                </div>
                <div>
                  <label className="am-co-label">Phone number</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="am-co-input" required />
                </div>
              </div>

              {fulfillment === "delivery" && (
                <div>
                  <label className="am-co-label">Delivery address</label>
                  <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="am-co-input resize-none" required />
                </div>
              )}

              {/* Payment method */}
              <div>
                <label className="am-co-label">Payment method</label>
                <div className="am-toggle-row">
                  <button
                    type="button"
                    className={`am-toggle-option ${paymentMethod === "cod" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <Wallet size={16} /> Cash on delivery
                  </button>
                  <button
                    type="button"
                    className={`am-toggle-option ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard size={16} /> Card (Stripe)
                  </button>
                </div>
                {paymentMethod === "card" && (
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Card payment will open a secure Stripe form once the payment backend is connected.
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="am-summary-card h-fit">
              <h3 className="text-white text-base font-medium mb-4">Order summary</h3>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span>{item.quantity}× {item.name}</span>
                    <span>Rs {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm mb-2 pt-3 border-t border-white/10" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span>Subtotal</span>
                <span>Rs {cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span>{fulfillment === "delivery" ? "Delivery fee" : "Pickup"}</span>
                <span>{fulfillment === "delivery" ? `Rs ${deliveryFee}` : "Free"}</span>
              </div>
              <div className="flex justify-between text-white font-semibold pt-3 border-t border-white/10">
                <span>Total</span>
                <span>Rs {grandTotal}</span>
              </div>
              <button type="submit" className="am-place-btn flex items-center justify-center gap-2" disabled={placing}>
                {placing && <Loader2 size={16} className="animate-spin" />}
                {placing ? "Placing order..." : "Place order"}
              </button>
              {placeError && (
                <p className="text-xs mt-3 text-center" style={{ color: "#E8846A" }}>{placeError}</p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}