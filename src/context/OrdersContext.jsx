import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Orders Context
// Stores placed orders and syncs with Supabase "orders" table.
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

  // Load from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped = data.map((d) => ({
            id: d.id,
            placedAt: d.placed_at || d.created_at,
            status: d.status,
            fulfillment: d.fulfillment || "delivery",
            paymentMethod: d.payment_method || "cod",
            customer: {
              name: d.customer_name,
              phone: d.customer_phone,
              email: d.customer_email || "",
              address: d.customer_address,
            },
            items: Array.isArray(d.items) ? d.items : [],
            total: Number(d.total || 0),
            deliveryLocation: d.delivery_location || { lat: 24.8385, lng: 67.1425 },
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.warn("[OrdersContext] Supabase fetch fallback:", err);
      }
    };

    fetchSupabaseOrders();
    return () => {
      isMounted = false;
    };
  }, []);

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

    // Async save to Supabase
    try {
      supabase
        .from("orders")
        .insert({
          id: newOrder.id,
          customer_name: newOrder.customer?.name || "Customer",
          customer_phone: newOrder.customer?.phone || "N/A",
          customer_email: newOrder.customer?.email || "",
          customer_address: newOrder.customer?.address || "Karachi",
          items: newOrder.items || [],
          total: newOrder.total || 0,
          payment_method: newOrder.paymentMethod || "cod",
          fulfillment: newOrder.fulfillment || "delivery",
          status: newOrder.status,
          delivery_location: newOrder.deliveryLocation || { lat: 24.8385, lng: 67.1425 },
          placed_at: newOrder.placedAt,
        })
        .catch?.((e) => console.warn("[OrdersContext] Supabase insert note:", e));
    } catch {}

    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    try {
      supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .catch?.((e) => console.warn("[OrdersContext] Supabase update status note:", e));
    } catch {}
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));

    try {
      supabase
        .from("orders")
        .delete()
        .eq("id", orderId)
        .catch?.((e) => console.warn("[OrdersContext] Supabase delete note:", e));
    } catch {}
  };

  const updateOrder = (orderId, updatedFields) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updatedFields } : ord))
    );

    try {
      supabase
        .from("orders")
        .update({ ...updatedFields, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .catch?.((e) => console.warn("[OrdersContext] Supabase update order note:", e));
    } catch {}
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder, updateOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside an <OrdersProvider>");
  return ctx;
}