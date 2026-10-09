import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ChefHat, Bike, Home, Store, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { RESTAURANT_LOCATION, reverseGeocode, getRoute } from "../utils/geocode";
import { getWhatsAppOrderUrl, RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — Delivery Tracking Page
// Connected with WhatsApp verification by owner.
// Live bike rider animates along the real OSRM road coordinates
// once the owner approves and dispatches the delivery!
// ============================================================

const STAGES = [
  { key: "awaiting_approval", label: "Awaiting Owner WhatsApp Confirmation", icon: MessageSquare },
  { key: "preparing", label: "Confirmed by Owner · Kitchen Preparing", icon: ChefHat },
  { key: "on_the_way", label: "Rider on the Way (Live Moving Bike)", icon: Bike },
  { key: "delivered", label: "Delivered Successfully", icon: Home },
];

const RIDE_DURATION_MS = 25000; // time for rider animation along the road
const PLACE_UPDATE_INTERVAL_MS = 2500;

// Custom emoji-based markers (avoids Leaflet's default icon path issues with bundlers)
const makeIcon = (emoji, size = 32) =>
  L.divIcon({
    html: `<div style="font-size:${size - 6}px; transform: translate(-50%, -50%); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const restaurantIcon = makeIcon("🏠", 32);
const homeIcon = makeIcon("📍", 32);
const riderIcon = makeIcon("🏍️", 38);

function pointAlongPath(path, progress) {
  if (!path || path.length === 0) return null;
  const segments = path.length - 1;
  if (segments <= 0) return path[0];
  const scaled = progress * segments;
  const i = Math.min(Math.floor(scaled), segments - 1);
  const t = scaled - i;
  const [aLat, aLng] = path[i];
  const [bLat, bLng] = path[i + 1];
  return [aLat + (bLat - aLat) * t, aLng + (bLng - aLng) * t];
}

export default function Tracking() {
  const { orderId } = useParams();
  const { orders, updateOrderStatus } = useOrders();
  const order = orders.find((o) => o.id === orderId);

  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [riderPos, setRiderPos] = useState([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]);
  const [placeName, setPlaceName] = useState("");
  const [rideProgress, setRideProgress] = useState(0);
  const lastGeocodeAt = useRef(0);

  const destination = React.useMemo(() => {
    return order?.deliveryLocation || { lat: 24.8385, lng: 67.1425 };
  }, [order?.deliveryLocation]);
  const isDelivery = order?.fulfillment === "delivery";

  // Compute stage based on order status
  const currentStatus = order?.status || "awaiting_approval";
  let stageIndex = 0;
  if (currentStatus === "preparing") stageIndex = 1;
  else if (currentStatus === "out_for_delivery") stageIndex = 2;
  else if (currentStatus === "delivered") stageIndex = 3;

  // Fetch the real driving route once, when the order is a delivery order
  useEffect(() => {
    if (!isDelivery) return;
    getRoute(RESTAURANT_LOCATION, destination)
      .then(setRoute)
      .catch((err) => setRouteError(err.message));
  }, [isDelivery, destination]);

  // Animate the rider marker along the real route once owner dispatches (status === 'out_for_delivery')
  useEffect(() => {
    if (!route || currentStatus !== "out_for_delivery") return;
    let raf;
    const start = performance.now();

    const animate = (now) => {
      const p = Math.min((now - start) / RIDE_DURATION_MS, 1);
      setRideProgress(Math.round(p * 100));
      const pos = pointAlongPath(route, p);
      if (pos) setRiderPos(pos);

      if (now - lastGeocodeAt.current > PLACE_UPDATE_INTERVAL_MS && pos) {
        lastGeocodeAt.current = now;
        reverseGeocode(pos[0], pos[1]).then((name) => {
          if (name) setPlaceName(name);
        });
      }

      if (p < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        updateOrderStatus(order.id, "delivered");
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [route, currentStatus, order?.id, updateOrderStatus]);

  const restaurantPos = [RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng];
  const waUrl = order ? getWhatsAppOrderUrl(order) : "";

  return (
    <section
      className="w-full min-h-screen px-4 py-14"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm mb-6 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Back to order history
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Amiri', serif" }}>
              Live Order & Delivery Tracking
            </h1>
            <p className="text-sm text-white/55 mt-1">
              Order #{orderId} {order ? `· Rs ${order.total} (${order.fulfillment})` : ""}
            </p>
          </div>

          {order && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg self-start sm:self-auto"
            >
              <MessageSquare size={16} />
              Chat with Owner on WhatsApp
            </a>
          )}
        </div>

        {!order ? (
          <div className="text-center py-16 bg-white/[0.03] border border-white/10 rounded-2xl">
            <p className="text-white/60">Order not found.</p>
            <Link to="/orders" className="text-[#D4AF37] text-sm mt-3 inline-block underline">
              Check all orders
            </Link>
          </div>
        ) : !isDelivery ? (
          <div className="bg-white/[0.03] border border-[#D4AF37]/30 rounded-2xl p-8 mb-8 text-center">
            <Store size={36} className="mx-auto text-[#D4AF37] mb-3" />
            <h3 className="text-white text-lg font-semibold mb-1">Self Pickup Order</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto">
              Aapka order Al Madina Restaurant par direct pickup ke liye ready ho raha hai. Restaurant location: Korangi, Karachi.
            </p>
          </div>
        ) : (
          <>
            {/* Status Notification Callout */}
            {currentStatus === "awaiting_approval" && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-amber-300 text-sm font-bold mb-1">
                      Waiting for Restaurant Owner Confirmation via WhatsApp
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-3">
                      Aapka order receive ho gaya hai! Owner ({RESTAURANT_PHONE}) WhatsApp par baat karke jaise hi order prepare karke rider dispatch karenge, niche map par rider ki bike live chalna shuru ho jayegi.
                    </p>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366] text-black font-bold px-3.5 py-1.5 rounded-lg text-xs hover:bg-[#1EBE5D] transition-all"
                      >
                        <MessageSquare size={14} /> Send Details to Owner
                      </a>
                      {/* Owner quick-action test button so the user/owner can test delivery without leaving */}
                      <button
                        onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                        className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#F0DFA0] text-black font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md"
                      >
                        <Bike size={14} />
                        Owner Test Mode: [Approve & Start Bike Now]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === "preparing" && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <ChefHat size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-blue-300 text-sm font-bold mb-1">
                      Order Confirmed by Owner! Food is Cooking in Kitchen
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-3">
                      Owner ne aapka order accept kar liya hai aur kitchen mein fresh tayyari shuru hai. Jaise hi food pack hoga, bike rider GPS live activate ho jayega.
                    </p>
                    <button
                      onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all"
                    >
                      <Bike size={14} /> Dispatch Rider (Start Bike Movement)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === "out_for_delivery" && (
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                    <Bike size={18} />
                  </div>
                  <div>
                    <h3 className="text-emerald-400 text-sm font-bold">
                      Rider Dispatched! Bike is Moving on Road
                    </h3>
                    <p className="text-xs text-white/70">
                      Live GPS Navigation active · Route Progress: <span className="text-emerald-300 font-bold">{rideProgress}%</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-emerald-500 text-black px-3 py-1 rounded-full animate-pulse">
                  LIVE GPS 🏍️
                </span>
              </div>
            )}

            {currentStatus === "delivered" && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-5 mb-6 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                <h3 className="text-emerald-300 text-base font-bold">Order Delivered!</h3>
                <p className="text-xs text-white/70">
                  Rider aapke address par pohanch chuka hai. Al Madina Restaurant ka khana enjoy karein!
                </p>
              </div>
            )}

            {/* Live Leaflet Map */}
            <div className="relative bg-white/[0.03] border border-[#D4AF37]/30 rounded-2xl p-3 mb-8 shadow-2xl overflow-hidden">
              {placeName && currentStatus === "out_for_delivery" && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-black/90 border border-[#D4AF37]/60 text-[#F0DFA0] text-xs font-semibold px-4 py-2 rounded-full shadow-xl">
                  <MapPin size={14} className="text-[#D4AF37]" />
                  <span>Rider is near: {placeName}</span>
                </div>
              )}

              {routeError ? (
                <div className="h-72 flex items-center justify-center text-xs text-red-400">
                  {routeError}
                </div>
              ) : !route ? (
                <div className="h-72 flex items-center justify-center text-xs text-white/50">
                  Connecting to live road GPS route...
                </div>
              ) : (
                <MapContainer
                  center={restaurantPos}
                  zoom={13}
                  style={{ height: "360px", width: "100%", borderRadius: "12px" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                  />
                  <Polyline positions={route} pathOptions={{ color: "#D4AF37", weight: 5, opacity: 0.9 }} />
                  <Marker position={restaurantPos} icon={restaurantIcon} />
                  <Marker position={[destination.lat, destination.lng]} icon={homeIcon} />
                  {stageIndex >= 2 && <Marker position={riderPos} icon={riderIcon} />}
                </MapContainer>
              )}
            </div>

            {/* Stages Timeline */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-white text-base font-semibold mb-4">Delivery Milestones</h3>
              <div className="space-y-4">
                {STAGES.map((stg, i) => {
                  const isDone = i <= stageIndex;
                  const isCurrent = i === stageIndex;

                  return (
                    <div key={stg.key} className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isDone
                            ? "bg-gradient-to-br from-[#D4AF37] to-[#F0DFA0] text-black font-bold shadow-lg shadow-[#D4AF37]/20"
                            : "bg-white/5 text-white/30"
                        } ${isCurrent ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-black" : ""}`}
                      >
                        <stg.icon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDone ? "text-white" : "text-white/40"}`}>
                          {stg.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[11px] text-[#D4AF37] font-semibold">
                            ● Current active state
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}