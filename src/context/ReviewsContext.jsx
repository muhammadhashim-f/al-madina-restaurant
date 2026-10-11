import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Reviews Context
// Stores customer reviews (name, rating, comment) and syncs with
// Supabase "reviews" table.
// ============================================================

const ReviewsContext = createContext(null);
const STORAGE_KEY = "am_reviews";

const DEFAULT_REVIEWS = [
  { id: 1, name: "Sara Ahmed", rating: 5, comment: "Best biryani in Karachi, hands down. The delivery was fast too.", date: "2026-06-12" },
  { id: 2, name: "Bilal Hussain", rating: 4, comment: "Great food and cozy ambiance. Service could be a touch quicker.", date: "2026-06-20" },
  { id: 3, name: "Fatima Noor", rating: 5, comment: "The mutton karahi tastes just like home cooking. Loved it.", date: "2026-06-28" },
];

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // Fetch reviews from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped = data.map((d) => ({
            id: d.id,
            name: d.name,
            rating: Number(d.rating),
            comment: d.comment,
            date: d.date || (d.created_at ? d.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
          }));
          setReviews(mapped);
        }
      } catch (err) {
        console.warn("[ReviewsContext] Supabase fetch fallback:", err);
      }
    };

    fetchSupabaseReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (review) => {
    const newReview = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      ...review,
    };
    setReviews((prev) => [newReview, ...prev]);

    // Async sync to Supabase
    try {
      supabase
        .from("reviews")
        .insert({
          name: newReview.name,
          rating: Number(newReview.rating),
          comment: newReview.comment,
          date: newReview.date,
        })
        .catch?.((e) => console.warn("[ReviewsContext] Supabase insert note:", e));
    } catch {}
  };

  const updateReview = (id, updatedFields) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );

    try {
      supabase
        .from("reviews")
        .update({
          ...updatedFields,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .catch?.((e) => console.warn("[ReviewsContext] Supabase update note:", e));
    } catch {}
  };

  const deleteReview = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));

    try {
      supabase
        .from("reviews")
        .delete()
        .eq("id", id)
        .catch?.((e) => console.warn("[ReviewsContext] Supabase delete note:", e));
    } catch {}
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, updateReview, deleteReview, averageRating }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside a <ReviewsProvider>");
  return ctx;
}