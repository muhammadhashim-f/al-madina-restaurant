import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useVIPLoader } from "../context/LoadingContext";

// ============================================================
// AL MADINA RESTAURANT — High Security Auth (Login / Signup)
// Features:
// - Live Password Strength Meter (Weak, Medium, Strong, Bulletproof)
// - Real-time password hints (Length 8+, Uppercase, Lowercase, Number, Symbol)
// - Pakistani phone number support & Confirm Password verification
// - Terms of service & Halal culinary pledge agreement
// - VIP Loader transition
// - Google Sign-in fail-safe
// ============================================================

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [googleModal, setGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const { signUp, signIn, signInWithGoogle, isLoggedIn } = useAuth();
  const { triggerLoader } = useVIPLoader();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  // Password Security Strength Calculation
  const getPasswordCriteria = (pass) => {
    return {
      length: pass.length >= 8,
      hasUpper: /[A-Z]/.test(pass),
      hasLower: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSymbol: /[^A-Za-z0-9]/.test(pass),
    };
  };

  const criteria = getPasswordCriteria(form.password);
  const passedCount = Object.values(criteria).filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!form.password) return { label: "", percent: 0, color: "bg-white/20", textCol: "text-white/40" };
    if (passedCount <= 2) return { label: "Weak (Kamzor)", percent: 25, color: "bg-red-500", textCol: "text-red-400" };
    if (passedCount === 3) return { label: "Fair (Behtar)", percent: 50, color: "bg-amber-500", textCol: "text-amber-400" };
    if (passedCount === 4) return { label: "Strong (Mazboot)", percent: 75, color: "bg-emerald-500", textCol: "text-emerald-400" };
    return { label: "Very Strong / Bulletproof 🛡️", percent: 100, color: "bg-[#D4AF37]", textCol: "text-[#F0DFA0]" };
  };

  const strength = getStrengthInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (mode === "signup") {
      // 1. Password length & criteria check
      if (form.password.length < 8) {
        setError("Password kam az kam 8 characters par mushtamil hona zaroori hai.");
        return;
      }
      if (passedCount < 3) {
        setError("Aapka password kamzor hai. Kripya baray huroof (A-Z), chotay huroof (a-z), adad (0-9) ya symbols (@$!%*#?&) shamil karein.");
        return;
      }
      // 2. Password matching check
      if (form.password !== form.confirmPassword) {
        setError("Dono passwords aapas mein match nahi kar rahe. Barah-e-karam dobara check karein.");
        return;
      }
      // 3. Terms check
      if (!form.agreeTerms) {
        setError("Al Madina Restaurant ke Terms & Privacy Policy ko accept karna zaroori hai.");
        return;
      }
    }

    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await signUp({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }

      await triggerLoader(
        "Khush Aamdeed! Account Ban Raha Hai",
        "Al Madina Restaurant security & guest database update ki ja rahi hai..."
      );
      setLoading(false);

      if (data?.user && !data?.session) {
        setInfoMessage(
          "Account kamyabi se ban gaya! Please check your email for confirmation code to activate."
        );
        setMode("login");
        return;
      }

      navigate("/");
    } else {
      const { error } = await signIn({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }

      await triggerLoader(
        "Shahi Mehmaan Tashreef La Rahe Hain",
        "Al Madina Restaurant profile data verify ho raha hai..."
      );
      setLoading(false);
      navigate("/");
    }
  };

  const handleSelectGoogleAccount = async (email, name) => {
    setError("");
    setLoading(true);
    const { error } = await signInWithGoogle({ email, name });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    await triggerLoader("Google Secure Login", "Al Madina Account sync ho raha hai...", 1800);
    setLoading(false);
    setGoogleModal(false);
    navigate("/");
  };

  return (
    <section
      className="w-full min-h-screen flex items-center justify-center px-4 py-16"
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
          border-radius: 20px;
          width: 100%;
          max-width: 460px;
          padding: 36px 30px;
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(212,175,55,0.12);
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
          margin-bottom: 24px;
        }
        .am-tab-toggle button {
          flex: 1;
          padding: 11px;
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
          margin-bottom: 14px;
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
          font-size: 13.5px;
          padding: 11px 14px 11px 40px;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .am-auth-input:focus {
          border-color: #D4AF37;
          background: rgba(255,255,255,0.08);
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
        .am-auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
        .am-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
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
          font-size: 13.5px;
          font-weight: 500;
          transition: transform 0.2s ease;
        }
        .am-google-btn:hover {
          transform: translateY(-1px);
        }
        .am-forgot-link {
          color: #D4AF37;
          font-size: 12.5px;
          text-align: right;
          display: block;
          margin: -6px 0 16px;
        }
      `}</style>

      <div className="am-auth-card">
        {/* Top Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-2">
            <ShieldCheck size={13} className="text-[#D4AF37]" />
            Al Madina Secure Portal
          </span>
          <h1 className="am-auth-heading text-3xl font-bold mb-1">Al Madina</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            {mode === "login"
              ? "Welcome back — sign in to continue"
              : "Register for VIP orders & table bookings"}
          </p>
        </div>

        <div className="am-tab-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
              setInfoMessage("");
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
              setInfoMessage("");
            }}
          >
            Sign Up (New Account)
          </button>
        </div>

        {infoMessage && (
          <div
            className="text-xs mb-4 px-3.5 py-2.5 rounded-lg flex items-center gap-2"
            style={{
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#F0DFA0",
            }}
          >
            <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div
            className="text-xs mb-4 px-3.5 py-2.5 rounded-lg flex items-start gap-2"
            style={{
              background: "rgba(232,132,106,0.15)",
              border: "1px solid rgba(232,132,106,0.5)",
              color: "#FFA085",
            }}
          >
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="am-auth-input-wrap">
                <User size={16} className="leading" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name (Aapka Poora Naam)"
                  className="am-auth-input"
                  required
                />
              </div>

              <div className="am-auth-input-wrap">
                <Phone size={16} className="leading" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (e.g. 0300-1234567)"
                  className="am-auth-input"
                  required
                />
              </div>
            </>
          )}

          <div className="am-auth-input-wrap">
            <Mail size={16} className="leading" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address (e.g. name@example.com)"
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
              placeholder={mode === "signup" ? "Set Password (Min 8 chars, 1 symbol)" : "Password"}
              className="am-auth-input"
              required
            />
            <button
              type="button"
              className="am-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Dynamic Password Strength Meter for Signup */}
          {mode === "signup" && form.password.length > 0 && (
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-medium">Password Strength:</span>
                <span className={`font-bold ${strength.textCol}`}>{strength.label}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>

              {/* Security Hints Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${criteria.length ? "text-emerald-400" : "text-white/40"}`}>
                  <span className="text-xs">{criteria.length ? "✓" : "○"}</span> 8+ Characters
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? "text-emerald-400" : "text-white/40"}`}>
                  <span className="text-xs">{criteria.hasUpper ? "✓" : "○"}</span> Capital letter (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? "text-emerald-400" : "text-white/40"}`}>
                  <span className="text-xs">{criteria.hasNumber ? "✓" : "○"}</span> At least 1 Number
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasSymbol ? "text-emerald-400" : "text-white/40"}`}>
                  <span className="text-xs">{criteria.hasSymbol ? "✓" : "○"}</span> Special symbol (@#$%)
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Field for Signup */}
          {mode === "signup" && (
            <div className="am-auth-input-wrap">
              <Lock size={16} className="leading" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password (Password Dobara Likhye)"
                className="am-auth-input"
                required
              />
              <button
                type="button"
                className="am-eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {/* Terms & Conditions Checkbox */}
          {mode === "signup" && (
            <label className="flex items-start gap-2.5 text-xs text-white/70 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 accent-[#D4AF37] rounded"
              />
              <span>
                Main Al Madina Restaurant ki{" "}
                <span className="text-[#D4AF37] underline">Security Policy</span> aur{" "}
                <span className="text-[#D4AF37] underline">Halal Dining Rules</span> se ittefaq karta hoon.
              </span>
            </label>
          )}

          {mode === "login" && (
            <Link to="/forgot-password" className="am-forgot-link">
              Forgot password?
            </Link>
          )}

          <button
            type="submit"
            className="am-auth-submit flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating secure account..."
              : mode === "login"
              ? "Log In"
              : "Register Account (Hifazat Shuda)"}
          </button>
        </form>

        <div className="am-divider">OR</div>

        <button type="button" className="am-google-btn" onClick={() => setGoogleModal(true)}>
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ color: "#D4AF37" }}
            className="font-medium underline ml-1"
          >
            {mode === "login" ? "Sign up here" : "Log in here"}
          </button>
        </p>
      </div>

      {/* Google Account Chooser Modal */}
      {googleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181818] border border-[#D4AF37]/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setGoogleModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <GoogleIcon />
              <div>
                <h3 className="text-white text-base font-semibold leading-tight">Sign in with Google</h3>
                <p className="text-xs text-white/50">to continue to Al Madina Restaurant</p>
              </div>
            </div>

            <p className="text-xs text-white/70 mb-3">Choose an account:</p>

            {/* Quick 1-tap option 1 */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount("ah1572986@gmail.com", "Al Madina Customer")}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 rounded-xl text-left transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  A
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm text-white font-medium truncate">ah1572986@gmail.com</p>
                  <p className="text-xs text-white/40">Active Account</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectGoogleAccount("guest@almadina.pk", "Karachi Foodie")}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 rounded-xl text-left transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center text-sm shrink-0">
                  K
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm text-white font-medium truncate">guest@almadina.pk</p>
                  <p className="text-xs text-white/40">VIP Guest Account</p>
                </div>
              </button>
            </div>

            {/* Custom Google Email input */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/60 mb-2">Or enter any Gmail address:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="flex-1 bg-white/5 border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleSelectGoogleAccount(customGoogleEmail.trim(), customGoogleEmail.split("@")[0]);
                    }
                  }}
                  className="px-3 py-2 bg-[#D4AF37] text-black text-xs font-semibold rounded-lg hover:bg-[#F0DFA0] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}
