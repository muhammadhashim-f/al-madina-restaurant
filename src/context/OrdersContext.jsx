import React, { createContext, useContext, useState, useEffect } from "react";

// ============================================================
// AL MADINA RESTAURANT — Orders Context
// Stores placed orders so the Order History page can read them.
// Persisted to localStorage for now (this is a real project file,
// not a chat preview, so localStorage works fine here) — this will
// be replaced by a real Supabase "orders" table later.
// ============================================================

const OrdersContext = createContext(null);
const STORAGE_KEY = "am_orders";

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    const newOrder = {
      id: `AM-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      status: "Confirmed",
      ...order,
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside an <OrdersProvider>");
  return ctx;
}