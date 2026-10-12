import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Favorites (Wishlist) Context
// Lets users heart a dish in the Menu and see all saved dishes
// on the Favorites page. Syncs with localStorage and Supabase.
// ============================================================

const FavoritesContext = createContext(null);
const STORAGE_KEY = "am_favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

    // Sync to Supabase favorites table
    try {
      supabase
        .from("favorites")
        .upsert({
          id: "fav_active_session",
          customer_identifier: "active_customer",
          favorite_ids: favorites.map((f) => ({ id: f.id, name: f.name, price: f.price })),
          updated_at: new Date().toISOString(),
        })
        .catch?.((err) => console.warn("[FavoritesContext] Supabase sync note:", err));
    } catch {}
  }, [favorites]);

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const addFavorite = (item) => {
    setFavorites((prev) => (prev.some((f) => f.id === item.id) ? prev : [...prev, item]));
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const toggleFavorite = (item) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, item]
    );
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside a <FavoritesProvider>");
  return ctx;
}