import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, Store, ArrowLeft, CalendarCheck, Clock, Users, Phone, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { useReservations } from "../context/ReservationsContext";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — Order History & Table Bookings Page
// Displays Food Orders AND Table Booking History with full details & statuses.
// ============================================================

export default function OrderHistory() {
  const { orders } = useOrders();
  const { reservations } = useReservations();
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "reservations"

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
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="am-oh-heading text-3xl font-bold">Activity & History</h1>
            <p className="text-xs text-white/50 mt-1">Aapke pichle shahi orders aur table reservations ka mukammal record.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#D4AF37] text-black shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Package size={14} /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "reservations"
                  ? "bg-[#D4AF37] text-black shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <CalendarCheck size={14} /> Table Bookings ({reservations.length})
            </button>
          </div>
        </div>

        {/* TAB 1: FOOD ORDERS */}
        {activeTab === "orders" && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-2xl">
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
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                        order.status === "awaiting_approval" || order.status === "pending"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                          : order.status === "delivered"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                          : "bg-blue-500/15 text-blue-300 border-blue-500/40"
                      }`}>
                        {order.status === "awaiting_approval" || order.status === "pending"
                          ? "⏳ Awaiting Owner Approval"
                          : order.status}
                      </span>
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
                      {order.fulfillment === "delivery" && (
                        <Link to={`/track/${order.id}`} className="am-reorder-btn">
                          Live Bike Tracking
                        </Link>
                      )}
                      <Link to="/#menu" className="am-reorder-btn">
                        Reorder
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: TABLE BOOKINGS HISTORY */}
        {activeTab === "reservations" && (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-2xl">
                <CalendarCheck size={40} className="mx-auto mb-4 text-white/25" />
                <p className="text-white/55 text-sm">Aapne abhi tak koi table book nahi karwai.</p>
                <Link to="/reservations" className="inline-block mt-4 text-sm font-medium text-[#D4AF37]">
                  Shahi Table Reserve Karein →
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {reservations.map((res) => {
                  const waText = encodeURIComponent(
                    `Assalam o Alaikum! Mene Table Booking karwai thi (ID: ${res.id}). Meherbani farma kar status confirm karein.`
                  );
                  const waUrl = `https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}?text=${waText}`;

                  return (
                    <div key={res.id} className="am-order-card relative overflow-hidden">
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-bold">Booking #{res.id}</p>
                            <span className="text-[10px] text-white/40">
                              Booked on {new Date(res.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">
                            Mehmaan: {res.name} ({res.phone})
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${
                          res.status === "pending"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                            : res.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                            : "bg-red-500/15 text-red-300 border-red-500/40"
                        }`}>
                          {res.status === "pending" ? (
                            <>
                              <Clock size={11} className="animate-spin" /> ⏳ Pending Owner Approval
                            </>
                          ) : res.status === "confirmed" ? (
                            <>
                              <CheckCircle2 size={11} /> ✅ Confirmed / Table Booked
                            </>
                          ) : (
                            <>❌ Cancelled</>
                          )}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3 p-3 bg-black/40 border border-white/5 rounded-xl text-xs">
                        <div>
                          <span className="text-white/40 block text-[10px]">Tareeq (Date)</span>
                          <span className="text-white font-medium">{res.date}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">Waqt (Time)</span>
                          <span className="text-white font-medium">{res.time}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">Total Guests</span>
                          <span className="text-white font-medium">{res.guests} Afraad (VIP Seating)</span>
                        </div>
                      </div>

                      {res.notes && (
                        <p className="text-xs text-white/70 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5 mb-3">
                          Khas Hidayat: "{res.notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-2">
                        <span className="text-[11px] text-white/50">
                          {res.status === "pending"
                            ? "Intezar farmayein, restaurant owner jald tasdeeq karenge."
                            : "Aapki table Al Madina Restaurant mein mehfooz kar di gayi hai."}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-semibold transition-all"
                          >
                            <MessageSquare size={12} /> WhatsApp Owner OK
                          </a>
                          <Link
                            to="/reservations"
                            className="am-reorder-btn"
                          >
                            New Booking
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}