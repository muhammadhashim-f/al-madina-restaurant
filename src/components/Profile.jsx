import React, { useState, useEffect } from "react";
import { Camera, User, Phone, Mail, MapPin, Save, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — User Profile Page
// Matches theme: black background, gold accents, white text.
// Loads and saves real data on the logged-in Supabase user
// (stored in user_metadata). Profile picture is stored as a
// base64 data URL in user_metadata for now (small images only).
// ============================================================

export default function Profile() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load the logged-in user's real data whenever it becomes available
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    setForm({
      name: meta.full_name || "",
      email: user.email || "",
      phone: meta.phone || "",
      address: meta.address || "",
    });
    setAvatar(meta.avatar_url || null);
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Name, phone, address and avatar are saved to Supabase user_metadata.
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: form.name,
        phone: form.phone,
        address: form.address,
        avatar_url: avatar,
      },
    });

    setSaving(false);

    if (error) {
      setError(error.message);
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
          border-radius: 16px;
          padding: 36px 32px;
          max-width: 560px;
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

      <div className="am-profile-card">
        <h1 className="am-profile-heading text-2xl font-bold text-center mb-1">My Profile</h1>
        <p className="text-center text-sm mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
          Manage your personal information
        </p>

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
          <label className="am-avatar-edit" htmlFor="avatar-upload">
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
            <label className="am-profile-label"><User size={13} /> Full name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="am-profile-input" />
          </div>
          <div>
            <label className="am-profile-label"><Mail size={13} /> Email address</label>
            <input type="email" name="email" value={form.email} disabled className="am-profile-input opacity-60 cursor-not-allowed" />
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Email can't be changed here for security reasons.
            </p>
          </div>
          <div>
            <label className="am-profile-label"><Phone size={13} /> Phone number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="am-profile-input" />
          </div>
          <div>
            <label className="am-profile-label"><MapPin size={13} /> Saved address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="am-profile-input resize-none" />
          </div>

          {error && (
            <p className="text-center text-sm" style={{ color: "#E8846A" }}>{error}</p>
          )}

          <button type="submit" className="am-save-btn" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved && (
            <p className="text-center text-sm" style={{ color: "#D4AF37" }}>
              Profile updated successfully.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}