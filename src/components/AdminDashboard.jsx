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
} from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import {
  fetchCustomerChats,
  deleteChatSession,
  deleteChatMessage,
  clearAllCustomerChats,
  groupChatsBySession,
  saveChatMessage,
  SUPABASE_CHAT_TABLE_SQL,
} from "../lib/chatService";
import { isSupabaseConfigured } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Admin Dashboard
// Owner panel: Orders, Live GPS Dispatch, and Customer AI Chats (Supabase)
// ============================================================

function isAdminLoggedIn() {
  return sessionStorage.getItem("am_admin_session") === "true";
}

export default function AdminDashboard() {
  const { orders, updateOrderStatus } = useOrders();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "chats"
  const [rawChats, setRawChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [chatSearch, setChatSearch] = useState("");
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadChats = async () => {
    setChatsLoading(true);
    const { data } = await fetchCustomerChats();
    setRawChats(data || []);
    setChatsLoading(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

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

  const STATS = [
    { label: "Today's orders", value: todaysOrders.length, icon: ShoppingBag },
    { label: "Today's revenue", value: `Rs ${todaysRevenue}`, icon: DollarSign },
    { label: "Active Orders", value: orders.filter((o) => o.status !== "delivered").length, icon: CalendarCheck },
    { label: "Customer Chats", value: sessions.length, icon: MessageCircle },
  ];

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

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
            <p className="text-sm text-white/50">Al Madina Restaurant · Live Order Dispatch & Supabase Chat Control</p>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <ShoppingBag size={16} />
            Orders & Live Dispatch ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "chats"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <MessageCircle size={16} />
            Customer AI Chats & Supabase ({sessions.length})
          </button>
        </div>

        {/* TAB 1: Live Orders Management */}
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
                            Customer: <span className="text-white font-medium">{o.customer?.name || "N/A"}</span> · Phone:{" "}
                            <span className="text-[#D4AF37]">{o.customer?.phone || "N/A"}</span>
                          </p>
                          {o.customer?.address && (
                            <p className="text-xs text-white/55 mt-0.5">📍 {o.customer.address}</p>
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
                            <span
                              key={idx}
                              className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/80"
                            >
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

        {/* TAB 2: Customer AI Chats & Supabase Management */}
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
                <button
                  onClick={loadChats}
                  disabled={chatsLoading}
                  className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all disabled:opacity-50"
                  title="Refresh chats from Supabase"
                >
                  <RefreshCw size={13} className={chatsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowSqlModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F0DFA0] border border-[#D4AF37]/40 px-3 py-1.5 rounded-lg transition-all"
                  title="View Supabase SQL Query to create customer_chats table"
                >
                  <Database size={13} />
                  Supabase SQL Setup
                </button>
                {sessions.length > 0 && (
                  <button
                    onClick={handleClearAllChats}
                    className="inline-flex items-center gap-1.5 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all"
                    title="Delete all customer chats"
                  >
                    <Trash2 size={13} />
                    Clear All Chats
                  </button>
                )}
              </div>
            </div>

            {/* Search filter */}
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search by customer name, email, or message keyword..."
                  className="w-full bg-black/40 border border-white/10 focus:border-[#D4AF37]/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                />
              </div>
              <span className="text-xs text-white/40">
                Total Conversations: <strong className="text-white">{sessions.length}</strong> · Messages:{" "}
                <strong className="text-white">{rawChats.length}</strong>
              </span>
            </div>

            {/* Empty state */}
            {sessions.length === 0 ? (
              <div className="text-center py-12 px-4 bg-black/20 rounded-xl border border-white/5">
                <MessageCircle size={36} className="mx-auto text-white/20 mb-3" />
                <p className="text-white font-medium text-base mb-1">Filhal koi customer chat record nahi hui</p>
                <p className="text-xs text-white/50 max-w-md mx-auto mb-5">
                  Jab customer website ke chatbot se sawal poochega (jaise biryani rates, address, bil calculation), unki
                  guftagu Supabase mein save ho kar foran yahan dikhayi degi.
                </p>
                <button
                  onClick={handleAddSampleChat}
                  className="inline-flex items-center gap-2 text-xs bg-[#D4AF37] hover:bg-[#F0DFA0] text-black font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  <Sparkles size={14} />
                  Test Sample Customer Chat Add Karein
                </button>
              </div>
            ) : (
              /* Two-column layout: Sessions on left, Full Transcript on right */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Sessions List */}
                <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredSessions.map((s) => {
                    const isSelected = activeSession?.sessionId === s.sessionId;
                    const lastMsg = s.messages[s.messages.length - 1];

                    return (
                      <div
                        key={s.sessionId}
                        onClick={() => setSelectedSessionId(s.sessionId)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-black/40"
                            : "bg-black/40 border-white/10 hover:border-white/25 hover:bg-black/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0">
                              {s.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{s.customerName}</p>
                              <p className="text-[10px] text-white/45 truncate">{s.customerEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {s.isRegistered ? (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                                User
                              </span>
                            ) : (
                              <span className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-medium">
                                Guest
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteSession(s.sessionId, e)}
                              className="text-white/30 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-all"
                              title="Delete this customer chat"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {lastMsg && (
                          <p className="text-[11px] text-white/60 line-clamp-2 mt-1">
                            <span className="text-white/40">{lastMsg.sender === "customer" ? "Customer: " : "Bot: "}</span>
                            {lastMsg.message}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-white/35 mt-2 pt-1.5 border-t border-white/5">
                          <span>{new Date(s.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          <span>{s.messages.length} messages</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Full Conversation Transcript */}
                <div className="lg:col-span-7 bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col h-[600px]">
                  {activeSession ? (
                    <>
                      {/* Transcript Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                            <User size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              {activeSession.customerName}
                              {activeSession.isRegistered && (
                                <span className="text-[10px] text-emerald-400 font-normal">● Registered Customer</span>
                              )}
                            </h3>
                            <p className="text-xs text-white/50">{activeSession.customerEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {confirmDeleteId === activeSession.sessionId ? (
                            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 p-1 rounded-lg">
                              <span className="text-[11px] text-red-300 px-1">Delete confirm?</span>
                              <button
                                onClick={() => handleDeleteSession(activeSession.sessionId)}
                                className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded hover:bg-red-500"
                              >
                                Haan, Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[11px] text-white/60 hover:text-white px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(activeSession.sessionId)}
                              className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
                              Delete This Chat
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Messages Scroll Area */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-1">
                        {activeSession.messages.map((m) => {
                          const isCust = m.sender === "customer";
                          return (
                            <div
                              key={m.id || m.created_at}
                              className={`flex flex-col group ${isCust ? "items-end" : "items-start"}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-white/40">
                                {isCust ? (
                                  <>
                                    <span>{activeSession.customerName}</span>
                                    <User size={10} />
                                  </>
                                ) : (
                                  <>
                                    <Bot size={10} className="text-[#D4AF37]" />
                                    <span className="text-[#D4AF37]">Al Madina AI Shahi Host</span>
                                  </>
                                )}
                                <span>· {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                <button
                                  onClick={() => handleDeleteSingleMessage(m.id)}
                                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 ml-1 transition-opacity"
                                  title="Delete single message"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>

                              <div
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                                  isCust
                                    ? "bg-white/10 text-white border border-white/15 rounded-br-none"
                                    : "bg-[#D4AF37]/10 text-white border border-[#D4AF37]/35 rounded-bl-none shadow-sm shadow-black"
                                }`}
                              >
                                {m.message}

                                {m.metadata && (m.metadata.dish || m.metadata.billTotal) && (
                                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1.5 text-[10px]">
                                    {m.metadata.dish && (
                                      <span className="bg-[#D4AF37]/20 text-[#F0DFA0] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                                        🍽️ {m.metadata.dish}
                                      </span>
                                    )}
                                    {m.metadata.billTotal && (
                                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                        🧾 Bill: Rs {m.metadata.billTotal}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                        <span>Session ID: {activeSession.sessionId}</span>
                        <span>Started: {new Date(activeSession.firstMessageAt).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
                      Select a customer conversation from the list to view.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Supabase SQL Setup Modal */}
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
                  className="text-white/40 hover:text-white text-xs px-2 py-1 rounded"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-xs text-white/70 mb-3">
                Agar aapne Supabase mein abhi tak <code className="text-[#D4AF37]">customer_chats</code> table nahi banaya,
                toh Supabase Dashboard ke <strong>SQL Editor</strong> mein jaa kar niche diya gaya SQL code paste karein aur
                <strong> "Run"</strong> dabayein:
              </p>

              <div className="relative mb-4">
                <pre className="bg-black/80 border border-white/10 rounded-xl p-3.5 text-[11px] text-[#F0DFA0] font-mono overflow-x-auto max-h-[220px]">
                  {SUPABASE_CHAT_TABLE_SQL}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 text-xs bg-[#D4AF37] hover:bg-[#F0DFA0] text-black font-semibold px-2.5 py-1 rounded-md transition-all shadow"
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
                className="w-full text-center text-xs bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl transition-all"
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
