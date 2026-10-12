import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Cart Context
// Shared cart across Navbar, Menu, and Cart page.
// Syncs with localStorage and Supabase "carts" table.
// ============================================================

const CartContext = createContext(null);
const STORAGE_KEY = "am_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    // Sync to Supabase carts table
    try {
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      supabase
        .from("carts")
        .upsert({
          id: "cart_active_session",
          customer_identifier: "active_customer",
          items: items,
          total: total,
          updated_at: new Date().toISOString(),
        })
        .catch?.((err) => console.warn("[CartContext] Supabase sync note:", err));
    } catch {}
  }, [items]);

  const addToCart = (item, quantityToAdd = 1) => {
    const qty = Math.max(1, Number(quantityToAdd) || 1);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Usage in any component: const { items, addToCart, cartCount } = useCart();
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a <CartProvider>");
  return ctx;
}