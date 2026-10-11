import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, MessageSquare, CalendarCheck, Clock3, ArrowRight } from "lucide-react";
import { useReservations } from "../context/ReservationsContext";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — Reservations Page
// Connected with ReservationsContext & Supabase "reservations" table.
// Default status is 'pending' until approved by restaurant owner.
// ============================================================

export default function Reservations() {
  const { addReservation } = useReservations();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    notes: "",
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) return;

    const saved = addReservation({
      name: form.name.trim(),
      phone: form.phone.trim(),
      date: form.date,
      time: form.time,
      guests: Number(form.guests || 2),
      notes: form.notes.trim(),
      status: "pending",
    });

    setConfirmedBooking(saved);
  };

  if (confirmedBooking) {
    const waText = encodeURIComponent(
      `Assalam o Alaikum! Mene Al Madina Restaurant mein Table Booking karwai hai:\nBooking ID: ${confirmedBooking.id}\nNaam: ${confirmedBooking.name}\nDate: ${confirmedBooking.date}\nWaqt: ${confirmedBooking.time}\nMehmaan: ${confirmedBooking.guests} afraad\nStatus: Pending Approval\nMeherbani farma kar table confirm farma dein.`
    );
    const waUrl = `https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}?text=${waText}`;

    return (
      <section
        id="reservations"
        className="w-full min-h-screen flex items-center justify-center px-4 py-16"
        style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
      >
        <div className="text-center max-w-lg bg-[#14120E] border border-[#D4AF37]/35 rounded-2xl p-8 shadow-2xl animate-fade-in">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.5)" }}
          >
            <Clock3 size={30} className="text-[#D4AF37] animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
            Booking Status: ⏳ Pending Owner Approval
          </div>

          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Amiri', serif" }}>
            Table Booking Request Received!
          </h2>

          <p className="text-xs text-white/75 mb-5 leading-relaxed">
            Shukriya <strong>{confirmedBooking.name}</strong>! Aapki table booking ({confirmedBooking.guests} afraad, {confirmedBooking.date} ko {confirmedBooking.time} baje) Al Madina Restaurant ke database mein receive ho gayi hai.
            <br /><br />
            <span className="text-[#F0DFA0] bg-white/5 p-2 rounded-lg block border border-white/10">
              Note: Pehle yeh booking <strong>Pending</strong> rahegi. Jaise hi restaurant owner check kar ke <strong>OK</strong> karenge, yeh status <strong>Confirmed</strong> ho jayega. Aap Order History mein apni tamam booking details live dekh sakte hain.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all"
            >
              <CalendarCheck size={14} /> Booking History Dekhein <ArrowRight size={13} />
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-black text-xs font-bold hover:bg-[#1EBE5D] transition-all"
            >
              <MessageSquare size={14} /> Owner WhatsApp Rabta
            </a>
          </div>

          <button
            onClick={() => {
              setConfirmedBooking(null);
              setForm({ name: "", phone: "", date: "", time: "", guests: 2, notes: "" });
            }}
            className="mt-6 text-xs text-white/50 hover:text-white underline cursor-pointer"
          >
            Nayi Table Book Karein
          </button>
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

      <div className="am-res-card card-3d">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F0DFA0] mb-2 glow-3d">
            🍽️ Shahi Dawat Booking — Table Mehfooz Farmayein
          </span>
          <h1 className="am-res-heading text-2xl sm:text-3xl font-bold">Reserve Your Royal Table</h1>
          <p className="text-sm text-white/60 mt-1">
            Hum aapke aur aapki family ke liye behtareen table mehfooz rakhenge
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="am-res-label">Full name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Hakim Bhai"
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
              placeholder="03070769139"
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