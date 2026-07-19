import React, { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { DollarSign, ShoppingBag, CalendarCheck, Star, LogOut } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { useReviews } from "../context/ReviewsContext";

// ============================================================
// AL MADINA RESTAURANT — Admin Dashboard
// Protected route: redirects to /admin/login if no admin session.
// Pulls live numbers from OrdersContext + ReviewsContext.
// Reservation count is a placeholder until reservations are
// stored in a shared context/database (currently they only show
// a confirmation screen and aren't persisted anywhere yet).
// ============================================================

function isAdminLoggedIn() {
  return sessionStorage.getItem("am_admin_session") === "true";
}

export default function AdminDashboard() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const { orders } = useOrders();
  const { reviews, averageRating } = useReviews();

  const todayStr = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.placedAt).toDateString() === todayStr);
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);

  const handleLogout = () => {
    sessionStorage.removeItem("am_admin_session");
    window.location.href = "/admin/login";
  };

  const STATS = [
    { label: "Today's orders", value: todaysOrders.length, icon: ShoppingBag },
    { label: "Today's revenue", value: `Rs ${todaysRevenue}`, icon: DollarSign },
    { label: "Reservations (demo)", value: "—", icon: CalendarCheck },
    { label: "Avg. rating", value: `${averageRating} ★ (${reviews.length})`, icon: Star },
  ];

  return (
    <section
      className="w-full min-h-screen px-4 py-10"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <style>{`
        .am-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 14px;
          padding: 20px;
        }
        .am-stat-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(212,175,55,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #D4AF37;
          margin-bottom: 10px;
        }
        .am-order-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .am-logout-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
        }
        .am-logout-btn:hover { color: #E8846A; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Amiri', serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Al Madina Restaurant</p>
          </div>
          <button onClick={handleLogout} className="am-logout-btn">
            <LogOut size={15} /> Log out
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((s) => (
            <div key={s.label} className="am-stat-card">
              <div className="am-stat-icon"><s.icon size={18} /></div>
              <p className="text-white text-xl font-semibold">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="am-stat-card">
          <h2 className="text-white text-base font-medium mb-2">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm py-6" style={{ color: "rgba(255,255,255,0.5)" }}>No orders placed yet.</p>
          ) : (
            <div>
              {orders.slice(0, 8).map((o) => (
                <div key={o.id} className="am-order-row">
                  <div>
                    <p className="text-white text-sm">#{o.id}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {new Date(o.placedAt).toLocaleString()} · {o.fulfillment}
                    </p>
                  </div>
                  <span className="text-white text-sm font-medium">Rs {o.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          Menu management, reservation management, and user management panels come next.
        </p>
      </div>
    </section>
  );
}