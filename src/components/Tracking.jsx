import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ChefHat, Package, Bike, Home, Store, MapPin } from "lucide-react";
import { useOrders } from "../context/OrdersContext";
import { RESTAURANT_LOCATION, reverseGeocode, getRoute } from "../utils/geocode";

// ============================================================
// AL MADINA RESTAURANT — Delivery Tracking Page (FREE maps)
// Uses Leaflet + OpenStreetMap tiles (no key, no billing) and a
// real driving route from OSRM. The rider marker animates along
// the actual road path, and its position is reverse-geocoded
// every few seconds to show a "near ___" style notification.
// ============================================================

const STAGES = [
  { key: "preparing", label: "Preparing your order", icon: ChefHat },
  { key: "picked_up", label: "Picked up by rider", icon: Package },
  { key: "on_the_way", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: Home },
];

const RIDE_DURATION_MS = 30000; // how long the animated ride takes, purely for demo pacing
const PLACE_UPDATE_INTERVAL_MS = 3000;

// Custom emoji-based markers (avoids Leaflet's default icon path issues with bundlers)
const makeIcon = (emoji, size = 30) =>
  L.divIcon({
    html: `<div style="font-size:${size - 8}px; transform: translate(-50%, -50%);">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const restaurantIcon = makeIcon("🏠");
const homeIcon = makeIcon("📍");
const riderIcon = makeIcon("🏍️", 34);

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
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === orderId);

  const [stageIndex, setStageIndex] = useState(0);
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [riderPos, setRiderPos] = useState([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]);
  const [placeName, setPlaceName] = useState("");
  const lastGeocodeAt = useRef(0);

  const destination = order?.deliveryLocation;
  const isDelivery = order?.fulfillment === "delivery" && !!destination;

  // Fetch the real driving route once, when the order is a delivery order
  useEffect(() => {
    if (!isDelivery) return;
    getRoute(RESTAURANT_LOCATION, destination)
      .then(setRoute)
      .catch((err) => setRouteError(err.message));
  }, [isDelivery, destination]);

  // Advances one stage every 6 seconds (preparing → picked up), demo pacing.
  useEffect(() => {
    if (stageIndex >= 2 || !isDelivery) return;
    const timer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, 2));
    }, 6000);
    return () => clearInterval(timer);
  }, [stageIndex, isDelivery]);

  // Animate the rider marker along the real route once it's loaded
  // and the order has reached the "on the way" stage.
  useEffect(() => {
    if (!route || STAGES[stageIndex].key !== "on_the_way") return;
    let raf;
    const start = performance.now();

    const animate = (now) => {
      const p = Math.min((now - start) / RIDE_DURATION_MS, 1);
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
        setStageIndex(3); // delivered
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [route, stageIndex]);

  const restaurantPos = [RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng];

  return (
    <section
      className="w-full min-h-screen px-4 py-16"
      style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 60%, #0A0A0A 100%)" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <style>{`
        .am-track-heading { font-family: 'Amiri', serif; color: #FFFFFF; }
        .am-track-map {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 16px;
          padding: 14px;
          position: relative;
        }
        .am-track-map .leaflet-container {
          border-radius: 12px;
          filter: brightness(0.9) contrast(1.05);
        }
        .am-place-toast {
          position: absolute;
          top: 26px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 6px;
          background: rgba(10,10,10,0.9);
          border: 1px solid rgba(212,175,55,0.5);
          color: #F0DFA0;
          font-size: 12px; font-weight: 500;
          padding: 7px 14px; border-radius: 20px;
          z-index: 1000;
          white-space: nowrap; max-width: 90%;
          overflow: hidden; text-overflow: ellipsis;
        }
        .am-stage-row { display: flex; align-items: center; gap: 14px; padding: 10px 0; }
        .am-stage-icon {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .am-stage-icon.done { background: linear-gradient(135deg, #D4AF37, #F0DFA0); color: #0A0A0A; }
        .am-stage-icon.pending { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
        .am-stage-line { width: 2px; height: 20px; margin-left: 17px; }
        .am-stage-line.done { background: #D4AF37; }
        .am-stage-line.pending { background: rgba(255,255,255,0.1); }
      `}</style>

      <div className="max-w-3xl mx-auto">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
          <ArrowLeft size={15} /> Back to order history
        </Link>

        <h1 className="am-track-heading text-3xl font-bold mb-2">Track your order</h1>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
          Order #{orderId} {order ? `· Rs ${order.total}` : ""}
        </p>

        {!order ? (
          <p style={{ color: "rgba(255,255,255,0.55)" }}>Order not found.</p>
        ) : !isDelivery ? (
          <div className="am-track-map mb-8 flex items-center justify-center" style={{ height: "160px" }}>
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.55)" }}>
              <Store size={18} className="inline mr-2" style={{ color: "#D4AF37" }} />
              This is a pickup order — no delivery to track.
            </p>
          </div>
        ) : routeError ? (
          <div className="am-track-map mb-8 flex items-center justify-center" style={{ height: "160px" }}>
            <p className="text-sm text-center" style={{ color: "#E8846A" }}>{routeError}</p>
          </div>
        ) : !route ? (
          <div className="am-track-map mb-8 flex items-center justify-center" style={{ height: "320px" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Loading map…</p>
          </div>
        ) : (
          <div className="am-track-map mb-8">
            {placeName && STAGES[stageIndex].key === "on_the_way" && (
              <div className="am-place-toast">
                <MapPin size={13} /> Rider is near {placeName}
              </div>
            )}
            <MapContainer
              center={restaurantPos}
              zoom={13}
              style={{ height: "320px", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
              <Polyline positions={route} pathOptions={{ color: "#D4AF37", weight: 4, opacity: 0.85 }} />
              <Marker position={restaurantPos} icon={restaurantIcon} />
              <Marker position={[destination.lat, destination.lng]} icon={homeIcon} />
              {stageIndex >= 2 && <Marker position={riderPos} icon={riderIcon} />}
            </MapContainer>
          </div>
        )}

        {/* Stage timeline */}
        <div>
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.key}>
              <div className="am-stage-row">
                <div className={`am-stage-icon ${i <= stageIndex ? "done" : "pending"}`}>
                  <stage.icon size={16} />
                </div>
                <p className={i <= stageIndex ? "text-white text-sm font-medium" : "text-sm"} style={i > stageIndex ? { color: "rgba(255,255,255,0.4)" } : {}}>
                  {stage.label}
                </p>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`am-stage-line ${i < stageIndex ? "done" : "pending"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}