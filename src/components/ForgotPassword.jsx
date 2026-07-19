import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Forgot Password / Reset Flow
// Matches theme: black background, gold accents, white text.
// UI-only for now — real email sending + token verification
// will be wired to Supabase Auth once the backend is connected.
// ============================================================

export default function ForgotPassword() {
  const [step, setStep] = useState("request"); // "request" | "sent" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequestReset = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep("sent");
  };

  // In a real flow this screen only appears after the user clicks the
  // reset link from their email — shown here directly so it can be tested.
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setStep("done");
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
        .am-fp-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          padding: 40px 32px;
        }
        .am-fp-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-fp-input-wrap { position: relative; margin-bottom: 16px; }
        .am-fp-input-wrap svg.leading {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
        }
        .am-fp-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px 11px 40px;
          border-radius: 8px;
          outline: none;
        }
        .am-fp-input:focus { border-color: #D4AF37; }
        .am-fp-input::placeholder { color: rgba(255,255,255,0.4); }
        .am-fp-submit {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-fp-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(212,175,55,0.35); }
        .am-fp-icon-circle {
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
      `}</style>

      <div className="am-fp-card">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
          <ArrowLeft size={14} /> Back to login
        </Link>

        {step === "request" && (
          <>
            <h1 className="am-fp-heading text-2xl font-bold text-center mb-1">Forgot password?</h1>
            <p className="text-center text-sm mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
              Enter your email and we'll send you a reset link
            </p>
            <form onSubmit={handleRequestReset}>
              <div className="am-fp-input-wrap">
                <Mail size={16} className="leading" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="am-fp-input"
                  required
                />
              </div>
              <button type="submit" className="am-fp-submit">Send reset link</button>
            </form>
          </>
        )}

        {step === "sent" && (
          <div className="text-center">
            <div className="am-fp-icon-circle">
              <Mail size={24} style={{ color: "#D4AF37" }} />
            </div>
            <h1 className="am-fp-heading text-2xl font-bold mb-2">Check your inbox</h1>
            <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.6)" }}>
              We've sent a password reset link to <span style={{ color: "#D4AF37" }}>{email}</span>
            </p>
            {/* Demo-only shortcut: normally the user clicks the emailed link to reach this step */}
            <button onClick={() => setStep("reset")} className="am-fp-submit">
              I clicked the link (demo)
            </button>
          </div>
        )}

        {step === "reset" && (
          <>
            <h1 className="am-fp-heading text-2xl font-bold text-center mb-1">Set a new password</h1>
            <p className="text-center text-sm mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
              Choose a new password for your account
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="am-fp-input-wrap">
                <Lock size={16} className="leading" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="am-fp-input"
                  required
                />
              </div>
              <button type="submit" className="am-fp-submit">Update password</button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="am-fp-icon-circle">
              <CheckCircle2 size={24} style={{ color: "#D4AF37" }} />
            </div>
            <h1 className="am-fp-heading text-2xl font-bold mb-2">Password updated</h1>
            <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.6)" }}>
              You can now log in with your new password.
            </p>
            <Link to="/login" className="am-fp-submit inline-block" style={{ textDecoration: "none" }}>
              Go to login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}