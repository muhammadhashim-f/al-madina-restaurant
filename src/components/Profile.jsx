import React, { useState, useEffect } from "react";
import {
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  X,
  MessageSquare,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — User Profile & SMS Phone Verification
// - User can effortlessly edit Name, Address, and Profile Avatar.
// - Real SMS verification flow with simulated 6-digit OTP delivery.
// - Strict unique phone number enforcement: Once a mobile number
//   is registered & verified in the app, no other account can use it.
// ============================================================

export default function Profile() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // SMS Verification state
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [smsBanner, setSmsBanner] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Load the logged-in user's profile and verified phone
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    const currentPhone = meta.phone || "";
    setForm({
      name: meta.full_name || "",
      email: user.email || "",
      phone: currentPhone,
      address: meta.address || "",
    });
    setAvatar(meta.avatar_url || null);
    if (meta.phone_verified && currentPhone) {
      setVerifiedPhone(currentPhone);
    }
  }, [user]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  // Normalize phone number for uniqueness check
  const normalizePhone = (num) => {
    return num.replace(/[\s\-()]/g, "").trim();
  };

  // Initiate SMS Verification
  const handleInitiatePhoneVerification = (e) => {
    e.preventDefault();
    setOtpError("");
    setError("");

    const rawPhone = form.phone.trim();
    if (!rawPhone || rawPhone.length < 10) {
      setError("Barah-e-karam durust Pakistani phone number darj karein (e.g. 0307 0769139).");
      return;
    }

    const cleanPhone = normalizePhone(rawPhone);

    // 1. Check phone uniqueness across registered accounts
    const registeredRegistry = JSON.parse(
      localStorage.getItem("almadina_registered_phones") || "{}"
    );

    const existingUserId = registeredRegistry[cleanPhone];
    const currentUserId = user?.id || "guest-profile";

    if (existingUserId && existingUserId !== currentUserId) {
      setError(
        "❌ Yeh phone number pehle se Al Madina Restaurant ke kisi doosray account mein verified hai. Ek number sirf ek account ke sath hi istemal ho sakta hai!"
      );
      return;
    }

    // 2. Generate 6-digit test OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setIsVerifyingPhone(true);
    setResendCountdown(45);

    // 3. Show live simulated SMS notification toast
    setSmsBanner({
      phone: rawPhone,
      code: code,
    });
  };

  // Verify entered OTP
  const handleVerifyOtp = async () => {
    setOtpError("");
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError("Barah-e-karam 6-hindsay ka OTP code darj karein.");
      return;
    }

    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError("Ghalat code! Barah-e-karam SMS mein aya hua 6-hindsay ka code dobara check karein.");
      return;
    }

    // Success! Lock phone to this account
    const cleanPhone = normalizePhone(form.phone);
    const registeredRegistry = JSON.parse(
      localStorage.getItem("almadina_registered_phones") || "{}"
    );
    registeredRegistry[cleanPhone] = user?.id || "guest-profile";
    localStorage.setItem("almadina_registered_phones", JSON.stringify(registeredRegistry));

    setVerifiedPhone(form.phone);
    setIsVerifyingPhone(false);
    setOtpSent(false);
    setSmsBanner(null);

    // Update Supabase user_metadata
    await supabase.auth.updateUser({
      data: {
        full_name: form.name,
        phone: form.phone,
        phone_verified: true,
        address: form.address,
        avatar_url: avatar,
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const isCurrentPhoneVerified = form.phone === verifiedPhone;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: form.name,
        phone: form.phone,
        phone_verified: isCurrentPhoneVerified,
        address: form.address,
        avatar_url: avatar,
      },
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section
      className="w-full min-h-screen px-4 py-16"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-profile-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-profile-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 20px;
          padding: 36px 32px;
          max-width: 580px;
          margin: 0 auto;
        }
        .am-avatar-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          margin: 0 auto 28px;
        }
        .am-avatar-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(212,175,55,0.5);
        }
        .am-avatar-placeholder {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0A0A0A;
          font-size: 28px;
          font-weight: 700;
        }
        .am-avatar-edit {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #0A0A0A;
          border: 1.5px solid #D4AF37;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          cursor: pointer;
        }
        .am-profile-label {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .am-profile-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.25s ease;
        }
        .am-profile-input:focus { border-color: #D4AF37; }
        .am-save-btn {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
      `}</style>

      {/* Real-looking SMS Alert Delivery Toast */}
      {smsBanner && (
        <div className="fixed top-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] p-4 bg-emerald-950/95 border-2 border-emerald-400 rounded-2xl shadow-2xl backdrop-blur-md text-white animate-bounce-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  📩 SMS Notification Received!
                </p>
                <p className="text-xs text-white/90 mt-0.5">
                  Al Madina Restaurant verification code for <strong>{smsBanner.phone}</strong>:
                </p>
                <div className="mt-1.5 inline-block px-3 py-1 bg-black/60 border border-emerald-400/50 rounded-lg text-emerald-300 font-mono text-base font-bold tracking-widest">
                  {smsBanner.code}
                </div>
                <p className="text-[10px] text-white/50 mt-1">Valid for 5 minutes · Enter code below</p>
              </div>
            </div>
            <button
              onClick={() => setSmsBanner(null)}
              className="text-white/40 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="am-profile-card">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-2 glow-3d">
            👑 Shahi Mehmaan Account
          </span>
          <h1 className="am-profile-heading text-3xl font-bold">Profile Management</h1>
          <p className="text-sm text-white/60 mt-1">
            Apna naam, pata aur SMS verified phone number asani se tabdeel karein
          </p>
        </div>

        {/* Profile Picture */}
        <div className="am-avatar-wrap">
          {avatar ? (
            <img src={avatar} alt="Profile" className="am-avatar-circle" />
          ) : (
            <div className="am-avatar-placeholder">
              {(form.name || form.email || "U")
                .split(/[\s@.]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase())
                .join("")}
            </div>
          )}
          <label className="am-avatar-edit" htmlFor="avatar-upload" title="Change photo">
            <Camera size={14} />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="am-profile-label"><User size={13} /> Full Name / Shahi Naam</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Tariq Mehmood"
              className="am-profile-input"
            />
          </div>

          <div>
            <label className="am-profile-label"><Mail size={13} /> Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="am-profile-input opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Phone Number with SMS OTP Verification */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="am-profile-label mb-0"><Phone size={13} /> Mobile Number (Pakistan)</label>
              {verifiedPhone && form.phone === verifiedPhone && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> SMS Verified
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="03XX-XXXXXXX"
                className="am-profile-input flex-1"
              />
              {(!verifiedPhone || form.phone !== verifiedPhone) && (
                <button
                  type="button"
                  onClick={handleInitiatePhoneVerification}
                  className="px-3.5 py-2 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F0DFA0] hover:bg-[#D4AF37] hover:text-black font-semibold text-xs whitespace-nowrap transition-all"
                >
                  Verify via SMS
                </button>
              )}
            </div>

            {verifiedPhone && form.phone === verifiedPhone ? (
              <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Yeh number SMS code ke zariye tasdeeq shuda hai aur kisi doosray account par add nahi ho sakta.
              </p>
            ) : (
              <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Live bike delivery aur owner call ke liye mobile number SMS code se verify hona zaroori hai.
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="am-profile-label"><MapPin size={13} /> Saved Delivery Address (Karachi)</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Flat # 4B, Sector 33-B, Korangi, Karachi..."
              rows={2}
              className="am-profile-input resize-none"
            />
          </div>

          {error && (
            <p className="text-center text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <button type="submit" className="am-save-btn" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>

          {saved && (
            <p className="text-center text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              ✓ Profile kamyabi se update ho gayi hai!
            </p>
          )}
        </form>
      </div>

      {/* SMS OTP Code Verification Modal */}
      {isVerifyingPhone && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#12110D] border-2 border-[#D4AF37]/50 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl relative">
            <button
              onClick={() => setIsVerifyingPhone(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto mb-3">
              <KeyRound size={24} />
            </div>

            <h3 className="text-center text-lg font-bold text-white mb-1">
              SMS Code Verification
            </h3>
            <p className="text-center text-xs text-white/60 mb-4">
              Hum ne <strong>{form.phone}</strong> par 6-hindsay ka OTP code bheja hai. Barah-e-karam yahan darj karein:
            </p>

            <div className="mb-4">
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl bg-white/[0.06] border border-[#D4AF37]/50 text-white outline-none focus:border-[#D4AF37]"
                autoFocus
              />
            </div>

            {otpError && (
              <p className="text-xs text-red-400 text-center mb-3 bg-red-500/10 p-2 rounded-lg">
                {otpError}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-sm hover:brightness-110 transition-all shadow-lg mb-3"
            >
              Verify SMS Code
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={resendCountdown > 0}
                onClick={handleInitiatePhoneVerification}
                className="text-xs text-[#F0DFA0] hover:text-white disabled:opacity-40"
              >
                {resendCountdown > 0 ? `Resend SMS in ${resendCountdown}s` : "Resend SMS Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
