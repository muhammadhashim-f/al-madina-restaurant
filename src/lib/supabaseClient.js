import { createClient } from "@supabase/supabase-js";

// ============================================================
// AL MADINA RESTAURANT — Supabase Client
// Uses real Supabase credentials if configured in environment.
// Falls back to a local/in-memory client so the app boots and
// functions smoothly in AI Studio preview without throwing errors.
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === "string" &&
  supabaseUrl.startsWith("http")
);

function createMockSupabaseClient() {
  const STORAGE_KEY = "am_mock_auth_session";
  const USERS_KEY = "am_mock_auth_users";
  const listeners = new Set();

  const getStoredSession = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const setStoredSession = (session) => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
    listeners.forEach((cb) => {
      try {
        cb(session ? "SIGNED_IN" : "SIGNED_OUT", session);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const getRegisteredUsers = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  };

  return {
    auth: {
      async getSession() {
        const session = getStoredSession();
        return { data: { session }, error: null };
      },
      onAuthStateChange(callback) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(callback),
            },
          },
        };
      },
      async signUp({ email, password, options = {} }) {
        const users = getRegisteredUsers();
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { data: null, error: { message: "User already registered" } };
        }
        const user = {
          id: `usr_${Date.now()}`,
          email,
          user_metadata: options.data || { full_name: options.data?.full_name || email.split("@")[0] },
          created_at: new Date().toISOString(),
        };
        users.push({ ...user, password });
        saveRegisteredUsers(users);

        const session = {
          access_token: `mock_tok_${Date.now()}`,
          user,
        };
        setStoredSession(session);
        return { data: { user, session }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const users = getRegisteredUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found && email !== "demo@almadina.pk") {
          return { data: null, error: { message: "Invalid login credentials" } };
        }
        const user = found
          ? { id: found.id, email: found.email, user_metadata: found.user_metadata }
          : {
              id: "usr_demo",
              email: "demo@almadina.pk",
              user_metadata: { full_name: "Demo Customer", phone: "+92 300 1234567" },
            };
        const session = {
          access_token: `mock_tok_${Date.now()}`,
          user,
        };
        setStoredSession(session);
        return { data: { user, session }, error: null };
      },
      async signInWithOAuth({ provider: _provider } = {}) {
        const user = {
          id: `usr_oauth_${Date.now()}`,
          email: "customer@gmail.com",
          user_metadata: {
            full_name: "Google Customer",
            avatar_url: null,
          },
        };
        const session = {
          access_token: `mock_tok_oauth_${Date.now()}`,
          user,
        };
        setStoredSession(session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        setStoredSession(null);
        return { error: null };
      },
      async updateUser({ data }) {
        const session = getStoredSession();
        if (!session || !session.user) {
          return { data: null, error: { message: "Not authenticated" } };
        }
        session.user.user_metadata = {
          ...(session.user.user_metadata || {}),
          ...data,
        };
        setStoredSession(session);
        return { data: { user: session.user }, error: null };
      },
    },
    from(tableName) {
      const getRows = () => {
        try {
          const raw = localStorage.getItem(`am_mock_tbl_${tableName}`);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      };
      const saveRows = (rows) => {
        try {
          localStorage.setItem(`am_mock_tbl_${tableName}`, JSON.stringify(rows));
        } catch {}
      };

      let currentRows = getRows();
      let pendingDelete = false;

      const builder = {
        select(_cols = "*") {
          return builder;
        },
        insert(rowsToInsert) {
          const toAdd = Array.isArray(rowsToInsert) ? rowsToInsert : [rowsToInsert];
          const enriched = toAdd.map((r) => ({
            id: r.id || `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            created_at: r.created_at || new Date().toISOString(),
            ...r,
          }));
          const existing = getRows();
          const updated = [...enriched, ...existing];
          saveRows(updated);
          return Promise.resolve({ data: enriched, error: null });
        },
        update(updates) {
          return {
            eq(col, val) {
              const rows = getRows().map((r) => (r[col] === val ? { ...r, ...updates } : r));
              saveRows(rows);
              return Promise.resolve({ data: rows, error: null });
            },
          };
        },
        delete() {
          pendingDelete = true;
          return builder;
        },
        eq(col, val) {
          if (pendingDelete) {
            const before = getRows();
            const filtered = before.filter((r) => r[col] !== val);
            saveRows(filtered);
            return Promise.resolve({ data: filtered, error: null });
          }
          currentRows = currentRows.filter((r) => r[col] === val);
          return builder;
        },
        order(col = "created_at", { ascending = true } = {}) {
          currentRows.sort((a, b) => {
            const valA = a[col];
            const valB = b[col];
            if (valA === valB) return 0;
            return ascending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
          });
          return builder;
        },
        single() {
          return Promise.resolve({ data: currentRows[0] || null, error: null });
        },
        then(resolve) {
          return Promise.resolve({ data: currentRows, error: null }).then(resolve);
        },
      };
      return builder;
    },
  };
}

let clientInstance;
if (isConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn("[Al Madina] Failed to initialize Supabase, using mock fallback:", err);
    clientInstance = createMockSupabaseClient();
  }
} else {
  console.info("[Al Madina] Supabase env vars not found; using local mock storage client.");
  clientInstance = createMockSupabaseClient();
}

export const isSupabaseConfigured = isConfigured;
export const supabase = clientInstance;

