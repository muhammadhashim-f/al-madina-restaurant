import React, { useState, useEffect, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  CalendarCheck,
  LogOut,
  MessageSquare,
  Bike,
  Check,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Database,
  Bot,
  User,
  MessageCircle,
  Copy,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Star,
  Heart,
  ShoppingCart,
  Edit3,
  Plus,
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  List,
  Columns,
} from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { useReviews } from "../context/ReviewsContext";
import { useReservations } from "../context/ReservationsContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import {
  fetchCustomerChats,
  deleteChatSession,
  deleteChatMessage,
  clearAllCustomerChats,
  groupChatsBySession,
  saveChatMessage,
  SUPABASE_CHAT_TABLE_SQL,
} from "../lib/chatService";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Admin Dashboard
// Owner panel:
// 1. Orders & Live Dispatch (Orders, Status, Bike GPS, Delete)
// 2. Customer AI Chats (Supabase real-time sync & deletion)
// 3. Customer Reviews Moderation (View, Edit, Delete, Add Reviews)
// 4. Customer Profiles, Carts & Favorites (What dishes in cart & favorites)
// 5. Website Settings (Phone 03070769139, Email, Address, Delivery Fee, Banner)
// ============================================================

const DEFAULT_SETTINGS = {
  restaurantName: "Al Madina Restaurant",
  phone: "03070769139",
  email: "almadinarestaurant@gmail.com",
  address: "Near Bilal Chowk, Sector 36-B, Korangi, Karachi",
  deliveryFee: 150,
  minOrder: 500,
  openingHours: "12:00 PM – 12:00 AM (Daily)",
  announcement: "🌙 100% Desi Ghee Handi & Zabihah Halal Mutton. 30-45 Mins Live GPS Delivery in Karachi.",
};

export default function AdminDashboard() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { reviews, addReview, approveReview, updateReview, deleteReview, averageRating } = useReviews();
  const { reservations, updateReservationStatus, deleteReservation } = useReservations();
  const { items: globalCartItems } = useCart();
  const { favorites: globalFavorites } = useFavorites();

  const [adminAccess, setAdminAccess] = useState("checking");

  useEffect(() => {
    let active = true;
    const verifyAdmin = async () => {
      if (!isSupabaseConfigured) {
        if (active) setAdminAccess("denied");
        return;
      }
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          if (active) setAdminAccess("denied");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .single();
        if (active) setAdminAccess(!profileError && profile?.role === "admin" ? "allowed" : "denied");
      } catch {
        if (active) setAdminAccess("denied");
      }
    };
    verifyAdmin();
    return () => { active = false; };
  }, []);

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "chats" | "reviews" | "reservations" | "customers" | "settings"
  const [rawChats, setRawChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [chatSearch, setChatSearch] = useState("");
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [chatViewMode, setChatViewMode] = useState("split"); // "split" | "all_table"
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Review Moderation State
  const [reviewFilter, setReviewFilter] = useState("all"); // "all" | "pending" | "approved"
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");

  // Reservation Filter State
  const [reservationFilter, setReservationFilter] = useState("all"); // "all" | "pending" | "confirmed"

  // Customer Activity Search
  const [customerSearch, setCustomerSearch] = useState("");

  // Website Settings State
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("am_website_settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadChats = async () => {
    setChatsLoading(true);
    const { data } = await fetchCustomerChats();
    setRawChats(data || []);
    setChatsLoading(false);
  };

  useEffect(() => {
    if (adminAccess === "allowed") loadChats();
  }, [adminAccess]);

  const sessions = useMemo(() => groupChatsBySession(rawChats), [rawChats]);

  // Auto-select first session if none selected
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].sessionId);
    }
  }, [sessions, selectedSessionId]);

  const activeSession = sessions.find((s) => s.sessionId === selectedSessionId) || sessions[0];

  const filteredSessions = sessions.filter((s) => {
    const q = chatSearch.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      s.customerEmail.toLowerCase().includes(q) ||
      s.messages.some((m) => m.message.toLowerCase().includes(q))
    );
  });

  const filteredFlatMessages = useMemo(() => {
    const q = chatSearch.toLowerCase();
    return (rawChats || []).filter((m) => {
      if (!q) return true;
      return (
        (m.customer_name || "").toLowerCase().includes(q) ||
        (m.customer_email || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q) ||
        (m.sender || "").toLowerCase().includes(q)
      );
    });
  }, [rawChats, chatSearch]);

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setTimeout(() => {
      const el = document.getElementById("chat-transcript-view");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 60);
  };

  const handleCopyMessageText = (msgId, text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2200);
    } catch {}
  };

  const toggleCardAccordion = (sessionId, e) => {
    if (e) e.stopPropagation();
    setExpandedCardId((prev) => (prev === sessionId ? null : sessionId));
  };

  const handleDeleteSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    await deleteChatSession(sessionId);
    await loadChats();
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
    }
    setConfirmDeleteId(null);
  };

  const handleDeleteSingleMessage = async (msgId) => {
    await deleteChatMessage(msgId);
    await loadChats();
  };

  const handleClearAllChats = async () => {
    if (
      window.confirm(
        "Kiya aap waqai tamam customer chats delete karna chahte hain? Yeh Supabase aur database se hamesha ke liye delete ho jayengi."
      )
    ) {
      await clearAllCustomerChats();
      await loadChats();
      setSelectedSessionId(null);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_CHAT_TABLE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleAddSampleChat = async () => {
    const sampleSessionId = `sample_${Date.now()}`;
    await saveChatMessage({
      sessionId: sampleSessionId,
      customerName: "Ahmed Khan (Sample)",
      customerEmail: "ahmed.customer@gmail.com",
      userId: "usr_sample_123",
      sender: "customer",
      message: "Assalam-o-Alaikum bhai, Mutton Karahi ka rate kya hai aur delivery kitni der mein hogi?",
    });
    await saveChatMessage({
      sessionId: sampleSessionId,
      customerName: "Ahmed Khan (Sample)",
      customerEmail: "ahmed.customer@gmail.com",
      userId: "usr_sample_123",
      sender: "ai_host",
      message:
        "Wa Alaikum Assalam! Al Madina Restaurant ki Desi Mutton Karahi Rs 1,450 per KG hai (Pure Desi Ghee). Korangi aur Karachi mein delivery 30-45 minutes mein ho jati hai.",
      metadata: { dish: "Mutton Karahi", billTotal: 1450 },
    });
    await loadChats();
    setSelectedSessionId(sampleSessionId);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("am_admin_session");
    try { await supabase.auth.signOut(); } catch {}
    window.location.href = "/admin/login";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "awaiting_approval":
        return { label: "Awaiting WhatsApp Confirmation", bg: "bg-amber-500/15 text-amber-400 border-amber-500/40" };
      case "preparing":
        return { label: "Kitchen Preparing", bg: "bg-blue-500/15 text-blue-400 border-blue-500/40" };
      case "out_for_delivery":
        return {
          label: "Out for Delivery (Bike Live)",
          bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse",
        };
      case "delivered":
        return { label: "Delivered", bg: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
      default:
        return { label: status || "Confirmed", bg: "bg-amber-500/15 text-amber-400 border-amber-500/40" };
    }
  };

  const todaysOrders = orders.filter((o) => {
    try {
      return new Date(o.placedAt).toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  });
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Aggregated Customer Data (from orders, chats, and contexts)
  const aggregatedCustomers = useMemo(() => {
    const map = new Map();

    // 1. Ingest from Orders
    orders.forEach((o) => {
      const email = o.customer?.email || o.customer?.phone || `customer_${o.id}`;
      const name = o.customer?.name || "Customer";
      const phone = o.customer?.phone || "N/A";
      const address = o.customer?.address || "N/A";

      if (!map.has(email)) {
        map.set(email, {
          name,
          email,
          phone,
          address,
          orders: [],
          cart: [],
          favorites: [],
          reviews: [],
          chatCount: 0,
        });
      }
      const c = map.get(email);
      c.orders.push(o);
      if (name !== "Customer" && c.name === "Customer") c.name = name;
      if (phone !== "N/A" && c.phone === "N/A") c.phone = phone;
      if (address !== "N/A" && c.address === "N/A") c.address = address;
    });

    // 2. Ingest from Chat Sessions
    sessions.forEach((s) => {
      const email = s.customerEmail || s.customerName || `chat_${s.sessionId}`;
      if (!map.has(email)) {
        map.set(email, {
          name: s.customerName || "Chat Customer",
          email: s.customerEmail || "N/A",
          phone: "N/A",
          address: "N/A",
          orders: [],
          cart: [],
          favorites: [],
          reviews: [],
          chatCount: s.messageCount,
        });
      } else {
        const c = map.get(email);
        c.chatCount += s.messageCount;
      }
    });

    // 3. Attach reviews by name
    reviews.forEach((r) => {
      let matched = false;
      map.forEach((c) => {
        if (c.name.toLowerCase() === r.name.toLowerCase()) {
          c.reviews.push(r);
          matched = true;
        }
      });
      if (!matched) {
        map.set(`review_${r.id}`, {
          name: r.name,
          email: "Verified Reviewer",
          phone: "N/A",
          address: "N/A",
          orders: [],
          cart: [],
          favorites: [],
          reviews: [r],
          chatCount: 0,
        });
      }
    });

    // 4. Attach active session cart & favorites to the primary logged-in or demo user
    const list = Array.from(map.values());
    if (list.length > 0) {
      list[0].cart = globalCartItems;
      list[0].favorites = globalFavorites;
    } else {
      // Default sample customer if empty
      list.push({
        name: "VIP Customer",
        email: "customer@almadina.pk",
        phone: "03001234567",
        address: "Sector 36-B, Korangi, Karachi",
        orders: orders,
        cart: globalCartItems,
        favorites: globalFavorites,
        reviews: reviews,
        chatCount: sessions.length,
      });
    }

    return list;
  }, [orders, sessions, reviews, globalCartItems, globalFavorites]);

  const filteredCustomers = aggregatedCustomers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const filteredReviews = reviews.filter((r) => {
    const q = reviewSearch.toLowerCase();
    const matchesSearch = r.name.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (reviewFilter === "pending") return r.status === "pending";
    if (reviewFilter === "approved") return r.status === "approved" || !r.status;
    return true;
  });

  const pendingReviewsCount = reviews.filter((r) => r.status === "pending").length;
  const approvedReviewsCount = reviews.filter((r) => r.status === "approved" || !r.status).length;

  const filteredReservations = reservations.filter((res) => {
    if (reservationFilter === "pending") return res.status === "pending";
    if (reservationFilter === "confirmed") return res.status === "confirmed";
    return true;
  });

  // Review Actions
  const handleOpenEditReview = (r) => {
    setEditingReview(r);
    setReviewForm({ name: r.name, rating: r.rating, comment: r.comment });
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    if (editingReview) {
      updateReview(editingReview.id, {
        name: reviewForm.name,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setEditingReview(null);
    } else {
      addReview({
        name: reviewForm.name,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setShowAddReviewModal(false);
    }
    setReviewForm({ name: "", rating: 5, comment: "" });
  };

  const handleDeleteReview = (id) => {
    if (window.confirm("Kiya aap waqai is customer review ko delete karna chahte hain?")) {
      deleteReview(id);
    }
  };

  // Website Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("am_website_settings", JSON.stringify(siteSettings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const STATS = [
    { label: "Today's orders", value: todaysOrders.length, icon: ShoppingBag },
    { label: "Today's revenue", value: `Rs ${todaysRevenue}`, icon: DollarSign },
    { label: "Active Orders", value: orders.filter((o) => o.status !== "delivered").length, icon: CalendarCheck },
    { label: "Customer Chats", value: sessions.length, icon: MessageCircle },
    { label: "Total Reviews", value: reviews.length, icon: Star },
    { label: "Average Rating", value: `${averageRating} ★`, icon: Sparkles },
    { label: "Customers", value: aggregatedCustomers.length, icon: Users },
    { label: "Items in Cart", value: globalCartItems.length, icon: ShoppingCart },
  ];

  if (adminAccess === "checking") {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <p>Verifying authorized staff access…</p>
      </section>
    );
  }
  if (adminAccess !== "allowed") {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <section
      className="w-full min-h-screen px-4 py-10"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Amiri', serif" }}>
                Owner Admin Dashboard
              </h1>
              <span className="text-xs bg-[#D4AF37]/20 text-[#F0DFA0] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full font-semibold">
                Super Admin Access
              </span>
            </div>
            <p className="text-sm text-white/50 mt-1">
              Al Madina Restaurant · Orders Dispatch, Supabase Chats, Reviews, Customer Carts & Website Data
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/40 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-2">
                <s.icon size={16} />
              </div>
              <p className="text-white text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-white/55 truncate">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation (5 Comprehensive Tabs) */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <ShoppingBag size={15} />
            Orders & Live Dispatch ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "chats"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <MessageCircle size={15} />
            Customer AI Chats & Supabase ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <Star size={15} />
            Customer Reviews ({reviews.length})
            {pendingReviewsCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingReviewsCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "reservations"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <CalendarCheck size={15} />
            Table Reservations ({reservations.length})
            {reservations.filter((r) => r.status === "pending").length > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {reservations.filter((r) => r.status === "pending").length} new
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "customers"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <Users size={15} />
            Customer Activity, Carts & Favorites ({aggregatedCustomers.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <Settings size={15} />
            Website Data & Owner Info
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: Live Orders Management */}
        {/* ======================================================== */}
        {activeTab === "orders" && (
          <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h2 className="text-white text-xl font-semibold">Orders & Delivery Control</h2>
                <p className="text-xs text-white/50">
                  WhatsApp pe baat hone ke baad rider ko dispatch karein taake client live bike track kar sake.
                </p>
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
                    ? `https://wa.me/${
                        phoneClean.startsWith("0") ? "92" + phoneClean.slice(1) : phoneClean
                      }?text=${encodeURIComponent(
                        `Assalam-o-Alaikum ${o.customer?.name || ""}! Al Madina Restaurant se aapke Order #${o.id} ke hawale se rabta kar rahe hain.`
                      )}`
                    : null;

                  return (
                    <div
                      key={o.id}
                      className="bg-black/40 border border-white/10 hover:border-[#D4AF37]/40 rounded-xl p-5 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="text-white font-bold text-base">#{o.id}</span>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs text-white/40">
                              {new Date(o.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-white/70">
                            Customer: <span className="text-white font-medium">{o.customer?.name || "Hakim Bhai"}</span> · Phone:{" "}
                            <span className="text-[#D4AF37]">{o.customer?.phone || "03070769139"}</span>
                          </p>
                          {o.customer?.address && (
                            <p className="text-xs text-white/55 mt-0.5">📍 {o.customer.address}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
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
                          <button
                            onClick={() => {
                              if (window.confirm(`Order #${o.id} ko delete karna chahte hain?`)) {
                                deleteOrder(o.id);
                              }
                            }}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Order items preview */}
                      <div className="mb-4">
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {(o.items || []).map((it, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/80"
                            >
                              {it.quantity}× {it.name} (Rs {it.price})
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
                            className="inline-flex items-center gap-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer"
                          >
                            <Check size={13} />
                            Confirm Order & Start Kitchen
                          </button>
                        )}

                        {o.status !== "out_for_delivery" && o.status !== "delivered" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "out_for_delivery")}
                            className="inline-flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3.5 py-1.5 rounded-md transition-all shadow-md cursor-pointer"
                          >
                            <Bike size={14} />
                            Dispatch Rider (Start GPS Bike Tracking)
                          </button>
                        )}

                        {o.status === "out_for_delivery" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "delivered")}
                            className="inline-flex items-center gap-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer"
                          >
                            <Check size={13} />
                            Mark as Delivered
                          </button>
                        )}

                        {o.status === "delivered" && (
                          <span className="text-xs text-emerald-400 font-medium">✓ Delivery Completed</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: Customer AI Chats & Supabase Management */}
        {/* ======================================================== */}
        {activeTab === "chats" && (
          <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">Customer AI Chats & Supabase Inbox</h2>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isSupabaseConfigured
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-blue-500/15 text-blue-300 border-blue-500/40"
                    }`}
                  >
                    <Database size={11} />
                    {isSupabaseConfigured ? "Supabase Live" : "Supabase Ready (Local Cache)"}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Har customer ki AI Shahi Host ke sath guftagu yahan record hoti hai. Aap kisi bhi chat ko parh aur delete kar sakte hain.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setChatViewMode("split")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      chatViewMode === "split"
                        ? "bg-[#D4AF37] text-black font-semibold shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Columns size={13} />
                    Conversations ({sessions.length})
                  </button>
                  <button
                    onClick={() => setChatViewMode("all_table")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      chatViewMode === "all_table"
                        ? "bg-[#D4AF37] text-black font-semibold shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    <List size={13} />
                    Sabhi Messages Ka Text ({rawChats.length})
                  </button>
                </div>

                <button
                  onClick={loadChats}
                  disabled={chatsLoading}
                  className="inline-flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg text-white/80 transition-all cursor-pointer"
                  title="Reload chats from Supabase"
                >
                  <RefreshCw size={13} className={chatsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowSqlModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 px-3 py-1.5 rounded-lg text-[#F0DFA0] transition-all cursor-pointer font-medium"
                >
                  <Database size={13} />
                  Supabase SQL Setup
                </button>
                {sessions.length > 0 && (
                  <button
                    onClick={handleClearAllChats}
                    className="inline-flex items-center gap-1.5 text-xs bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 px-3 py-1.5 rounded-lg text-red-300 transition-all cursor-pointer font-medium"
                  >
                    <Trash2 size={13} />
                    Clear All Chats
                  </button>
                )}
              </div>
            </div>

            {/* Hakim Bhai Roman Urdu Guide Banner */}
            <div className="mb-4 bg-gradient-to-r from-[#D4AF37]/15 via-black/40 to-[#D4AF37]/10 border border-[#D4AF37]/35 rounded-xl p-3.5 text-xs">
              <div className="flex items-center gap-2 text-[#F0DFA0] font-bold text-sm mb-1.5">
                <Sparkles size={16} className="text-[#D4AF37]" />
                <span>Hakim Bhai Guide: Messages Ka Text Kahan Aur Kaise Dekhein?</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/85 text-[11px] leading-relaxed">
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <p className="font-semibold text-[#D4AF37] mb-1">🖥️ 1. Iss Website Admin Portal Par:</p>
                  <p>
                    • Neechay customer ke card par <strong className="text-white">"Pura Message Text Kholein"</strong> par click karein. Saamne right side par unke tamam messages ka mukammal text open ho jayega.<br />
                    • Ya upar <strong className="text-[#D4AF37]">"Sabhi Messages Ka Text"</strong> button dabayein, jahan har ek message ka text bina kisi click ke saamne list mein nazar aayega!
                  </p>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <p className="font-semibold text-emerald-400 mb-1">🗄️ 2. Supabase Dashboard (supabase.com) Par:</p>
                  <p>
                    • Supabase mein left menu ke <strong className="text-white">"Table Editor"</strong> (grid icon) par click karein.<br />
                    • Phir table <strong className="text-emerald-300">"customer_chats"</strong> select karein. Wahan <strong className="text-white">"message"</strong> column mein customer ka likha hua pura text hota hai! Row par double click kar ke pura text bara kar ke bhi parh sakte hain.
                  </p>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search by customer name, email, or message keyword..."
                  className="w-full bg-black/40 border border-white/10 focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Split layout: sessions list (left) & conversation transcript (right) */}
            {sessions.length === 0 ? (
              <div className="py-16 text-center bg-black/20 border border-dashed border-white/10 rounded-xl">
                <Bot size={36} className="mx-auto text-[#D4AF37]/60 mb-3" />
                <p className="text-white text-base font-semibold mb-1">Abhi tak koi chat record nahi hua</p>
                <p className="text-xs text-white/50 max-w-md mx-auto mb-5">
                  Jab customer chatbot par sawaal puchega, ya koi dish/order ka rate maangega, unki live guftagu yahan Supabase mein show hogi.
                </p>
                <button
                  onClick={handleAddSampleChat}
                  className="inline-flex items-center gap-2 text-xs bg-[#D4AF37] hover:bg-[#F0DFA0] text-black font-semibold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Sparkles size={14} />
                  Add Sample Customer Chat (Test)
                </button>
              </div>
            ) : chatViewMode === "all_table" ? (
              /* VIEW MODE: Flat List of All Messages */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-white/60 px-1">
                  <span>Sabhi Messages Ka Mukammal Text ({filteredFlatMessages.length})</span>
                  <span className="text-[11px] text-white/40">Har message ka pura text bina cut kiye neechay mojood hai</span>
                </div>

                {filteredFlatMessages.length === 0 ? (
                  <div className="p-8 text-center text-white/40 text-xs bg-black/20 rounded-xl border border-white/10">
                    Koi message search criteria se match nahi hua.
                  </div>
                ) : (
                  filteredFlatMessages.map((m) => {
                    const isCust = m.sender === "customer";
                    return (
                      <div
                        key={m.id}
                        className="bg-black/50 border border-white/10 hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                                isCust
                                  ? "bg-[#D4AF37]/20 text-[#F0DFA0] border border-[#D4AF37]/40"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              }`}
                            >
                              {isCust ? <User size={12} /> : <Bot size={12} />}
                              {isCust ? "Customer Ka Message" : "AI Shahi Host Ka Jawab"}
                            </span>
                            <span className="text-white font-medium text-xs">
                              {m.customer_name || "Guest Customer"}
                            </span>
                            {m.customer_email && (
                              <span className="text-white/40 text-[11px]">({m.customer_email})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-white/50">
                            <Clock size={12} />
                            <span>{new Date(m.created_at).toLocaleString()}</span>
                            <button
                              onClick={() => handleCopyMessageText(m.id, m.message)}
                              className="inline-flex items-center gap-1 text-white/70 hover:text-[#D4AF37] px-2 py-0.5 rounded hover:bg-white/5 transition-all cursor-pointer font-medium"
                              title="Copy Message Text"
                            >
                              {copiedMsgId === m.id ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy Text</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteSingleMessage(m.id)}
                              className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Delete Message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Full message text */}
                        <div
                          className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                            isCust
                              ? "bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-white font-medium"
                              : "bg-white/5 border border-white/10 text-white/90"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* VIEW MODE: Split Sessions + Transcript */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[460px]">
                {/* Left column: Sessions List */}
                <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5 max-h-[620px] overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] text-white/50 uppercase tracking-wider">
                    <span>Customer Conversations ({filteredSessions.length})</span>
                    <span className="text-[10px] text-[#D4AF37]">Click to read text</span>
                  </div>

                  {filteredSessions.map((s) => {
                    const isSelected = s.sessionId === selectedSessionId;
                    const isExpandedInline = expandedCardId === s.sessionId;
                    const lastMsg = s.messages[s.messages.length - 1];

                    return (
                      <div
                        key={s.sessionId}
                        className={`p-3.5 rounded-xl border transition-all relative ${
                          isSelected
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 text-xs font-bold">
                              {s.customerName[0]?.toUpperCase() || "C"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{s.customerName}</p>
                              <p className="text-[10px] text-white/50 truncate">{s.customerEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#F0DFA0] font-semibold px-2 py-0.5 rounded-full">
                              {s.messageCount} Messages
                            </span>
                            <button
                              onClick={(e) => handleDeleteSession(s.sessionId, e)}
                              className="text-white/30 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Delete this chat from Supabase"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {lastMsg && (
                          <div className="text-[11px] text-white/70 bg-black/30 p-2 rounded-lg border border-white/5 my-2">
                            <span className="text-[#D4AF37] font-semibold">
                              {lastMsg.sender === "customer" ? "Aakhri Sawaal: " : "AI Jawab: "}
                            </span>
                            <span className="line-clamp-2">{lastMsg.message}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-white/40 mb-2">
                          <span>
                            {new Date(s.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                            {new Date(s.lastMessageAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => toggleCardAccordion(s.sessionId, e)}
                            className="text-[#D4AF37] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                          >
                            {isExpandedInline ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            {isExpandedInline ? "Card Band Karein" : "Card Ke Andar Kholein"}
                          </button>
                        </div>

                        {/* Direct Button to open Full Transcript */}
                        <button
                          onClick={() => handleSelectSession(s.sessionId)}
                          className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg transition-all shadow cursor-pointer ${
                            isSelected
                              ? "bg-[#D4AF37] hover:bg-[#F0DFA0] text-black"
                              : "bg-white/10 hover:bg-[#D4AF37] hover:text-black text-white"
                          }`}
                        >
                          <Eye size={13} />
                          <span>Pura Message Text Dekhein / Open</span>
                        </button>

                        {/* Inline Accordion Messages if toggled */}
                        {isExpandedInline && (
                          <div className="mt-3 pt-3 border-t border-white/10 space-y-2 bg-black/40 p-2.5 rounded-lg">
                            <p className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                              Guftagu Ka Text (Inline):
                            </p>
                            {s.messages.map((m) => (
                              <div
                                key={m.id}
                                className={`p-2 rounded text-[11px] leading-relaxed ${
                                  m.sender === "customer"
                                    ? "bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-white"
                                    : "bg-white/5 border border-white/10 text-white/80"
                                }`}
                              >
                                <span className="font-bold text-[10px] block text-[#D4AF37]">
                                  {m.sender === "customer" ? `Customer (${s.customerName}):` : "AI Shahi Host:"}
                                </span>
                                <p className="whitespace-pre-wrap mt-0.5">{m.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right column: Selected Conversation Transcript */}
                <div
                  id="chat-transcript-view"
                  className="lg:col-span-7 bg-black/60 border border-[#D4AF37]/30 rounded-xl p-4 flex flex-col justify-between max-h-[620px] shadow-xl"
                >
                  {activeSession ? (
                    <>
                      {/* Transcript Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                            {activeSession.customerName[0]?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{activeSession.customerName}</h3>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-medium">
                                Active Chat
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50">
                              {activeSession.customerEmail || "No email"} · Total {activeSession.messageCount} Messages
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteSession(activeSession.sessionId, e)}
                            className="inline-flex items-center gap-1.5 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium"
                          >
                            <Trash2 size={12} />
                            Delete Chat
                          </button>
                        </div>
                      </div>

                      {/* Messages scroll area */}
                      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-3 max-h-[460px]">
                        {activeSession.messages.map((m) => {
                          const isCust = m.sender === "customer";
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col group ${isCust ? "items-end" : "items-start"}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-white/50">
                                {isCust ? (
                                  <>
                                    <span className="text-[#D4AF37] font-semibold">{activeSession.customerName} (Customer)</span>
                                    <User size={11} className="text-[#D4AF37]" />
                                  </>
                                ) : (
                                  <>
                                    <Bot size={11} className="text-emerald-400" />
                                    <span className="text-emerald-300 font-semibold">AI Shahi Host (Al Madina)</span>
                                  </>
                                )}
                                <span>·</span>
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                <button
                                  onClick={() => handleCopyMessageText(m.id, m.message)}
                                  className="text-white/40 hover:text-[#D4AF37] p-1 rounded hover:bg-white/5 transition-all cursor-pointer ml-1"
                                  title="Copy text"
                                >
                                  {copiedMsgId === m.id ? (
                                    <Check size={11} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteSingleMessage(m.id)}
                                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-opacity cursor-pointer"
                                  title="Delete single message"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>

                              <div
                                className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed max-w-[90%] shadow-md ${
                                  isCust
                                    ? "bg-[#D4AF37] text-black font-medium rounded-tr-none"
                                    : "bg-white/10 border border-white/15 text-white/95 rounded-tl-none"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{m.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                        <span>Session: {activeSession.sessionId}</span>
                        <span>Started: {new Date(activeSession.firstMessageAt).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs py-16">
                      <Bot size={32} className="text-[#D4AF37]/50 mb-2" />
                      <p>Kisi bhi customer conversation par click karein taakay message ka text yahan khul sakay.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: Customer Reviews Moderation */}
        {/* ======================================================== */}
        {activeTab === "reviews" && (
          <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-white text-xl font-semibold">Customer Reviews & Moderation</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Tamam customer reviews yahan list hain. Aap kisi bhi review ko edit, delete, ya naya verified review add kar sakte hain.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg text-[#F0DFA0] text-xs font-semibold">
                  <Star size={14} className="fill-[#D4AF37]" />
                  <span>Avg: {averageRating} / 5.0 ({reviews.length} reviews)</span>
                </div>
                <button
                  onClick={() => {
                    setEditingReview(null);
                    setReviewForm({ name: "Hakim Bhai", rating: 5, comment: "" });
                    setShowAddReviewModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#D4AF37] hover:bg-[#F0DFA0] text-black font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                >
                  <Plus size={14} /> Add Review
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Search reviews by customer name or comments..."
                  className="w-full bg-black/40 border border-white/10 focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              {/* Review Filter Pills */}
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setReviewFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    reviewFilter === "all"
                      ? "bg-[#D4AF37] text-black"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    reviewFilter === "pending"
                      ? "bg-amber-500 text-black font-bold"
                      : pendingReviewsCount > 0
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Pending Approval ⏳ ({pendingReviewsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("approved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    reviewFilter === "approved"
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Approved ✅ ({approvedReviewsCount})
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <p className="text-sm py-12 text-center text-white/50">Koi review nahi mila.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-black/40 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                      r.status === "pending"
                        ? "border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "border-white/10 hover:border-[#D4AF37]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-white text-sm font-bold">{r.name}</p>
                            {r.status === "pending" ? (
                              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                                ⏳ Pending Approval
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                ✓ Live
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/40 mt-0.5">{r.date || "Recent"}</p>
                        </div>
                        <div className="flex items-center gap-0.5 text-[#D4AF37]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < r.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/20"}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-white/80 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5 mb-4">
                        "{r.comment}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 flex-wrap">
                      <div>
                        {r.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => approveReview(r.id)}
                            className="inline-flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                            title="Approve and make visible to all customers"
                          >
                            <CheckCircle size={13} /> Approve (OK)
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditReview(r)}
                          className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="inline-flex items-center gap-1 text-[11px] bg-red-500/15 hover:bg-red-500/25 text-red-300 font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit / Add Review Modal */}
            {(editingReview || showAddReviewModal) && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121212] border border-[#D4AF37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      {editingReview ? "Edit Customer Review" : "Add New Customer Review"}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingReview(null);
                        setShowAddReviewModal(false);
                      }}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveReview} className="space-y-4">
                    <div>
                      <label className="text-xs text-white/70 block mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Hakim Bhai"
                        className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Rating (Stars)</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                        <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                        <option value={3}>⭐⭐⭐ 3 Stars (Good)</option>
                        <option value={2}>⭐⭐ 2 Stars (Average)</option>
                        <option value={1}>⭐ 1 Star (Needs Improvement)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Review Feedback</label>
                      <textarea
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Khana kaisa laga? Service aur taste ka review likhein..."
                        className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReview(null);
                          setShowAddReviewModal(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F0DFA0] text-black text-xs font-bold shadow-md cursor-pointer"
                      >
                        {editingReview ? "Update Review" : "Save Review"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: Table Reservations & VIP Seating */}
        {/* ======================================================== */}
        {activeTab === "reservations" && (
          <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                  <CalendarCheck size={20} className="text-[#D4AF37]" /> Table Reservations & VIP Seating
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Tamam table bookings yahan show hoti hain. Har booking pehle <strong>Pending</strong> hoti hai, aapke <strong>Approve (OK)</strong> karne par customer ko <strong>Confirmed</strong> show hoti hai.
                </p>
              </div>

              {/* Reservation Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setReservationFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    reservationFilter === "all"
                      ? "bg-[#D4AF37] text-black"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  All ({reservations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReservationFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    reservationFilter === "pending"
                      ? "bg-amber-500 text-black font-bold"
                      : reservations.filter((r) => r.status === "pending").length > 0
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Pending ({reservations.filter((r) => r.status === "pending").length})
                </button>
                <button
                  type="button"
                  onClick={() => setReservationFilter("confirmed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    reservationFilter === "confirmed"
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  Confirmed ({reservations.filter((r) => r.status === "confirmed").length})
                </button>
              </div>
            </div>

            {/* Reservations Grid */}
            {filteredReservations.length === 0 ? (
              <p className="text-sm py-12 text-center text-white/50">Koi table reservation nahi mili.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReservations.map((res) => {
                  const guestWaText = encodeURIComponent(
                    `Assalam o Alaikum ${res.name}! Al Madina Restaurant ki taraf se aapki Table Booking (ID: ${res.id}) confirm kar di gayi hai. Tashreef awri ka shukriya!`
                  );
                  const guestWaUrl = `https://wa.me/92${res.phone?.replace(/^0/, "").replace(/\D/g, "")}?text=${guestWaText}`;

                  return (
                    <div
                      key={res.id}
                      className={`bg-black/40 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                        res.status === "pending"
                          ? "border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "border-white/10 hover:border-[#D4AF37]/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-white text-sm font-bold">{res.name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                res.status === "pending"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : res.status === "confirmed"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-red-500/20 text-red-300 border-red-500/40"
                              }`}>
                                {res.status === "pending"
                                  ? "⏳ Pending Your OK"
                                  : res.status === "confirmed"
                                  ? "✅ Confirmed"
                                  : "Cancelled"}
                              </span>
                            </div>
                            <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">
                              📱 {res.phone}
                            </p>
                          </div>
                          <span className="text-[10px] text-white/40">#{res.id}</span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 bg-white/[0.03] border border-white/5 rounded-lg text-xs">
                          <div>
                            <span className="text-white/40 block text-[10px]">Date</span>
                            <span className="text-white font-medium">{res.date}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px]">Time</span>
                            <span className="text-white font-medium">{res.time}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-white/40 block text-[10px]">Seating / Guests</span>
                            <span className="text-white font-medium">{res.guests} Afraad (Family Hall)</span>
                          </div>
                        </div>

                        {res.notes && (
                          <p className="text-xs text-white/75 italic bg-white/[0.02] p-2 rounded border border-white/5 mb-3">
                            "{res.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10 flex-wrap">
                        <div>
                          {res.status === "pending" ? (
                            <button
                              type="button"
                              onClick={() => updateReservationStatus(res.id, "confirmed")}
                              className="inline-flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                            >
                              <CheckCircle size={13} /> Approve Table (OK)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateReservationStatus(res.id, "pending")}
                              className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer"
                            >
                              Revert to Pending
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {res.phone && (
                            <a
                              href={guestWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 px-2.5 py-1 rounded-md font-semibold transition-all"
                              title="Send WhatsApp confirmation to guest"
                            >
                              <MessageSquare size={12} /> WhatsApp
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Kiya aap is table booking ko delete karna chahte hain?")) {
                                deleteReservation(res.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] bg-red-500/15 hover:bg-red-500/25 text-red-300 font-medium px-2 py-1 rounded-md transition-all cursor-pointer"
                            title="Delete booking"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ======================================================== */}
        {activeTab === "customers" && (
          <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-white text-xl font-semibold">Customer Activity, Carts & Favorites</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Maloom karein kis customer ne kya orders diye, cart mein kya add kiya, aur kya favorat kiya hua hai.
                </p>
              </div>
              <span className="text-xs bg-[#D4AF37]/15 text-[#F0DFA0] border border-[#D4AF37]/30 px-3 py-1 rounded-full font-medium">
                {aggregatedCustomers.length} Total Customers
              </span>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer by name, email, phone or address..."
                  className="w-full bg-black/40 border border-white/10 focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredCustomers.map((cust, idx) => {
                const totalSpent = cust.orders.reduce((sum, o) => sum + (o.total || 0), 0);

                return (
                  <div
                    key={idx}
                    className="bg-black/40 border border-white/10 hover:border-[#D4AF37]/40 rounded-xl p-5 transition-all"
                  >
                    {/* Customer Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-base font-bold">
                          {cust.name[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-base font-bold">{cust.name}</p>
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                              Verified Customer
                            </span>
                          </div>
                          <p className="text-xs text-white/60">
                            📧 {cust.email} · 📞 <span className="text-[#D4AF37]">{cust.phone}</span>
                          </p>
                          {cust.address !== "N/A" && (
                            <p className="text-xs text-white/50 mt-0.5">📍 {cust.address}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-white/50">Total Orders Placed</p>
                          <p className="text-base font-bold text-[#D4AF37]">{cust.orders.length} orders (Rs {totalSpent})</p>
                        </div>
                      </div>
                    </div>

                    {/* 3 Detail Boxes: Orders, Cart Items, Favorites */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Orders Placed */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2">
                          <ShoppingBag size={13} className="text-[#D4AF37]" />
                          <span>Orders History ({cust.orders.length})</span>
                        </div>
                        {cust.orders.length === 0 ? (
                          <p className="text-[11px] text-white/40 italic">Koi order nahi mila</p>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {cust.orders.map((o) => (
                              <div key={o.id} className="text-[11px] bg-black/40 p-1.5 rounded flex justify-between text-white/80">
                                <span>#{o.id} · Rs {o.total}</span>
                                <span className="text-[#D4AF37] font-medium">{o.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Items in Cart */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2">
                          <ShoppingCart size={13} className="text-emerald-400" />
                          <span>Items in Cart ({cust.cart.length})</span>
                        </div>
                        {cust.cart.length === 0 ? (
                          <p className="text-[11px] text-white/40 italic">Cart khali hai</p>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {cust.cart.map((item, i) => (
                              <div key={i} className="text-[11px] bg-black/40 p-1.5 rounded flex justify-between text-white/80">
                                <span>{item.quantity}× {item.name}</span>
                                <span className="text-emerald-400 font-medium">Rs {item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Favorited Dishes */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-2">
                          <Heart size={13} className="text-red-400 fill-red-400" />
                          <span>Favorited Dishes ({cust.favorites.length})</span>
                        </div>
                        {cust.favorites.length === 0 ? (
                          <p className="text-[11px] text-white/40 italic">Koi favorite item nahi</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                            {cust.favorites.map((fav, i) => (
                              <span key={i} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-2 py-0.5 rounded-md">
                                {fav.name} (Rs {fav.price})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Review Status */}
                    {cust.reviews.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/70">
                        <Star size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
                        <span>Customer Review: <strong>{cust.reviews[0].rating}★</strong> — "{cust.reviews[0].comment}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: Website Settings & Owner Controls */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="bg-white/[0.03] border border-[#D4AF37]/25 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-white text-xl font-semibold">Website Data & Restaurant Settings</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Yahan se aap website ka official phone number, email, address, delivery rates aur timings edit kar sakte hain.
                </p>
              </div>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
                Live Website Sync
              </span>
            </div>

            {settingsSaved && (
              <div className="mb-5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <CheckCircle size={16} /> Website settings kamiyabi se save ho gayi hain! Tamam pages par apply ho chuki hain.
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-[#D4AF37]" /> Restaurant / Brand Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.restaurantName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, restaurantName: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#D4AF37]" /> Owner / Helpline WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    placeholder="03070769139"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-[#D4AF37]" /> Official Email Address
                  </label>
                  <input
                    type="email"
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    placeholder="almadinarestaurant@gmail.com"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#D4AF37]" /> Kitchen & Dining Timings
                  </label>
                  <input
                    type="text"
                    value={siteSettings.openingHours}
                    onChange={(e) => setSiteSettings({ ...siteSettings, openingHours: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#D4AF37]" /> Physical Branch Address
                </label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                    <Bike size={13} className="text-[#D4AF37]" /> Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.deliveryFee}
                    onChange={(e) => setSiteSettings({ ...siteSettings, deliveryFee: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[#D4AF37]" /> Minimum Order Value (PKR)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.minOrder}
                    onChange={(e) => setSiteSettings({ ...siteSettings, minOrder: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#D4AF37]" /> Top Announcement Banner Text
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.announcement}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] hover:brightness-110 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Save size={16} /> Save Website Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* Supabase SQL Setup Modal */}
        {/* ======================================================== */}
        {showSqlModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-[#D4AF37]/40 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database size={20} className="text-[#D4AF37]" />
                  <h3 className="text-lg font-bold text-white">Supabase SQL Table Setup</h3>
                </div>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="text-white/40 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-xs text-white/70 mb-3">
                Supabase mein <strong className="text-[#D4AF37]">Orders, Reviews, Carts, Favorites, aur Customer Chats</strong> ke tamam tables banane ke liye Supabase Dashboard ke <strong>SQL Editor</strong> (New Query) mein jaa kar niche diya gaya All-in-One SQL code paste karein aur <strong>"Run"</strong> dabayein:
              </p>

              <div className="relative mb-4">
                <pre className="bg-black/80 border border-white/10 rounded-xl p-3.5 text-[11px] text-[#F0DFA0] font-mono overflow-x-auto max-h-[220px]">
                  {SUPABASE_CHAT_TABLE_SQL}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 text-xs bg-[#D4AF37] hover:bg-[#F0DFA0] text-black font-semibold px-2.5 py-1 rounded-md transition-all shadow cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <CheckCircle size={13} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy SQL
                    </>
                  )}
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5 mb-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <p>
                  <strong>Note:</strong> Code already connected hai! Chahe aap SQL abhi run karein ya baad mein, app
                  crash nahi hoga aur local cache mein chats save karta rahega. SQL run karne se real Supabase cloud
                  database mein direct sync shuru ho jayega.
                </p>
              </div>

              <button
                onClick={() => setShowSqlModal(false)}
                className="w-full text-center text-xs bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl transition-all cursor-pointer"
              >
                Theek Hai, Samajh Gaya
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
