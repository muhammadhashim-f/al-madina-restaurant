import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Reservations Context
// Stores VIP Table Reservations & syncs with Supabase table "reservations".
// Default status is 'pending' until restaurant owner confirms.
// ============================================================

const ReservationsContext = createContext(null);
const STORAGE_KEY = "am_reservations";

const INITIAL_DEMO_RESERVATIONS = [
  {
    id: "RES-91823",
    name: "Tariq Mehmood",
    phone: "03001234567",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
    time: "20:30",
    guests: 4,
    notes: "VIP Family Hall, Window Side Table with baby chair.",
    status: "confirmed", // 'pending' | 'confirmed' | 'cancelled'
    createdAt: new Date().toISOString(),
  },
];

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_RESERVATIONS;
    } catch {
      return INITIAL_DEMO_RESERVATIONS;
    }
  });

  // Load from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseReservations = async () => {
      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped = data.map((d) => ({
            id: String(d.id),
            name: d.name,
            phone: d.phone,
            date: d.date,
            time: d.time,
            guests: Number(d.guests || 2),
            notes: d.notes || "",
            status: d.status || "pending",
            createdAt: d.created_at || new Date().toISOString(),
          }));
          setReservations(mapped);
        }
      } catch (err) {
        console.warn("[ReservationsContext] Supabase fetch fallback:", err);
      }
    };

    fetchSupabaseReservations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (booking) => {
    const id = booking.id || `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
      id,
      name: booking.name,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      guests: Number(booking.guests || 2),
      notes: booking.notes || "",
      status: booking.status || "pending", // Starts as pending owner approval!
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newBooking, ...prev]);

    // Async sync to Supabase
    try {
      supabase
        .from("reservations")
        .insert({
          name: newBooking.name,
          phone: newBooking.phone,
          date: newBooking.date,
          time: newBooking.time,
          guests: newBooking.guests,
          notes: newBooking.notes,
          status: newBooking.status,
        })
        .catch?.((e) => console.warn("[ReservationsContext] Supabase insert note:", e));
    } catch {}

    return newBooking;
  };

  const updateReservationStatus = (id, newStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    try {
      supabase
        .from("reservations")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .catch?.((e) => console.warn("[ReservationsContext] Supabase update note:", e));
    } catch {}
  };

  const updateReservationDetails = (id, fields) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...fields } : r))
    );

    try {
      supabase
        .from("reservations")
        .update({
          ...fields,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .catch?.((e) => console.warn("[ReservationsContext] Supabase update details note:", e));
    } catch {}
  };

  const deleteReservation = (id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));

    try {
      supabase
        .from("reservations")
        .delete()
        .eq("id", id)
        .catch?.((e) => console.warn("[ReservationsContext] Supabase delete note:", e));
    } catch {}
  };

  return (
    <ReservationsContext.Provider
      value={{
        reservations,
        addReservation,
        updateReservationStatus,
        updateReservationDetails,
        deleteReservation,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error("useReservations must be used inside <ReservationsProvider>");
  return ctx;
}
