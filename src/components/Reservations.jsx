import React, { useState } from "react";
import { Calendar, Clock, Users, MessageSquare, CalendarCheck } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Reservations Page
// Matches theme: black background, gold accents, white text.
// Form is UI-only for now — will write to a Supabase
// "reservations" table once the backend is connected.
// ============================================================

export default function Reservations() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    notes: "",
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) return;
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <section
        id="reservations"
        className="w-full min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}
          >
            <CalendarCheck size={26} style={{ color: "#D4AF37" }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Amiri', serif" }}>
            Table reserved
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
            {form.name}, your table for {form.guests} on {form.date} at {form.time} is booked.
            A confirmation will be sent to your phone shortly.
          </p>
          <button
            onClick={() => { setConfirmed(false); setForm({ name: "", phone: "", date: "", time: "", guests: 2, notes: "" }); }}
            className="am-res-btn px-6 py-2.5 rounded-md text-sm font-semibold"
          >
            Make another reservation
          </button>
          <style>{`.am-res-btn { background: linear-gradient(135deg, #D4AF37, #F0DFA0); color: #0A0A0A; }`}</style>
        </div>
      </section>
    );
  }

  return (
    <section
      id="reservations"
      className="w-full min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-res-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          padding: 40px 32px;
        }
        .am-res-heading {
          font-family: 'Amiri', serif;
          color: #FFFFFF;
        }
        .am-res-label {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .am-res-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 14px;
          padding: 11px 14px;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.25s ease;
          color-scheme: dark;
        }
        .am-res-input:focus {
          border-color: #D4AF37;
        }
        .am-res-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .am-guest-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 8px;
          padding: 8px 14px;
        }
        .am-guest-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: rgba(212,175,55,0.15);
          color: #D4AF37;
          font-size: 16px;
          font-weight: 600;
        }
        .am-res-submit {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F0DFA0 100%);
          color: #0A0A0A;
          font-weight: 600;
          padding: 13px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 6px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-res-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.35);
        }
      `}</style>

      <div className="am-res-card">
        <h1 className="am-res-heading text-2xl font-bold text-center mb-1">Reserve a table</h1>
        <p className="text-center text-sm mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
          We'll hold your table — just fill in the details below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="am-res-label">Full name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ayesha Khan"
              className="am-res-input"
              required
            />
          </div>

          <div>
            <label className="am-res-label">Phone number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="03XX-XXXXXXX"
              className="am-res-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="am-res-label"><Calendar size={13} /> Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="am-res-input"
                required
              />
            </div>
            <div>
              <label className="am-res-label"><Clock size={13} /> Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="am-res-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="am-res-label"><Users size={13} /> Number of guests</label>
            <div className="am-guest-stepper">
              <button
                type="button"
                className="am-guest-btn"
                onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
              >
                −
              </button>
              <span className="text-white text-sm font-medium">{form.guests} {form.guests === 1 ? "guest" : "guests"}</span>
              <button
                type="button"
                className="am-guest-btn"
                onClick={() => setForm({ ...form, guests: Math.min(20, form.guests + 1) })}
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="am-res-label"><MessageSquare size={13} /> Special requests (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Birthday, window seat, dietary needs..."
              rows={3}
              className="am-res-input resize-none"
            />
          </div>

          <button type="submit" className="am-res-submit">
            Confirm reservation
          </button>
        </form>
      </div>
    </section>
  );
}