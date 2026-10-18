import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { ShieldCheck, Mail, Lock } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Admin Login
// Admin access is verified with Supabase Auth and profiles.role.
// Never ship a hardcoded admin password in the browser.
// ============================================================

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured) {
      setError("Admin login is disabled because Supabase is not configured. Configure Supabase Auth and create an admin profile first.");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError || !authData?.user) {
        setError("Login failed. Check your credentials and try again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("This account is not authorized for the admin dashboard.");
        return;
      }

      sessionStorage.setItem("am_admin_session", "true");
      navigate("/admin/dashboard");
    } catch {
      setError("Unable to verify admin access. Check Supabase configuration and try again.");
    }
  };

  return (
    <section
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <style>{`
        .am-admin-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          padding: 40px 32px;
        }
        .am-admin-input-wrap { position: relative; margin-bottom: 16px; }
        .am-admin-input-wrap svg.leading {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
        }
        .am-admin-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px 11px 40px;
          border-radius: 8px;
          outline: none;
        }
        .am-admin-input:focus { border-color: #D4AF37; }
        .am-admin-input::placeholder { color: rgba(255,255,255,0.4); }
        .am-admin-submit {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }
      `}</style>

      <div className="am-admin-card">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}
          >
            <ShieldCheck size={24} style={{ color: "#D4AF37" }} />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Authorized staff only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="am-admin-input-wrap">
            <Mail size={16} className="leading" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="am-admin-input"
              required
            />
          </div>
          <div className="am-admin-input-wrap">
            <Lock size={16} className="leading" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="am-admin-input"
              required
            />
          </div>
          {error && <p className="text-xs mb-3" style={{ color: "#E8846A" }}>{error}</p>}
          <button type="submit" className="am-admin-submit">Log in to Admin</button>
        </form>

        <p className="text-xs text-center mt-5" style={{ color: "rgba(255,255,255,0.5)" }}>
          Authorized staff accounts only. Admin access must be enabled by the project owner in Supabase.
        </p>
      </div>
    </section>
  );
}