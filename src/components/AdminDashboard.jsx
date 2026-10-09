import React from "react";
import { Navigate, Link } from "react-router-dom";
import { DollarSign, ShoppingBag, CalendarCheck, Star, LogOut, MessageSquare, Bike, Check, Eye } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { useReviews } from "../context/ReviewsContext";

// ============================================================
// AL MADINA RESTAURANT — Admin Dashboard
// Owner panel: View all incoming orders, chat with customer
// on WhatsApp, and control live delivery tracking dispatch.
// ============================================================

function isAdminLoggedIn() {
  return sessionStorage.getItem("am_admin_session") === "true";
}

export default function AdminDashboard() {
  const { orders, updateOrderStatus } = useOrders();
  const { reviews, averageRating } = useReviews();

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const todayStr = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.placedAt).toDateString() === todayStr);
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);

  const handleLogout = () => {
    sessionStorage.removeItem("am_admin_session");
    window.location.href = "/admin/login";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "awaiting_approval":
        return { label: "Awaiting WhatsApp Confirmation", bg: "bg-amber-500/15 text-amber-400 border-amber-500/40" };
      case "preparing":
        return { label: "Kitchen Preparing", bg: "bg-blue-500/15 text-blue-400 border-blue-500/40" };
      case "out_for_delivery":
        return { label: "Out for Delivery (Bike Live)", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse" };
      case "delivered":
        return { label: "Delivered", bg: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
      default:
        return { label: status || "Confirmed", bg: "bg-amber-500/15 text-amber-400 border-amber-500/40" };
    }
  };

  const STATS = [
    { label: "Today's orders", value: todaysOrders.length, icon: ShoppingBag },
    { label: "Today's revenue", value: `Rs ${todaysRevenue}`, icon: DollarSign },
    { label: "Active Orders", value: orders.filter(o => o.status !== "delivered").length, icon: CalendarCheck },
    { label: "Avg. rating", value: `${averageRating} ★ (${reviews.length})`, icon: Star },
  ];

  return (
    <section
      className="w-full min-h-screen px-4 py-10"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Amiri', serif" }}>
              Owner Admin Dashboard
            </h1>
            <p className="text-sm text-white/50">Al Madina Restaurant · Live Order Dispatch Center</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/40 px-3.5 py-2 rounded-lg transition-all"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3">
                <s.icon size={20} />
              </div>
              <p className="text-white text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-white/55 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Live Orders Management */}
        <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h2 className="text-white text-xl font-semibold">Orders & Delivery Control</h2>
              <p className="text-xs text-white/50">WhatsApp pe baat hone ke baad rider ko dispatch karein taake client live bike track kar sake.</p>
            </div>
            <span className="text-xs bg-[#D4AF37]/15 text-[#F0DFA0] border border-[#D4AF37]/30 px-3 py-1 rounded-full font-medium">
              {orders.length} Total Orders
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm py-8 text-center text-white/50">No orders placed yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const badge = getStatusBadge(o.status);
                const phoneClean = o.customer?.phone?.replace(/\D/g, "") || "";
                const waCustomerUrl = phoneClean
                  ? `https://wa.me/${phoneClean.startsWith("0") ? "92" + phoneClean.slice(1) : phoneClean}?text=${encodeURIComponent(`Assalam-o-Alaikum ${o.customer?.name || ""}! Al Madina Restaurant se aapke Order #${o.id} ke hawale se rabta kar rahe hain.`)}`
                  : null;

                return (
                  <div
                    key={o.id}
                    className="bg-black/40 border border-white/10 hover:border-[#D4AF37]/40 rounded-xl p-5 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-bold text-base">#{o.id}</span>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(o.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-white/70">
                          Customer: <span className="text-white font-medium">{o.customer?.name || "N/A"}</span> · Phone: <span className="text-[#D4AF37]">{o.customer?.phone || "N/A"}</span>
                        </p>
                        {o.customer?.address && (
                          <p className="text-xs text-white/55 mt-0.5">
                            📍 {o.customer.address}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-white">Rs {o.total}</span>
                        {waCustomerUrl && (
                          <a
                            href={waCustomerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-black font-semibold px-3 py-1.5 rounded-lg transition-all"
                          >
                            <MessageSquare size={14} />
                            WhatsApp Client
                          </a>
                        )}
                        <Link
                          to={`/track/${o.id}`}
                          className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Eye size={14} />
                          View Map
                        </Link>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="mb-4">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {(o.items || []).map((it, idx) => (
                          <span key={idx} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/80">
                            {it.quantity}× {it.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Owner Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                      <span className="text-xs text-white/50 mr-1 font-medium">Owner Controls:</span>

                      {o.status === "awaiting_approval" && (
                        <button
                          onClick={() => updateOrderStatus(o.id, "preparing")}
                          className="inline-flex items-center gap-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-md font-medium transition-all"
                        >
                          <Check size={13} />
                          Confirm Order & Start Kitchen
                        </button>
                      )}

                      {o.status !== "out_for_delivery" && o.status !== "delivered" && (
                        <button
                          onClick={() => updateOrderStatus(o.id, "out_for_delivery")}
                          className="inline-flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3.5 py-1.5 rounded-md transition-all shadow-md"
                        >
                          <Bike size={14} />
                          Dispatch Rider (Start GPS Bike Tracking)
                        </button>
                      )}

                      {o.status === "out_for_delivery" && (
                        <button
                          onClick={() => updateOrderStatus(o.id, "delivered")}
                          className="inline-flex items-center gap-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-md font-medium transition-all"
                        >
                          <Check size={13} />
                          Mark as Delivered
                        </button>
                      )}

                      {o.status === "delivered" && (
                        <span className="text-xs text-emerald-400 font-medium">
                          ✓ Delivery Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}