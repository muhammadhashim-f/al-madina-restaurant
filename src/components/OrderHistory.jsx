import React from "react";
import { Link } from "react-router-dom";
import { Package, Truck, Store, ArrowLeft } from "lucide-react";
import { useOrders } from "../context/OrdersContext";

// ============================================================
// AL MADINA RESTAURANT — Order History Page
// Reads live data from OrdersContext (populated at Checkout).
// Matches theme: black background, gold accents, white text.
// ============================================================

export default function OrderHistory() {
  const { orders } = useOrders();

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
        .am-oh-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-order-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px;
        }
        .am-status-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(76,175,80,0.15);
          color: #4CAF50;
          border: 1px solid rgba(76,175,80,0.4);
        }
        .am-reorder-btn {
          border: 1px solid rgba(212,175,55,0.5);
          color: #D4AF37;
          font-size: 12px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 8px;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .am-reorder-btn:hover { background: #D4AF37; color: #0A0A0A; }
      `}</style>

      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <ArrowLeft size={15} /> Back to home
        </Link>
        <h1 className="am-oh-heading text-3xl font-bold mb-8">Order history</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={40} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            <p style={{ color: "rgba(255,255,255,0.55)" }}>You haven't placed any orders yet.</p>
            <Link to="/#menu" className="inline-block mt-4 text-sm font-medium" style={{ color: "#D4AF37" }}>
              Browse the menu →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order.id} className="am-order-card">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-white text-sm font-medium">Order #{order.id}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {new Date(order.placedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="am-status-pill">{order.status}</span>
                </div>

                <div className="space-y-1.5 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <span>{item.quantity}× {item.name}</span>
                      <span>Rs {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {order.fulfillment === "delivery" ? <Truck size={13} /> : <Store size={13} />}
                    {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
                  </div>
                  <span className="text-white font-semibold text-sm">Rs {order.total}</span>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  {order.fulfillment === "delivery" && order.status !== "Delivered" && (
                    <Link to={`/track/${order.id}`} className="am-reorder-btn">
                      Track order
                    </Link>
                  )}
                  <button className="am-reorder-btn">Reorder</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}