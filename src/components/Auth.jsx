import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ============================================================
// AL MADINA RESTAURANT — Auth Page (Login / Signup)
// Matches theme: black background, gold accents, white text.
// Connected to real Supabase Auth: email/password signup+login,
// email confirmation (OTP-style), and Google sign-in.
// ============================================================

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const { signUp, signIn, signInWithGoogle, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await signUp(form);
      setLoading(false);

      if (error) {
        // Supabase returns a clear error if the email is already registered
        setError(error.message);
        return;
      }

      // If email confirmation is ON in Supabase, there is no session yet —
      // the user must check their inbox for the confirmation code/link.
      if (data?.user && !data?.session) {
        setInfoMessage(
          "Account created! Please check your email for a confirmation code from Al Madina Restaurant to activate your account."
        );
        setMode("login");
        return;
      }

      // If email confirmation is OFF, Supabase logs the user in immediately.
      navigate("/");
    } else {
      const { error } = await signIn(form);
      setLoading(false);

      if (error) {
        // Covers: wrong password, no account with this email, or
        // email not confirmed yet — Supabase enforces all of this.
        setError(error.message);
        return;
      }

      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    // On success, Supabase redirects to Google's account picker itself.
  };

  return (
    <section
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-auth-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          padding: 40px 32px;
        }
        .am-auth-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-tab-toggle {
          display: flex;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .am-tab-toggle button {
          flex: 1;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          transition: all 0.25s ease;
        }
        .am-tab-toggle button.active {
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          font-weight: 600;
        }
        .am-auth-input-wrap {
          position: relative;
          margin-bottom: 16px;
        }
        .am-auth-input-wrap svg.leading {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
        }
        .am-auth-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px 11px 40px;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.25s ease;
        }
        .am-auth-input:focus {
          border-color: #D4AF37;
        }
        .am-auth-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .am-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.5);
        }
        .am-auth-submit {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
        .am-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
        }
        .am-divider::before, .am-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }
        .am-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #FFFFFF;
          color: #1C1B19;
          padding: 11px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: transform 0.2s ease;
        }
        .am-google-btn:hover {
          transform: translateY(-1px);
        }
        .am-forgot-link {
          color: #D4AF37;
          font-size: 13px;
          text-align: right;
          display: block;
          margin: -8px 0 16px;
        }
      `}</style>

      <div className="am-auth-card">
        <h1 className="am-auth-heading text-2xl font-bold text-center mb-1">Al Madina</h1>
        <p className="text-center text-sm mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
          {mode === "login" ? "Welcome back — sign in to continue" : "Create an account to get started"}
        </p>

        <div className="am-tab-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setError(""); setInfoMessage(""); }}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => { setMode("signup"); setError(""); setInfoMessage(""); }}
          >
            Sign Up
          </button>
        </div>

        {infoMessage && (
          <div
            className="text-xs mb-4 px-3 py-2 rounded-md"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)", color: "#F0DFA0" }}
          >
            {infoMessage}
          </div>
        )}

        {error && (
          <div
            className="text-xs mb-4 px-3 py-2 rounded-md"
            style={{ background: "rgba(232,132,106,0.12)", border: "1px solid rgba(232,132,106,0.4)", color: "#E8846A" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="am-auth-input-wrap">
              <User size={16} className="leading" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="am-auth-input"
                required
              />
            </div>
          )}

          <div className="am-auth-input-wrap">
            <Mail size={16} className="leading" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="am-auth-input"
              required
            />
          </div>

          <div className="am-auth-input-wrap">
            <Lock size={16} className="leading" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="am-auth-input"
              required
            />
            <button type="button" className="am-eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "login" && (
            <Link to="/forgot-password" className="am-forgot-link">Forgot password?</Link>
          )}

          <button type="submit" className="am-auth-submit flex items-center justify-center gap-2" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? (mode === "login" ? "Logging in..." : "Creating account...")
              : (mode === "login" ? "Log In" : "Create Account")}
          </button>
        </form>

        <div className="am-divider">OR</div>

        <button type="button" className="am-google-btn" onClick={handleGoogleLogin}>
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ color: "#D4AF37" }}
            className="font-medium"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.2 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.2 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 34.5 27 35 24 35c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.9l6.5 5.5C41.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}