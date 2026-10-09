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

const INITIAL_DEMO_ORDERS = [
  {
    id: "AM-849201",
    placedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "out_for_delivery",
    fulfillment: "delivery",
    paymentMethod: "cod",
    customer: {
      name: "Muhammad Bilal",
      phone: "+92 321 9876543",
      address: "Sector 36-B, Korangi, Karachi",
    },
    items: [
      { id: 4, name: "Chicken Biryani", price: 850, quantity: 2 },
      { id: 3, name: "Mutton Karahi", price: 1450, quantity: 1 },
    ],
    total: 3300,
    deliveryLocation: { lat: 24.8385, lng: 67.1425 },
  },
];

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ORDERS;
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    const newOrder = {
      id: `AM-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      status: "awaiting_approval", // Default: Awaiting owner WhatsApp confirmation
      ...order,
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside an <OrdersProvider>");
  return ctx;
}