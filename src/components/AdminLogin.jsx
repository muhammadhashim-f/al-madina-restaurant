import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Admin Login
// Demo-only auth: hardcoded credentials, session flag in
// sessionStorage. Will be replaced by real role-based Supabase
// auth (checking a "role = admin" field) once backend is wired.
// Demo login: admin@almadina.pk / admin123
// ============================================================

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "admin@almadina.pk" && password === "admin123") {
      sessionStorage.setItem("am_admin_session", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin credentials.");
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

        <p className="text-xs text-center mt-5" style={{ color: "rgba(255,255,255,0.35)" }}>
          Demo credentials: admin@almadina.pk / admin123
        </p>
      </div>
    </section>
  );
}