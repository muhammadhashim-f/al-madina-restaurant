import React, { createContext, useContext, useState, useEffect } from "react";

// ============================================================
// AL MADINA RESTAURANT — Reviews Context
// Stores customer reviews (name, rating, comment). Persisted to
// localStorage for now — will move to a Supabase "reviews" table
// (with admin moderation) once the backend is connected.
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
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, averageRating }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside a <ReviewsProvider>");
  return ctx;
}