import { supabase } from "./supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Customer Chat Service (Supabase)
// Stores live customer conversations with the AI Shahi Host in Supabase.
// Allows Admin to view, monitor, and delete any customer chat.
// ============================================================

export const CHAT_TABLE_NAME = "customer_chats";
const LOCAL_STORAGE_BACKUP = "am_synced_customer_chats";

export const SUPABASE_CHAT_TABLE_SQL = `-- Al Madina Restaurant: Customer Chats Table for Supabase
-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS customer_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  sender TEXT NOT NULL, -- 'customer' or 'ai_host'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_chats ENABLE ROW LEVEL SECURITY;

-- Allow public & authenticated users to insert & read chats
CREATE POLICY "Allow full access for customer_chats"
  ON customer_chats
  FOR ALL
  USING (true)
  WITH CHECK (true);
`;

// Helper: read local cache
function getLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper: write local cache
function saveLocalCache(chats) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BACKUP, JSON.stringify(chats));
  } catch {}
}

/**
 * Save a message (either customer question or AI response) to Supabase
 */
export async function saveChatMessage({
  sessionId,
  userId = null,
  customerName = "Guest Customer",
  customerEmail = "guest@customer",
  sender, // 'customer' | 'ai_host'
  message,
  metadata = {},
}) {
  const row = {
    session_id: sessionId || "session_default",
    user_id: userId || null,
    customer_name: customerName || "Guest Customer",
    customer_email: customerEmail || "guest@customer",
    sender,
    message,
    metadata,
    created_at: new Date().toISOString(),
  };

  // Always mirror to local cache for instant UI feedback & offline safety
  const currentCache = getLocalCache();
  const cachedRow = { id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...row };
  saveLocalCache([cachedRow, ...currentCache]);

  try {
    const { data, error } = await supabase.from(CHAT_TABLE_NAME).insert([row]).select();
    if (error) {
      console.warn("[ChatService] Supabase insert note:", error.message || error);
      return { success: true, savedLocally: true, data: [cachedRow] };
    }
    return { success: true, data };
  } catch (err) {
    console.warn("[ChatService] Network error saving chat to Supabase, saved locally:", err);
    return { success: true, savedLocally: true, data: [cachedRow] };
  }
}

/**
 * Fetch all customer chats from Supabase
 */
export async function fetchCustomerChats() {
  try {
    const { data, error } = await supabase
      .from(CHAT_TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to local cache if table not created yet or empty
      const local = getLocalCache();
      return { data: local, source: error ? "cache" : "supabase", error: error?.message || null };
    }

    // Update local cache with latest real Supabase data
    saveLocalCache(data);
    return { data, source: "supabase", error: null };
  } catch (err) {
    const local = getLocalCache();
    return { data: local, source: "cache", error: err?.message || null };
  }
}

/**
 * Delete an entire conversation session by session_id
 */
export async function deleteChatSession(sessionId) {
  // Remove from local cache
  const local = getLocalCache().filter((c) => c.session_id !== sessionId);
  saveLocalCache(local);

  try {
    const { error } = await supabase
      .from(CHAT_TABLE_NAME)
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      console.warn("[ChatService] Error deleting session in Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn("[ChatService] Failed to delete session:", err);
    return { success: true, localOnly: true };
  }
}

/**
 * Delete a single chat message by ID
 */
export async function deleteChatMessage(messageId) {
  // Remove from local cache
  const local = getLocalCache().filter((c) => c.id !== messageId);
  saveLocalCache(local);

  try {
    const { error } = await supabase
      .from(CHAT_TABLE_NAME)
      .delete()
      .eq("id", messageId);

    if (error) {
      console.warn("[ChatService] Error deleting message in Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn("[ChatService] Failed to delete message:", err);
    return { success: true, localOnly: true };
  }
}

/**
 * Clear all customer chats from Supabase & cache
 */
export async function clearAllCustomerChats() {
  saveLocalCache([]);

  try {
    // Delete all records
    const { error } = await supabase
      .from(CHAT_TABLE_NAME)
      .delete()
      .neq("session_id", "impossible_filter_value_to_delete_all");

    if (error) {
      console.warn("[ChatService] Error clearing table in Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn("[ChatService] Failed to clear all chats:", err);
    return { success: true, localOnly: true };
  }
}

/**
 * Group flat messages array into customer sessions for clean Admin display
 */
export function groupChatsBySession(messages = []) {
  const sessionMap = new Map();

  for (const msg of messages) {
    const sId = msg.session_id || "default_session";
    if (!sessionMap.has(sId)) {
      sessionMap.set(sId, {
        sessionId: sId,
        customerName: msg.customer_name || "Guest Customer",
        customerEmail: msg.customer_email || "guest@customer",
        userId: msg.user_id || null,
        isRegistered: Boolean(msg.user_id && msg.customer_email && !msg.customer_email.includes("guest")),
        firstMessageAt: msg.created_at,
        lastMessageAt: msg.created_at,
        messages: [],
      });
    }

    const session = sessionMap.get(sId);
    session.messages.push(msg);

    // Keep name/email if user logged in during chat
    if (msg.user_id && !session.userId) {
      session.userId = msg.user_id;
      session.customerName = msg.customer_name;
      session.customerEmail = msg.customer_email;
      session.isRegistered = true;
    }

    // Track latest message timestamp
    if (new Date(msg.created_at) > new Date(session.lastMessageAt)) {
      session.lastMessageAt = msg.created_at;
    }
  }

  // Convert to array and sort by most recent activity first
  const sessions = Array.from(sessionMap.values());
  sessions.forEach((s) => {
    // Sort messages chronologically inside each session
    s.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  });

  sessions.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  return sessions;
}
