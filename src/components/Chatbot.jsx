import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Square,
  Bot,
  ShoppingCart,
  Check,
  Crown,
  Plus,
  Trash2,
  Edit2,
  Archive,
  Menu as MenuIcon,
  Phone,
  Receipt,
  Star,
  CheckCircle2,
  CornerDownRight,
  RotateCcw,
  Heart,
  Calendar,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MENU_ITEMS } from "./Menu";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useFavorites } from "../context/FavoritesContext";
import { useReservations } from "../context/ReservationsContext";
import { useReviews } from "../context/ReviewsContext";
import { useVIPLoader } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import { saveChatMessage, deleteChatSession } from "../lib/chatService";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — Royal AI Shahi Host & Chatbot
// Direct Server-Side Gemini AI Integration (Zero API key required from customers)
// Features:
// 1. ChatGPT-style Multi-Chat History with Sidebar (New, Rename, Archive, Delete).
// 2. Typing dots animation & Pen-style Typewriter streaming effect.
// 3. Real Server-Side Gemini AI via /api/chat with intelligent culinary fallback:
//    - Typo-tolerance: understands "Button" -> "Mutton", "Bryani", "Krhai", "Bil", etc.
//    - Real dish rates, authentic recipes, health benefits, Karachi address.
//    - Complete bill breakdown cards with automatic calculations.
//    - Direct "Add to Cart" product integration for recommended items.
// 4. Clean Top & Bottom scroll controls (Left/Right eliminated per instructions).
// 5. Character counting on message input.
// ============================================================

const MENU_RECOMMENDATIONS = {
  biryani: {
    id: 4,
    name: "Chicken Biryani",
    price: 680,
    image: "/Images/menu/Chicken Biryani.jpg",
    desc: "Dum pukht sela basmati with tender spiced chicken, saffron aroma & mint raita.",
    benefits: "Rich in protein, high aromatic saffron antioxidants, digest-friendly whole spices.",
    recipe: "Slow dum-cooked with layered fried onions, kewra water, yogurt marinade & whole garam masala in copper degh.",
  },
  karahi: {
    id: 3,
    name: "Mutton Karahi",
    price: 1450,
    image: "/Images/menu/Mutton Karahi.jpg",
    desc: "Desi ghee & mitti ki handi mein dum diya gaya taaza desi bakray ka gosht.",
    benefits: "High zinc & iron for vitality, organic pure desi ghee fats, no artificial additives.",
    recipe: "Wok-fried on high flame with ripe tomatoes, julienne ginger, green chilies and freshly crushed black pepper in clay handi.",
  },
  muttonFeast: {
    id: 102,
    name: "VIP Royal Handi Mutton Feast",
    price: 2200,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop",
    desc: "1 KG Mutton Karahi + 4 Rogheni Naan + Salad & Raita + 2 chilled Kashmiri Chai.",
    benefits: "Full family royal nourishment with pure desi ghee and tender Mandi bakra.",
    recipe: "Slow-cooked in clay handi over tamarind coals with whole spices, served with steaming tandoori naans.",
  },
  kebab: {
    id: 1,
    name: "Chicken Seekh Kebab",
    price: 650,
    image: "/Images/menu/Chicken Seekh Kebab.jpg",
    desc: "Charcoal-grilled minced chicken skewers infused with 16 royal spices.",
    benefits: "Lean high-protein grilled food, low carb, heart-friendly herbs & mint.",
    recipe: "Minced fine with roasted coriander, cumin, brown onion paste and skewered over glowing babool charcoal.",
  },
  samosa: {
    id: 2,
    name: "Vegetable Samosa",
    price: 200,
    image: "/Images/menu/Vegetable Samosa.jpg",
    desc: "Crisp handmade pastry filled with spiced potatoes, peas & roasted cumin.",
    benefits: "Fresh vegetarian energy, fiber-rich potato & pea stuffing with cumin digestion aid.",
    recipe: "Hand-rolled pastry dough folded into golden pyramids, deep-fried to crisp perfection.",
  },
  makhani: {
    id: 5,
    name: "Dal Makhani",
    price: 600,
    image: "/Images/menu/Dal-Makhani.jpg",
    desc: "12-hour slow-simmered black lentils with churned butter & malai.",
    benefits: "High dietary fiber, plant-based iron & calcium, comforting gut nutrition.",
    recipe: "Slow simmered overnight on low embers with butter churned daily and gentle kasuri methi aromatics.",
  },
  dessert: {
    id: 6,
    name: "Gulab Jamun",
    price: 300,
    image: "/Images/menu/Gulab Jamun.jpg",
    desc: "Warm khoya dumplings in cardamom-rose syrup with crushed pistachios.",
    benefits: "Natural pure milk solids (khoya), uplifting rose & green cardamom mood booster.",
    recipe: "Kneaded pure khoya balls fried golden in pure ghee, then soaked in warm saffron syrup.",
  },
  chai: {
    id: 7,
    name: "Kashmiri Chai",
    price: 200,
    image: "/Images/menu/Kashmiri_Chai.png",
    desc: "Authentic pink tea slow-brewed with pistachios & crushed almonds.",
    benefits: "Heartwarming winter tonic, rich in almond minerals, calming green tea flavonoids.",
    recipe: "Slow aerated brewing of special Kashmiri green leaves with milk, sea salt, cardamom and sliced pistachios.",
  },
  platter: {
    id: 101,
    name: "VIP Shahi Dawat Platter",
    price: 1920,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
    desc: "VIP royal combo: Chicken Biryani, Seekh Kebabs, Rogheni Naan & Drinks.",
    benefits: "Full family balanced feast providing premium carbs, grilled proteins and fresh dairy.",
    recipe: "Combined chef platter with freshly grilled kebabs, steaming degh biryani and tandoori rogheni naans.",
  },
};

const DISH_MAP = [
  {
    keys: ["samosa", "samose", "samosay", "smosa"],
    id: 2,
    name: "Vegetable Samosa",
    price: 250,
    image: "/Images/menu/Vegetable Samosa.jpg",
    desc: "Crisp handmade pastry filled with spiced potatoes, peas & cumin.",
  },
  {
    keys: ["biryani", "chawal", "rice", "bryani"],
    id: 4,
    name: "Chicken Biryani",
    price: 850,
    image: "/Images/menu/Chicken Biryani.jpg",
    desc: "Dum pukht sela basmati with tender spiced chicken, saffron aroma.",
  },
  {
    keys: ["karahi", "mutton", "bakra", "button", "handi"],
    id: 3,
    name: "Mutton Karahi",
    price: 1450,
    image: "/Images/menu/Mutton Karahi.jpg",
    desc: "Desi ghee & mitti ki handi mein dum diya gaya taaza desi bakray ka gosht.",
  },
  {
    keys: ["kebab", "kabab", "seekh", "bbq"],
    id: 1,
    name: "Chicken Seekh Kebab",
    price: 650,
    image: "/Images/menu/Chicken Seekh Kebab.jpg",
    desc: "Charcoal-grilled minced chicken skewers infused with royal spices.",
  },
  {
    keys: ["gulab jamun", "gulab", "meetha", "mitha", "dessert"],
    id: 6,
    name: "Gulab Jamun",
    price: 300,
    image: "/Images/menu/Gulab Jamun.jpg",
    desc: "Warm khoya dumplings in cardamom-rose syrup with pistachios.",
  },
  {
    keys: ["kashmiri chai", "kadhmiri chai", "kadhmiri", "chai", "pink tea", "tea"],
    id: 7,
    name: "Kashmiri Chai",
    price: 200,
    image: "/Images/menu/Kashmiri_Chai.png",
    desc: "Authentic pink tea slow-brewed with pistachios & crushed almonds.",
  },
  {
    keys: ["makhani", "daal", "dal"],
    id: 5,
    name: "Dal Makhani",
    price: 600,
    image: "/Images/menu/Dal-Makhani.jpg",
    desc: "12-hour slow-simmered black lentils with churned butter & malai.",
  },
  {
    keys: ["boti", "malai boti"],
    id: 103,
    name: "Shahi Malai Boti (Charcoal)",
    price: 780,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop",
    desc: "Boneless chicken marinated in fresh malai cream and white pepper.",
  },
  {
    keys: ["platter", "shahi dawat platter"],
    id: 101,
    name: "VIP Shahi Dawat Platter",
    price: 2400,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
    desc: "Saffron Biryani, 4x Seekh Kebabs, Malai Boti, Rogheni Naans & Raita.",
  },
  {
    keys: ["lime", "fresh lime", "fresh lime soda", "soda", "leemo"],
    id: 8,
    name: "Fresh Lime Soda",
    price: 180,
    image: "/Images/menu/Fresh Lime Soda.jpg",
    desc: "Refreshing chilled sparkling soda with freshly squeezed desi lemon.",
  },
];

const DYNAMIC_FALLBACKS = [
  "Alhamdulillah, aap ka hukum sar ankhon par! Main aapki cart manage kar sakta hoon, favorites add/remove kar sakta hoon, table book ya cancel kar sakta hoon, aur direct order place kar sakta hoon. Aaj dastarkhwan par kya khas mangwayein?",
  "Bhai jaan, main samajh gaya! Al Madina Restaurant par aapki mukammal khidmat ke liye hazir hoon. Aaj taaza Dum Biryani, Mutton Handi Karahi ya crispy Samosay order karne ka irada hai?",
  "Zabardast! Main Al Madina AI Assistant hoon. Cart mein items dalna ho, review darj karna ho ya table reserve karni ho — bas ek lafz farmayein, main foran execute kar doon ga!",
  "Khush aamdeed bhai! Agar aap menu dekhna chahte hain, apna bill calculate karwana chahte hain ya special deal order karna chahte hain to mujhe batayein!",
  "Aap ka shukriya! Al Madina Restaurant Karachi ka har khana taaza zabiha halaal aur khalis masalon se tayyar hota hai. Aaj aap kya khidmat farmayeinge?",
  "Ji bilkul bhai! Al Madina Restaurant mein aapka khana hamari pehli tarjeeh hai. Main orders, reviews, reservations sab sambhal sakta hoon. Aaj kya khane ka program hai?",
  "Marhaba! Korangi Karachi ke mashhoor Al Madina Restaurant se taaza BBQ, Biryani ya Karahi order karni ho to main aapka order abhi book kar deta hoon!",
  "Ji bhai, farmayein! Main aapke har sawal ka jawab dene aur cart, favorites, order aur table booking sab ek sath handle karne ke liye 24/7 tayyar hoon!"
];

const getRandomFallback = () => {
  const idx = Math.floor(Math.random() * DYNAMIC_FALLBACKS.length);
  return DYNAMIC_FALLBACKS[idx];
};

// Formats message text: Converts **bold** and *italic* cleanly into HTML without raw asterisks (*)
function renderFormattedMessage(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    // Process markdown inline: **bold** and *italic*
    const parts = [];
    let remainder = line;
    let keyIdx = 0;

    while (remainder.length > 0) {
      const boldMatch = remainder.match(/\*\*(.*?)\*\*/);
      const italicMatch = remainder.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

      let firstMatch = null;
      let isBold = false;

      if (boldMatch && italicMatch) {
        if (boldMatch.index <= italicMatch.index) {
          firstMatch = boldMatch;
          isBold = true;
        } else {
          firstMatch = italicMatch;
          isBold = false;
        }
      } else if (boldMatch) {
        firstMatch = boldMatch;
        isBold = true;
      } else if (italicMatch) {
        firstMatch = italicMatch;
        isBold = false;
      }

      if (firstMatch) {
        const prefix = remainder.slice(0, firstMatch.index);
        if (prefix) {
          parts.push(<span key={keyIdx++}>{prefix}</span>);
        }
        if (isBold) {
          parts.push(
            <strong key={keyIdx++} className="font-bold text-[#F5DEB3]">
              {firstMatch[1]}
            </strong>
          );
        } else {
          parts.push(
            <em key={keyIdx++} className="italic text-amber-200/90 font-medium">
              {firstMatch[1]}
            </em>
          );
        }
        remainder = remainder.slice(firstMatch.index + firstMatch[0].length);
      } else {
        parts.push(<span key={keyIdx++}>{remainder}</span>);
        break;
      }
    }

    return (
      <React.Fragment key={lIdx}>
        {parts}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function InlineOrderForm({ initialItems, defaultTotal, onConfirm, defaultCustomerName }) {
  const [items, setItems] = useState(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
        image: it.image || "",
      }));
    }
    return [{ id: 4, name: "Chicken Biryani", price: 850, quantity: 1, image: "/Images/menu/Chicken Biryani.jpg" }];
  });

  const [name, setName] = useState(defaultCustomerName || "");
  const [phone, setPhone] = useState("0300-1234567");
  const [address, setAddress] = useState("Sector 36-B, Korangi, Karachi");
  const [payment, setPayment] = useState("cod");
  const [isDone, setIsDone] = useState(false);

  const delivery = 150;
  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  const grandTotal = subtotal + delivery;

  const handleUpdateQty = (itemId, delta) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || items.length === 0) return;
    setIsDone(true);
    onConfirm({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      payment,
      items,
      total: grandTotal,
    });
  };

  if (isDone) {
    return (
      <div className="mt-3 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200">
        <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
          <CheckCircle2 size={14} /> Order Information Submit Ho Chuki Hai!
        </div>
        <p className="text-[11px] text-emerald-300/80 mt-1">
          Aapka parcel order kitchen queue mein darj ho gaya hai (Pending Owner Approval).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3.5 bg-gradient-to-b from-[#18150E] to-[#0E0C08] border border-[#D4AF37]/50 rounded-xl space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-xs font-bold text-[#F0DFA0] flex items-center gap-1.5">
          <Receipt size={14} className="text-[#D4AF37]" /> 📦 Parcel Order Information Form
        </span>
        <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37]/15 text-amber-300 font-semibold rounded-full border border-[#D4AF37]/30">
          Karachi Delivery
        </span>
      </div>

      {/* Items List with Rates and Plus / Minus Quantity Buttons */}
      <div className="space-y-2 bg-black/50 p-2.5 rounded-lg border border-white/10 text-xs">
        <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider flex justify-between pb-1 border-b border-white/5">
          <span>Item & Rates</span>
          <span>Miqdaar (+ / -) & Total</span>
        </div>

        {items.length === 0 ? (
          <p className="text-red-400 text-center py-2 text-[11px]">Koi item select nahi hai.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate text-[11.5px]">{it.name}</p>
                <p className="text-[10.5px] text-white/55">Rate: Rs {it.price}</p>
              </div>

              {/* Plus / Minus Qty Controls */}
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                <button
                  type="button"
                  onClick={() => handleUpdateQty(it.id, -1)}
                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all"
                  title="Minus item"
                >
                  <Minus size={11} />
                </button>
                <span className="w-5 text-center font-bold text-[#F0DFA0] text-xs">
                  {it.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateQty(it.id, 1)}
                  className="w-5 h-5 rounded bg-[#D4AF37]/30 hover:bg-[#D4AF37]/50 text-[#FFF2A3] flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all"
                  title="Plus item"
                >
                  <Plus size={11} />
                </button>
              </div>

              <div className="w-16 text-right font-bold text-amber-300 text-[11.5px]">
                Rs {it.price * it.quantity}
              </div>
            </div>
          ))
        )}

        {/* Pricing Summary */}
        <div className="pt-2 border-t border-white/10 space-y-1 text-[11px]">
          <div className="flex justify-between text-white/60">
            <span>Items Subtotal</span>
            <span>Rs {subtotal}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Delivery Charges (All Karachi)</span>
            <span>Rs {delivery}</span>
          </div>
          <div className="flex justify-between text-[#D4AF37] font-bold text-xs pt-1 border-t border-[#D4AF37]/30">
            <span>Kul Total Raqam</span>
            <span className="text-sm">Rs {grandTotal}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="text-[10px] text-white/60 block mb-0.5">Customer Name (Apna Naam):</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Muhammad Ali"
            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/60 block mb-0.5">Phone Number (Rabta Number):</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/60 block mb-0.5">Delivery Address (Karachi Pata):</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House / Street, Area, Karachi"
            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/60 block mb-0.5">Payment Method (Tariqa-e-Adaigi):</label>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
          >
            <option value="cod">Cash on Delivery (Karachi)</option>
            <option value="online">Online Transfer (Easypaisa / JazzCash / Bank)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={items.length === 0}
          className="w-full py-2.5 mt-1 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5DEB3] text-black font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Check size={13} /> Confirm & Place Parcel Order Now
        </button>
      </form>
    </div>
  );
}

function InlineTableForm({ onConfirm, defaultCustomerName }) {
  const [name, setName] = useState(defaultCustomerName || "");
  const [phone, setPhone] = useState("0300-1234567");
  const [guests, setGuests] = useState(4);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("20:30");
  const [hall, setHall] = useState("Family Hall (AC)");
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setIsDone(true);
    onConfirm({
      name: name.trim(),
      phone: phone.trim(),
      guests: Number(guests),
      date,
      time,
      hall,
    });
  };

  if (isDone) {
    return (
      <div className="mt-3 p-3 bg-purple-950/70 border border-purple-500/50 rounded-xl text-purple-200">
        <div className="flex items-center gap-1.5 font-bold text-purple-300 text-xs">
          <CheckCircle2 size={14} /> Table Booking Information Submit Ho Chuki Hai!
        </div>
        <p className="text-[11px] text-purple-300/80 mt-1">
          {guests} Afraad · {date} at {time} · {hall} (Pending Owner Approval)
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gradient-to-b from-[#18150E] to-[#0E0C08] border border-[#D4AF37]/50 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-xs font-bold text-[#F0DFA0] flex items-center gap-1.5">
          <Calendar size={14} className="text-[#D4AF37]" /> 🍽️ Table Booking Information Form
        </span>
        <span className="text-[10px] text-amber-400 font-semibold">Dine-In Seating</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="text-[10px] text-white/60 block mb-0.5">Guest Name (Mehmaan Ka Naam):</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Muhammad Ali"
            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/60 block mb-0.5">Phone Number (Rabta Number):</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/60 block mb-0.5">Guests (Afraad):</label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
            >
              <option value={2}>2 Persons (Couple)</option>
              <option value={4}>4 Persons (Family)</option>
              <option value={6}>6 Persons (Table)</option>
              <option value={8}>8 Persons (Large)</option>
              <option value={12}>12+ Persons (Feast)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/60 block mb-0.5">Hall Preference:</label>
            <select
              value={hall}
              onChange={(e) => setHall(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
            >
              <option value="Family Hall (AC)">Family Hall (AC)</option>
              <option value="VIP Executive Hall">VIP Executive Hall</option>
              <option value="Rooftop Ambiance">Rooftop Ambiance</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/60 block mb-0.5">Date (Tareekh):</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/60 block mb-0.5">Time (Waqt):</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs focus:border-[#D4AF37] outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 mt-1 rounded-lg bg-gradient-to-r from-amber-400 to-[#D4AF37] text-black font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.3)] flex items-center justify-center gap-1.5"
        >
          <Check size={13} /> Confirm Table Booking Now
        </button>
      </form>
    </div>
  );
}

function OwnerContactBanner() {
  return (
    <div className="mt-3 p-3 bg-gradient-to-br from-amber-950/40 via-black/80 to-[#18150E] border border-[#D4AF37]/60 rounded-xl space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
        <span className="font-bold text-[#F5DEB3] flex items-center gap-1.5">
          <Crown size={14} className="text-[#D4AF37]" /> Al Madina Owner Rabta & Payment Details
        </span>
        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">VIP Verified</span>
      </div>
      <div className="space-y-1 text-white/85 text-[11px]">
        <p>📞 <strong>Phone:</strong> <a href={`tel:${RESTAURANT_PHONE}`} className="text-amber-400 hover:underline">{RESTAURANT_PHONE}</a> (0300-1234567)</p>
        <p>📱 <strong>WhatsApp:</strong> <a href={`https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Chat with Restaurant Owner</a></p>
        <p>💳 <strong>Easypaisa / JazzCash / Bank:</strong> <span className="font-mono text-amber-300">0300-1234567</span> (Title: Al Madina Foods Karachi)</p>
        <p>📍 <strong>Address:</strong> 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi</p>
      </div>
      <div className="pt-1.5 border-t border-white/10 text-[10px] text-amber-200/80 italic">
        💡 Aap payment asani se clear kar sakte hain. Jaise hi payment verify hogi, aapke order aur table par osi waqt foran kaam start kar diya jaye ga!
      </div>
    </div>
  );
}

const INITIAL_MESSAGE = {
  id: "msg_init",
  from: "bot",
  text: "Assalam-o-Alaikum! Main Al Madina Restaurant Karachi ka AI Smart Assistant hoon. Khana order karna ho, cart ya favorites manage karna ho, table reserve karni ho, review dena ho ya delivery track karni ho — main aapki mukammal khidmat mein hazir hoon! 🍽️✨",
  suggestedQuestions: [
    "🍖 Mutton Karahi ka rate aur details?",
    "🍛 Chicken Biryani cart mein add karo",
    "💖 Samosa favorite kar do",
    "🧾 Mera bill bana do (2x Biryani + 1x Karahi)",
  ],
};

const STORAGE_CHATS_KEY = "am_chat_sessions_v4";

export default function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "chat_default",
        title: "Al Madina Guftagu",
        archived: false,
        createdAt: Date.now(),
        messages: [INITIAL_MESSAGE],
      },
    ];
  });
  const [currentChatId, setCurrentChatId] = useState("chat_default");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const [typewriterText, setTypewriterText] = useState("");
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [titleInput, setTitleInput] = useState("");

  const scrollRef = useRef(null);
  const typewriterTimerRef = useRef(null);
  const pendingTimeoutRef = useRef(null);
  const activeBotMsgRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { addToCart, removeFromCart, clearCart, items: cartItems } = useCart();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addReservation, reservations, updateReservationStatus } = useReservations();
  const { addOrder, orders, updateOrderStatus } = useOrders();
  const { addReview } = useReviews();
  const { triggerLoader } = useVIPLoader();
  const authContext = useAuth();
  const [sidebarTab, setSidebarTab] = useState("active"); // "active" | "archived" | "trash"

  const currentUser = authContext?.session?.user || null;
  const customerName = currentUser?.user_metadata?.full_name || (currentUser?.email ? currentUser.email.split("@")[0] : "Guest Customer");
  const customerEmail = currentUser?.email || "guest@customer";
  const userId = currentUser?.id || null;

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Current session & messages
  const currentSession = sessions.find((s) => s.id === currentChatId) || sessions[0] || {
    id: "chat_default",
    title: "New Chat",
    messages: [INITIAL_MESSAGE],
  };
  const messages = currentSession.messages || [INITIAL_MESSAGE];

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typewriterText, isTyping]);

  // Scroll controls (Top and Down only)
  const scrollChat = (direction) => {
    if (!scrollRef.current) return;
    if (direction === "top") {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (direction === "down") {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  // Open Chatbot with VIP Loader and Start New Chat
  const handleOpenChatbot = () => {
    // Automatically start a fresh new conversation as requested by user
    setSessions((prev) => {
      const latest = prev[0];
      if (latest && latest.messages?.length === 1 && latest.messages[0]?.from === "bot") {
        setCurrentChatId(latest.id);
        return prev;
      }
      const newId = "chat_" + Date.now();
      const newChat = {
        id: newId,
        title: "New Chat",
        archived: false,
        createdAt: Date.now(),
        messages: [INITIAL_MESSAGE],
      };
      setCurrentChatId(newId);
      return [newChat, ...prev];
    });
    setSidebarOpen(false);

    triggerLoader(
      "👑 Al Madina AI Shahi Host",
      "AI Assistant se rabta qaim ho raha hai...",
      800,
      () => setOpen(true)
    );
  };

  // Stop AI generation on demand
  const handleStop = () => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    if (typewriterText) {
      const stoppedText = typewriterText + " ⏹️ (Aapke hukum par AI ne yahan stop kar diya)";
      const activeResp = activeBotMsgRef.current;
      setTypewriterText("");
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentChatId) {
            return {
              ...s,
              messages: [
                ...s.messages,
                {
                  id: "msg_" + Date.now(),
                  from: "bot",
                  text: stoppedText,
                  product: activeResp?.product || null,
                  orderForm: activeResp?.orderForm || null,
                  tableForm: activeResp?.tableForm || null,
                  ownerContact: activeResp?.ownerContact || false,
                  suggestedQuestions: activeResp?.suggestedQuestions || ["Dobara shuru karein", "Menu dekhein"],
                },
              ],
            };
          }
          return s;
        })
      );
    }
    setIsTyping(false);
    setIsGenerating(false);
  };

  const handleInlineOrderConfirm = (orderData, messageId) => {
    const newOrder = addOrder({
      items: orderData.items,
      fulfillment: "delivery",
      paymentMethod: orderData.payment,
      status: "awaiting_approval",
      customer: {
        name: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
      },
      total: orderData.total,
    });

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentChatId) {
          const updatedMsgs = s.messages.map((m) =>
            m.id === messageId
              ? { ...m, orderForm: { ...(m.orderForm || {}), submitted: true } }
              : m
          );
          const confirmMsg = {
            id: "msg_" + Date.now(),
            from: "bot",
            text: `🎉 Mubarak ho! Aap ka Order (#${newOrder.id}) Al Madina Restaurant Karachi mein darj ho chuka hai!\n\n📋 **Order Details:**\n${orderData.items.map((it) => `• ${it.quantity}x ${it.name} (Rs ${(it.price || 0) * (it.quantity || 1)})`).join("\n")}\n🛵 Delivery Fee: Rs 150\n💵 **Kul Total:** Rs ${orderData.total}\n📍 **Delivery Address:** ${orderData.address}\n\n⏳ **Status: PENDING OWNER APPROVAL**\n\n👑 **Restaurant Owner Rabta & Payment Details:**\n• Owner Phone: ${RESTAURANT_PHONE} (0300-1234567)\n• WhatsApp: https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}\n• Easypaisa / JazzCash / Bank Transfer: 0300-1234567 (Title: Al Madina Foods Karachi)\n• Restaurant Branch: 25, 2 1/2 Korangi, Sector 33-B, Karachi\n\n💡 *Aap asani se payment clear kar sakte hain. Jaise hi aap payment transfer kar ke OK karenge, aap ke order par kitchen mein osi waqt foran kaam start kar diya jaye ga!*`,
            orderPlaced: newOrder,
            ownerContact: true,
            suggestedQuestions: [
              `🛵 Live Tracking Dekhein (#${newOrder.id})`,
              "Table book karein",
              "Menu dekhein",
            ],
          };
          return { ...s, messages: [...updatedMsgs, confirmMsg] };
        }
        return s;
      })
    );
  };

  const handleInlineTableConfirm = (tableData, messageId) => {
    const newBooking = addReservation({
      name: tableData.name,
      phone: tableData.phone,
      date: tableData.date,
      time: tableData.time,
      guests: tableData.guests,
      notes: `Table reserved via AI Chatbot for ${tableData.hall}`,
      status: "pending",
    });

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentChatId) {
          const updatedMsgs = s.messages.map((m) =>
            m.id === messageId
              ? { ...m, tableForm: { ...(m.tableForm || {}), submitted: true } }
              : m
          );
          const confirmMsg = {
            id: "msg_" + Date.now(),
            from: "bot",
            text: `🍽️ Mubarak ho! Aap ki Table Booking (#${newBooking.id}) darj ho chuki hai!\n\n📋 **Booking Details:**\n👤 Mehmaan: ${tableData.name} (${tableData.phone})\n👥 Seating: ${tableData.guests} Afraad\n🏛️ Hall: ${tableData.hall}\n📅 Tareekh: ${tableData.date} · ⏰ Waqt: ${tableData.time}\n\n⏳ **Status: PENDING OWNER APPROVAL**\n\n👑 **Restaurant Owner Rabta:**\n• Phone: ${RESTAURANT_PHONE} (0300-1234567)\n• WhatsApp: https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}\n\nManagement aapse WhatsApp par rabta kar ke table tasdeeq karegi!`,
            ownerContact: true,
            suggestedQuestions: [
              "📅 Booking History Dekhein",
              "Dishes order karein",
              "Owner se rabta karein",
            ],
          };
          return { ...s, messages: [...updatedMsgs, confirmMsg] };
        }
        return s;
      })
    );
  };

  // Handle Pen-style Typewriter animation for answers
  const streamBotMessage = (fullResponse, newMessages) => {
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);

    const fullText = fullResponse.text;
    let idx = 0;
    setTypewriterText("");
    setIsTyping(false);
    setIsGenerating(true);
    activeBotMsgRef.current = fullResponse;

    typewriterTimerRef.current = setInterval(() => {
      idx += 4;
      if (idx >= fullText.length) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
        setTypewriterText("");
        setIsGenerating(false);

        // Auto-save message to Supabase
        saveChatMessage({
          sessionId: currentChatId,
          userId,
          customerName,
          customerEmail,
          sender: "ai_host",
          message: fullText,
          metadata: {
            dish: fullResponse.product?.name || null,
            billTotal: fullResponse.bill?.grandTotal || null,
          },
        });

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentChatId) {
              return {
                ...s,
                messages: [
                  ...newMessages,
                  {
                    id: "msg_" + Date.now(),
                    from: "bot",
                    text: fullText,
                    product: fullResponse.product || null,
                    bill: fullResponse.bill || null,
                    reviewPrompt: fullResponse.reviewPrompt || false,
                    whatsappSupport: fullResponse.whatsappSupport || false,
                    orderPlaced: fullResponse.orderPlaced || null,
                    orderForm: fullResponse.orderForm || null,
                    tableForm: fullResponse.tableForm || null,
                    ownerContact: fullResponse.ownerContact || false,
                    suggestedQuestions: fullResponse.suggestedQuestions || [],
                  },
                ],
              };
            }
            return s;
          })
        );
      } else {
        setTypewriterText(fullText.slice(0, idx));
      }
    }, 10);
  };

  const handleAddToCart = (product) => {
    triggerLoader(
      "🛒 Cart Mein Shamil Kiya Gaya",
      `"${product.name}" cart mein add ho gaya...`,
      800,
      () => {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        });
        setAddedItem(product.id);
        setTimeout(() => setAddedItem(null), 2500);
      }
    );
  };

  const handleAddToFavorites = (product) => {
    addToFavorites({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  // Typo normalizer
  const normalizeInput = (raw) => {
    let s = raw.toLowerCase().trim();
    // Typo fixes for Mutton (handles "Button", "buttn", "muton", "matan", etc.)
    s = s.replace(/\b(button|buttn|butten|muton|matan|muttn|maton|batan|bton)\b/g, "mutton");
    s = s.replace(/bryani|baryani|beryani|biriyani/g, "biryani");
    s = s.replace(/krhai|krahi|karhi|kadai|kadhai/g, "karahi");
    s = s.replace(/kebabz|kabab|kabaabs|tikka|kababs/g, "kebab");
    s = s.replace(/samosay|samose|smosa|samosas/g, "samosa");
    s = s.replace(/daal|makhni|dall/g, "makhani");
    s = s.replace(/mitha|metha|gulabjaman|jalebi/g, "gulab jamun");
    s = s.replace(/kashmiri chai|pink tea|chai/g, "chai");
    s = s.replace(/whatapp|whatsap|whtsapp|watsapp/g, "whatsapp");
    s = s.replace(/adrs|adrees|adress|locashun|loction/g, "location");
    s = s.replace(/\b(bil|total|hisab)\b/g, "bill");
    s = s.replace(/\b(keemat|qemat|qimat|kimat|price|rates|daam|cost)\b/g, "price");
    s = s.replace(/\b(ordr|ordar|odr|bok)\b/g, "order");
    s = s.replace(/\b(fevrite|fevorite|favrite|favret|favrate|favourite|pasandeeda|pasand)\b/g, "favorite");
    s = s.replace(/\b(remov|nikal|nikalo|hatao|hata)\b/g, "remove");
    s = s.replace(/\b(cancl|cancle|mansookh)\b/g, "cancel");
    return s;
  };

  // Detect Language
  const detectLanguage = (text) => {
    if (/[\u0600-\u06FF]/.test(text)) return "urdu_script";
    const englishWords = ["what", "how", "price", "where", "is", "the", "please", "recipe", "benefits", "can", "bill"];
    const hasEnglish = englishWords.some((w) => text.toLowerCase().includes(w));
    if (hasEnglish && !text.includes("hai") && !text.includes("kya") && !text.includes("bhai")) {
      return "english";
    }
    return "roman_urdu";
  };

  // Helper: Find dishes and quantities mentioned in input
  const findDishesInText = (cleanText, lowerRawText) => {
    const list = [];

    // Helper for quantity extraction
    const extractQty = (dishKeyword) => {
      if (cleanText.includes(`3 ${dishKeyword}`) || cleanText.includes(`teen ${dishKeyword}`) || cleanText.includes(`3x ${dishKeyword}`)) return 3;
      if (cleanText.includes(`2 ${dishKeyword}`) || cleanText.includes(`do ${dishKeyword}`) || cleanText.includes(`2x ${dishKeyword}`)) return 2;
      if (cleanText.includes(`4 ${dishKeyword}`) || cleanText.includes(`char ${dishKeyword}`) || cleanText.includes(`4x ${dishKeyword}`)) return 4;
      return 1;
    };

    // Mutton Karahi
    if (
      cleanText.includes("mutton") ||
      cleanText.includes("bakra") ||
      cleanText.includes("karahi") ||
      lowerRawText.includes("button") ||
      lowerRawText.includes("buttn") ||
      lowerRawText.includes("batan")
    ) {
      list.push({ product: MENU_RECOMMENDATIONS.karahi, quantity: extractQty("mutton") || extractQty("karahi") });
    }

    // Seekh Kebab
    if (cleanText.includes("seekh") || cleanText.includes("kabab") || cleanText.includes("kebab") || cleanText.includes("bbq")) {
      list.push({ product: MENU_RECOMMENDATIONS.kebab, quantity: extractQty("seekh") || extractQty("kabab") });
    }

    // Vegetable Samosa
    if (cleanText.includes("samosa") || cleanText.includes("samose") || cleanText.includes("samosay")) {
      list.push({ product: MENU_RECOMMENDATIONS.samosa, quantity: extractQty("samosa") });
    }

    // Chicken Biryani
    if (cleanText.includes("biryani") || cleanText.includes("chawal") || cleanText.includes("rice")) {
      list.push({ product: MENU_RECOMMENDATIONS.biryani, quantity: extractQty("biryani") });
    }

    // Dal Makhani
    if (cleanText.includes("makhani") || cleanText.includes("daal") || cleanText.includes("dal")) {
      list.push({ product: MENU_RECOMMENDATIONS.makhani, quantity: 1 });
    }

    // Gulab Jamun
    if (cleanText.includes("gulab") || cleanText.includes("meetha") || cleanText.includes("dessert")) {
      list.push({ product: MENU_RECOMMENDATIONS.dessert, quantity: 1 });
    }

    // Kashmiri Chai
    if (cleanText.includes("chai") || cleanText.includes("pink tea") || cleanText.includes("tea")) {
      list.push({ product: MENU_RECOMMENDATIONS.chai, quantity: 1 });
    }

    // Platter
    if (cleanText.includes("platter") || cleanText.includes("family deal") || cleanText.includes("feast")) {
      list.push({ product: MENU_RECOMMENDATIONS.platter, quantity: 1 });
    }

    return list;
  };

  const parseQuantity = (textBeforeDish) => {
    if (!textBeforeDish) return 1;
    const t = textBeforeDish.toLowerCase();
    if (/\b(panch|panch|5|five)\b/.test(t)) return 5;
    if (/\b(char|chaar|4|four)\b/.test(t)) return 4;
    if (/\b(teen|tin|3|three)\b/.test(t)) return 3;
    if (/\b(do|doh|2|two)\b/.test(t)) return 2;
    if (/\b(chhe|che|6|six)\b/.test(t)) return 6;
    if (/\b(saat|7|seven)\b/.test(t)) return 7;
    if (/\b(aath|ath|8|eight)\b/.test(t)) return 8;
    if (/\b(nau|no|9|nine)\b/.test(t)) return 9;
    if (/\b(das|10|ten)\b/.test(t)) return 10;
    if (/\b(ek|aik|one|1)\b/.test(t)) return 1;
    const numMatch = t.match(/(\d+)\s*$/);
    if (numMatch) return parseInt(numMatch[1], 10);
    return 1;
  };

  const findDishesForContext = (cleanText, context) => {
    const result = [];

    // Identify which segment applies to which context
    // Pattern: context keywords often govern everything until the next action keyword
    const actionKeywords = [
      { name: "favorite", regex: /\b(favorite|favourite|fav|pasand)\b/i },
      { name: "cart", regex: /\b(cart|tokri|add|dalo)\b/i },
      { name: "order", regex: /\b(order|mangwa|bhej|mangwana)\b/i },
      { name: "table", regex: /\b(table|tabel|seat|reserve|reservation)\b/i },
    ];

    // Split text into clauses by connectors
    const clauses = cleanText.split(/\s*(?:aur|and|,|\.|\n|phir|pir)\s*/i);

    let currentContext = null;

    clauses.forEach((clause) => {
      // Check if this clause introduces a new context
      for (const ak of actionKeywords) {
        if (ak.regex.test(clause)) {
          currentContext = ak.name;
          break;
        }
      }

      if (currentContext === context) {
        DISH_MAP.forEach((item) => {
          const hasDish = item.keys.some((k) => clause.includes(k));
          if (hasDish && !result.some((r) => r.product.id === item.id)) {
            const keyUsed = item.keys.find((k) => clause.includes(k));
            const idx = clause.indexOf(keyUsed);
            const wordsBefore = clause.slice(0, idx);
            const qty = parseQuantity(wordsBefore);
            result.push({ product: item, quantity: qty });
          }
        });
      }
    });

    // If context was order and no specific items matched inside clauses, check whole string if order is requested
    if (result.length === 0 && context === "order" && (cleanText.includes("order") || cleanText.includes("mangwa"))) {
      DISH_MAP.forEach((item) => {
        const hasDish = item.keys.some((k) => cleanText.includes(k));
        if (hasDish && !result.some((r) => r.product.id === item.id)) {
          const keyUsed = item.keys.find((k) => cleanText.includes(k));
          const idx = cleanText.indexOf(keyUsed);
          const wordsBefore = cleanText.slice(Math.max(0, idx - 25), idx);
          const qty = parseQuantity(wordsBefore);
          result.push({ product: item, quantity: qty });
        }
      });
    }

    // Default fallbacks if still empty
    if (result.length === 0) {
      if (context === "favorite" && (cleanText.includes("favorite") || cleanText.includes("fav"))) {
        if (cleanText.includes("samosa")) result.push({ product: MENU_RECOMMENDATIONS.samosa, quantity: 1 });
        if (cleanText.includes("biryani")) result.push({ product: MENU_RECOMMENDATIONS.biryani, quantity: 1 });
        if (cleanText.includes("karahi") || cleanText.includes("mutton")) result.push({ product: MENU_RECOMMENDATIONS.karahi, quantity: 1 });
      } else if (context === "cart" && cleanText.includes("cart")) {
        if (cleanText.includes("karahi") || cleanText.includes("mutton")) result.push({ product: MENU_RECOMMENDATIONS.karahi, quantity: 1 });
        if (cleanText.includes("samosa")) result.push({ product: MENU_RECOMMENDATIONS.samosa, quantity: 1 });
        if (cleanText.includes("biryani")) result.push({ product: MENU_RECOMMENDATIONS.biryani, quantity: 1 });
        if (cleanText.includes("gulab") || cleanText.includes("meetha")) result.push({ product: MENU_RECOMMENDATIONS.dessert, quantity: 1 });
      }
    }

    return result;
  };

  // Call Server-Side Gemini API Proxy (/api/chat)
  const callServerGemini = async (prompt) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.reply || null;
    } catch {
      return null;
    }
  };

  const processResponse = async (userText) => {
    try {
      const raw = userText.trim();
      const clean = normalizeInput(raw);
      const lowerRaw = raw.toLowerCase();
      const _lang = detectLanguage(raw);

      // ========================================================
      // 0. GREETING & HEALTH / WELL-BEING INQUIRY
      // ========================================================
      const isWellBeing =
        clean.includes("kiya haal") ||
        clean.includes("kya haal") ||
        clean.includes("kia haal") ||
        clean.includes("kese ho") ||
        clean.includes("kaise ho") ||
        clean.includes("kya chal raha") ||
        clean.includes("sunao") ||
        clean.includes("kaisay ho") ||
        clean.includes("tum kais") ||
        clean.includes("haal chaal") ||
        clean.includes("tabiyat") ||
        clean.includes("kaisi ho");

      if (isWellBeing) {
        return {
          text: "Alhamdulillah! Aap ki dua hai bhai jaan, aap sunayein aap kaisay hain? Sehat tabiyat theek hai? Aaj Al Madina Restaurant Karachi par kya mazaydar khane ka irada hai? 🍽️✨\n\nHamare paas taaza Dum Pukht Chicken Biryani, Mitti Handi Desi Mutton Karahi, Charcoal Seekh Kebab aur crispy Vegetable Samosay tayyar hain! Bas hukum farmayein.",
          product: MENU_RECOMMENDATIONS.biryani,
          suggestedQuestions: [
            "🍖 Mutton Karahi ka rate aur details?",
            "🍛 Chicken Biryani cart mein add karo",
            "💖 Samosa favorite kar do",
            "🧾 Mera bill bana do",
          ],
        };
      }

      // ========================================================
      // 0-B. MULTI-ACTION BATCH PIPELINE (Simultaneous Tasks)
      // ========================================================
      const hasReviewIntent =
        clean.includes("review") ||
        clean.includes("feedback") ||
        clean.includes("tareef") ||
        clean.includes("rating") ||
        clean.includes("review snd") ||
        clean.includes("review do") ||
        clean.includes("review bhej");

      const hasFavIntent =
        (clean.includes("favorite") ||
          clean.includes("favourite") ||
          clean.includes("fav") ||
          clean.includes("pasandeeda") ||
          clean.includes("pasand")) &&
        !clean.includes("favorite se hata") &&
        !clean.includes("remove from favorite");

      const hasCartIntent =
        (clean.includes("cart") ||
          clean.includes("add to cart") ||
          clean.includes("tokri") ||
          clean.includes("cart kr do") ||
          clean.includes("cart dalo")) &&
        !clean.includes("cart se nikal") &&
        !clean.includes("cart khali");

      const hasOrderIntent =
        clean.includes("order do") ||
        clean.includes("order book") ||
        clean.includes("order karna") ||
        clean.includes("order lagao") ||
        clean.includes("ka order") ||
        clean.includes("mangwa do") ||
        clean.includes("order place") ||
        clean.includes("order de do") ||
        clean.includes("delivery bhej");

      const hasTableIntent =
        clean.includes("table") ||
        clean.includes("tabel") ||
        clean.includes("seat") ||
        clean.includes("reservation") ||
        clean.includes("reserve") ||
        clean.includes("table book");

      const activeIntentsCount = [
        hasReviewIntent,
        hasFavIntent,
        hasCartIntent,
        hasOrderIntent,
        hasTableIntent,
      ].filter(Boolean).length;

      if (activeIntentsCount >= 2) {
        const steps = [];
        let attachedProduct = null;
        let orderFormObj = null;
        let tableFormObj = null;

        // 1. Review Submission
        if (hasReviewIntent) {
          const reviewText =
            "Al Madina Restaurant Karachi ka khana nihayat lazeez, taaza aur ba-barkat hai! Chicken Biryani, Mutton Handi Karahi aur Samosay lajawab hain. VIP service aur cooperative staff! 5 Stars! ⭐⭐⭐⭐⭐";
          addReview({
            name: customerName,
            rating: 5,
            comment: reviewText,
            status: "pending",
          });
          steps.push(
            `🌟 **1. Review Send Kar Diya:**\n"${reviewText}"\n*(Status: Submitted — Admin check kar ke OK karenge to live display ho jayega)*`
          );
        }

        // 2. Favorites Execution
        if (hasFavIntent) {
          let favItems = findDishesForContext(clean, "favorite");
          if (favItems.length === 0) favItems = findDishesInText(clean, lowerRaw);
          if (favItems.length > 0) {
            favItems.forEach((it) => {
              addToFavorites({
                id: it.product.id,
                name: it.product.name,
                price: it.product.price,
                image: it.product.image,
              });
            });
            steps.push(
              `💖 **2. Favorites Mein Shamil Kar Diya:**\n` +
                favItems.map((it) => `• **${it.product.name}** (Rs ${it.product.price})`).join("\n")
            );
            if (!attachedProduct) attachedProduct = favItems[0].product;
          }
        }

        // 3. Cart Execution
        if (hasCartIntent) {
          let cartItemsFound = findDishesForContext(clean, "cart");
          if (cartItemsFound.length === 0) cartItemsFound = findDishesInText(clean, lowerRaw);
          if (cartItemsFound.length > 0) {
            cartItemsFound.forEach((it) => {
              addToCart(
                {
                  id: it.product.id,
                  name: it.product.name,
                  price: it.product.price,
                  image: it.product.image,
                },
                it.quantity || 1
              );
            });
            steps.push(
              `🛒 **3. Cart Mein Add Kar Diya:**\n` +
                cartItemsFound
                  .map((it) => `• ${it.quantity || 1}x **${it.product.name}** (Rs ${(it.product.price || 0) * (it.quantity || 1)})`)
                  .join("\n")
            );
            if (!attachedProduct) attachedProduct = cartItemsFound[0].product;
          }
        }

        // 4. Order Information Request & Form
        if (hasOrderIntent) {
          let orderedItems = findDishesForContext(clean, "order");
          if (orderedItems.length === 0) {
            orderedItems = [
              { product: MENU_RECOMMENDATIONS.samosa, quantity: 5 },
              { product: MENU_RECOMMENDATIONS.chai, quantity: 1 },
            ];
          }
          const formattedItems = orderedItems.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            price: it.product.price,
            quantity: it.quantity || 1,
            image: it.product.image,
          }));
          const subtotal = formattedItems.reduce((acc, it) => acc + (it.price || 0) * it.quantity, 0);
          orderFormObj = {
            initialItems: formattedItems,
            total: subtotal + 150,
          };
          steps.push(
            `📦 **4. Order Information:**\nAap ke kehne ke mutabiq items (${formattedItems.map((it) => `${it.quantity}x ${it.name}`).join(", ")}) ka order tayyar hai.\nAb baraye meherbani neeche diye gaye Form mein apni **Order Information** (Naam, Phone, Karachi Address) enter kar ke Confirm karein take main order finalize kar doon:`
          );
        }

        // 5. Table Booking Request & Form
        if (hasTableIntent) {
          tableFormObj = { active: true };
          steps.push(
            `🍽️ **5. Table Booking Information:**\nAapki Table Reservation ke liye neeche diye gaye Form mein Guests, Date aur Time verify kar ke Confirm karein:`
          );
        }

        // 6. Owner Rabta & Payment Details
        if (hasOrderIntent || hasTableIntent) {
          steps.push(
            `👑 **Al Madina Owner Rabta & Payment Details:**\n• Restaurant Owner Phone: ${RESTAURANT_PHONE} (0300-1234567)\n• WhatsApp Direct: https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}\n• Easypaisa / JazzCash / Bank Transfer: 0300-1234567 (Title: Al Madina Foods Karachi)\n• Karachi Location: 25, 2 1/2 Korangi, Sector 33-B, Korangi, Karachi\n\n💡 *Aap asani se payment clear kar sakte hain. Jaise hi payment transfer kar ke screenshot bhejenge ya call karenge, aap ke order aur table par osi waqt foran kaam start kar diya jaye ga!*`
          );
        }

        return {
          text: steps.join("\n\n"),
          product: attachedProduct,
          orderForm: orderFormObj,
          tableForm: tableFormObj,
          ownerContact: Boolean(hasOrderIntent || hasTableIntent),
          suggestedQuestions: [
            "📦 Order Confirm Karein",
            "🍽️ Table Book Karein",
            "📱 Owner WhatsApp se rabta",
            "Menu dekhein",
          ],
        };
      }

      // ========================================================
      // 1. ADVANCE PRO: FAVORITES MANAGEMENT
      // ========================================================
      // Case A: Remove from Favorites
      const isFavRemove =
        (clean.includes("favorite") || clean.includes("favourite") || clean.includes("fav")) &&
        (clean.includes("remove") || clean.includes("nikal") || clean.includes("hata") || clean.includes("khatam") || clean.includes("delete") || clean.includes("unfav"));

      if (isFavRemove) {
        const matched = findDishesInText(clean, lowerRaw);
        if (matched.length > 0) {
          matched.forEach((m) => removeFromFavorites(m.product.id));
          const names = matched.map((m) => m.product.name).join(", ");
          return {
            text: `Ji bilkul Bhai! **${names}** ko aapki Favorites list se remove kar diya gaya hai. 👍`,
            product: null,
            suggestedQuestions: [
              "💖 Meri baki favorites dikhayein",
              "Menu section pe le jao",
              "Mutton Karahi favorite karein",
            ],
          };
        } else {
          return {
            text: "Bhai, aap konsi dish (maslan Samosa, Mutton Karahi, ya Biryani) Favorites se nikalna chahte hain? Dish ka naam batayein main foran remove kar doon.",
            product: null,
            suggestedQuestions: ["Samosa favorite se hatao", "Favorites list dikhao"],
          };
        }
      }

      // Case B: View Favorites
      const isFavView =
        (clean.includes("favorite") || clean.includes("favourite") || clean.includes("fav")) &&
        (clean.includes("dikhao") || clean.includes("dikhayein") || clean.includes("kya hai") || clean.includes("kholo") || clean.includes("open") || clean.includes("list") || clean.includes("check"));

      if (isFavView) {
        if (!favorites || favorites.length === 0) {
          return {
            text: "Aapki Favorites list abhi khali hai. Aap kisi bhi dish ko 'favorite kar do' keh kar ya menu mein Heart icon par click kar ke yahan save kar sakte hain! 💖",
            product: null,
            suggestedQuestions: [
              "💖 Samosa favorite kar do",
              "💖 Mutton Karahi favorite kar do",
              "Menu section dikhao",
            ],
          };
        }
        const list = favorites.map((f) => `• **${f.name}** (Rs ${f.price || "N/A"})`).join("\n");
        return {
          text: `Yeh rahi aapki VIP Favorites list: 💖\n\n${list}\n\nAap website ke top header par Heart icon par click kar ke bhi inhein dekh sakte hain aur direct mangwa sakte hain!`,
          product: favorites[0]?.image ? favorites[0] : null,
          suggestedQuestions: [
            "🛒 Yeh sab Cart mein add karein",
            "Mera order place karein",
            "Menu section dikhayein",
          ],
        };
      }

      // Case C: Add to Favorites (e.g. "samosa ko favorite kr do", "biryani favorite dalo")
      const isFavAdd =
        clean.includes("favorite") ||
        clean.includes("favorites") ||
        clean.includes("favourite") ||
        clean.includes("pasandeeda") ||
        clean.includes("fav me") ||
        clean.includes("fav mein") ||
        clean.includes("like");

      if (isFavAdd) {
        const matched = findDishesInText(clean, lowerRaw);
        if (matched.length > 0) {
          matched.forEach((m) => {
            addToFavorites({
              id: m.product.id,
              name: m.product.name,
              price: m.product.price,
              image: m.product.image,
              desc: m.product.desc,
            });
          });
          const summary = matched.map((m) => `• **${m.product.name}** (Rs ${m.product.price})`).join("\n");
          return {
            text: `Wah zabardast choice Bhai! Maine yeh dish(es) aapki Favorites list mein save kar di hain: 💖\n\n${summary}\n\nAap website ke top header par Heart icon par click kar ke ya mujhe bol kar inhein kabhi bhi ek click mein mangwa sakte hain!`,
            product: matched[0].product,
            suggestedQuestions: [
              "🛒 Yeh dish Cart mein add karein",
              "📦 Mera Order book karein",
              "Favorites list dikhao",
            ],
          };
        } else {
          return {
            text: "Aap Al Madina Restaurant ki konsi dish (maslan Vegetable Samosa, Mutton Karahi, Chicken Biryani, ya Dal Makhani) Favorites mein save karna chahte hain? Dish ka naam batayein main foran add kar doon!",
            product: null,
            suggestedQuestions: [
              "💖 Samosa favorite kar do",
              "💖 Mutton Karahi favorite kar do",
              "💖 Chicken Biryani favorite kar do",
            ],
          };
        }
      }

      // ========================================================
      // 2. ADVANCE PRO: CART MANAGEMENT
      // ========================================================
      // Case A: Remove from Cart
      const isCartRemove =
        clean.includes("cart") &&
        (clean.includes("remove") || clean.includes("nikal") || clean.includes("hata") || clean.includes("delete") || clean.includes("kam"));

      if (isCartRemove) {
        const matched = findDishesInText(clean, lowerRaw);
        if (matched.length > 0) {
          matched.forEach((m) => removeFromCart(m.product.id));
          const names = matched.map((m) => m.product.name).join(", ");
          return {
            text: `Ji bhai, **${names}** ko aapki cart se remove kar diya gaya hai. Cart update ho chuki hai! 🛒`,
            product: null,
            suggestedQuestions: [
              "🛒 Baki Cart dikhao",
              "Khana order karein",
              "Menu pe le jao",
            ],
          };
        } else {
          return {
            text: "Bhai, aap konsi dish cart se nikalna chahte hain? Maslan 'biryani cart se nikal do' ya 'samosa cart se hata do'.",
            product: null,
            suggestedQuestions: ["Biryani cart se nikal do", "Cart dikhao"],
          };
        }
      }

      // Case B: Clear Cart
      const isCartClear =
        clean.includes("cart") &&
        (clean.includes("khali") || clean.includes("clear") || clean.includes("sab nikal") || clean.includes("empty"));

      if (isCartClear) {
        clearCart();
        return {
          text: "Aapki cart mukammal taur par khali kar di gayi hai! 🗑️\n\nAap dobara Menu se apni pasandeeda dishes add kar sakte hain.",
          product: null,
          suggestedQuestions: [
            "Menu section dikhao",
            "🍗 Chicken Biryani add to cart",
            "🍖 Mutton Karahi add to cart",
          ],
        };
      }

      // Case C: View Cart
      const isCartView =
        clean.includes("cart") &&
        (clean.includes("dikhao") || clean.includes("dikhayein") || clean.includes("kholo") || clean.includes("open") || clean.includes("check") || clean.includes("kya hai") || clean.includes("view"));

      if (isCartView) {
        if (!cartItems || cartItems.length === 0) {
          return {
            text: "Aapki cart abhi khali hai! 🛒\n\nAl Madina ki mashhoor Mutton Karahi, Chicken Biryani ya Samosa add karein.",
            product: null,
            suggestedQuestions: [
              "🍗 Chicken Biryani cart mein dalo",
              "🍖 Mutton Karahi cart mein dalo",
              "Menu pe le chalo",
            ],
          };
        }
        const summary = cartItems.map((c) => `• ${c.quantity}x **${c.name}** — Rs ${c.price * c.quantity}`).join("\n");
        const subtotal = cartItems.reduce((s, c) => s + c.price * c.quantity, 0);
        return {
          text: `Aapki Cart mein darj zail items mojood hain: 🛒\n\n${summary}\n\n• Delivery Charge: Rs 150\n✨ **Kul Total:** Rs ${subtotal + 150}\n\nKiya aap abhi Karachi Home Delivery order confirm karna chahte hain?`,
          product: null,
          suggestedQuestions: [
            "📦 Abhi Order Confirm Karein",
            "Cart khali kar do",
            "Kashmiri Chai bhi add karein",
          ],
        };
      }

      // Case D: Add to Cart (single or multi-dish)
      const isCartAdd =
        clean.includes("add to cart") ||
        clean.includes("cart me") ||
        clean.includes("cart mein") ||
        clean.includes("cart shamil") ||
        clean.includes("cart dalo") ||
        clean.includes("cart dal do") ||
        clean.includes("cart add");

      if (isCartAdd) {
        const matched = findDishesInText(clean, lowerRaw);
        if (matched.length > 0) {
          matched.forEach((m) => {
            addToCart(
              {
                id: m.product.id,
                name: m.product.name,
                price: m.product.price,
                image: m.product.image,
              },
              m.quantity
            );
          });
          const summary = matched
            .map((m) => `• ${m.quantity}x **${m.product.name}** (Rs ${m.product.price * m.quantity})`)
            .join("\n");
          return {
            text: `Bhai zabardast! Aapke kehne par cart mein yeh items add kar diye gaye hain: 🛒\n\n${summary}\n\nKiya aap abhi Karachi Home Delivery order place karna chahte hain ya mazeed kuch mangwana hai?`,
            product: matched[0].product,
            suggestedQuestions: [
              "📦 Abhi Order Confirm Karein",
              "🧾 Mera mukammal bill batao",
              "Kashmiri Chai bhi add karein",
            ],
          };
        }
      }

      // ========================================================
      // 3. ADVANCE PRO: ORDER CANCELLATION
      // ========================================================
      const isOrderCancel =
        clean.includes("order cancel") ||
        clean.includes("cancel order") ||
        clean.includes("order khatam") ||
        clean.includes("order nahi chahiye") ||
        clean.includes("cancel my order");

      if (isOrderCancel) {
        if (orders && orders.length > 0) {
          const targetOrder = orders[0];
          updateOrderStatus(targetOrder.id, "cancelled");
          return {
            text: `Bhai, aapka **Order #${targetOrder.id}** kamyabi ke sath **Cancel** kar diya gaya hai. ❌\n\nAgar aap dobara kisi aur dish ka order lagwana chahein ya koi masla ho to be-jhi-jhak batayein!`,
            product: null,
            suggestedQuestions: [
              "Naya order book karein",
              "Menu section dikhao",
              "Owner WhatsApp se rabta",
            ],
          };
        } else {
          return {
            text: "Bhai aapka koi active order nahi mila jo cancel kiya ja sakay. Agar aapne pehle order lagwaya tha to Order ID batayein.",
            product: null,
            suggestedQuestions: ["Menu dekhein", "Table book karein"],
          };
        }
      }

      // ========================================================
      // 4. ADVANCE PRO: ORDER TRACKING
      // ========================================================
      const isOrderTrack =
        clean.includes("track") ||
        clean.includes("kahan hai order") ||
        clean.includes("parcel kahan") ||
        clean.includes("rider kahan") ||
        clean.includes("order status");

      if (isOrderTrack) {
        const activeOrder = orders?.[0];
        if (activeOrder) {
          let statusUrdu = "Awaiting Owner WhatsApp Confirmation";
          if (activeOrder.status === "awaiting_approval") {
            statusUrdu = "⏳ Pehle pending hai (Owner WhatsApp Confirmation ka intezar hai)";
          } else if (activeOrder.status === "preparing") {
            statusUrdu = "🍳 Kitchen mein taaza tayyar ho raha hai";
          } else if (activeOrder.status === "out_for_delivery") {
            statusUrdu = "🛵 Rider parcel le kar nikal chuka hai (Live bike moving on map)";
          } else if (activeOrder.status === "delivered") {
            statusUrdu = "✅ Parcel deliver ho chuka hai";
          } else if (activeOrder.status === "cancelled") {
            statusUrdu = "❌ Order cancel ho chuka hai";
          }

          return {
            text: `Aapke taaza **Order #${activeOrder.id}** ki live status yeh hai:\n\n📋 **Status:** ${statusUrdu}\n💵 **Total Bill:** Rs ${activeOrder.total}\n📍 **Delivery Address:** ${activeOrder.customer?.address || "Karachi"}\n\n(Note: Jaise hi owner WhatsApp par OK karenge, website par live bike tracking chalna shuru ho jayegi!)`,
            product: null,
            suggestedQuestions: [
              `🛵 Live Tracking Page Kholo (#${activeOrder.id})`,
              "Order cancel kar do",
              "WhatsApp Manager se rabta",
            ],
          };
        } else {
          return {
            text: "Aapka koi active order record mein mojood nahi hai. Khana mangwane ke liye Menu se dish select karein ya mujhe 'order confirm kar do' kahein!",
            product: null,
            suggestedQuestions: ["Menu section dikhayein", "Table book karein"],
          };
        }
      }

      // ========================================================
      // 5. ADVANCE PRO: ORDER PLACEMENT
      // ========================================================
      const isOrderPlace =
        clean.includes("order place") ||
        clean.includes("order confirm") ||
        clean.includes("order bhej do") ||
        clean.includes("order book") ||
        clean.includes("order dena") ||
        clean.includes("order karna") ||
        clean.includes("order krna") ||
        clean.includes("mangwa do") ||
        clean.includes("delivery bhej do") ||
        clean.includes("order lagwa do");

      if (isOrderPlace) {
        let orderItems = [];
        if (cartItems && cartItems.length > 0) {
          orderItems = cartItems;
        } else {
          const found = findDishesInText(clean, lowerRaw);
          if (found.length > 0) {
            orderItems = found.map((f) => ({
              id: f.product.id,
              name: `${f.quantity}x ${f.product.name}`,
              price: f.product.price,
              quantity: f.quantity,
              image: f.product.image,
            }));
          } else {
            orderItems = [
              { id: 4, name: "Chicken Biryani (2 Plates)", price: 680, quantity: 2, image: "/Images/menu/Chicken Biryani.jpg" },
              { id: 3, name: "Mutton Karahi (1 KG Handi)", price: 1450, quantity: 1, image: "/Images/menu/Mutton Karahi.jpg" },
            ];
          }
        }

        const orderTotal = orderItems.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0) + 150;

        const newOrder = addOrder({
          items: orderItems,
          fulfillment: "delivery",
          paymentMethod: "cod",
          status: "awaiting_approval", // Pending owner WhatsApp confirmation!
          customer: {
            name: customerName,
            phone: "0300-1234567",
            address: "Sector 36-B, Korangi, Karachi",
          },
          total: orderTotal,
        });

        return {
          text: `bhai order complete successfully ho chuka hy (Order #${newOrder.id}) ab aap whatsap (${RESTAURANT_PHONE} / +92 300 1234567) pr payment wageera okay kare pir jese hi owner ki trf se okay ka massge ay ga to pir apko tarcking baick website pr live location me show ki jay gi k kahan Aap ka parsal aa giya hy 🛵\n\n(Bhai yaad rahe k jb tk ownr okay nahi kare ga tb tk baick tracking me show nahi ki jay gi k kahan aa gai kun k abhi order pendding me hy).`,
          orderPlaced: newOrder,
          whatsappSupport: true,
          product: null,
          suggestedQuestions: [
            `🛵 Live Tracking Dekhein (#${newOrder.id})`,
            "💬 Owner WhatsApp par OK karein",
            "Table bhi reserve karein",
          ],
        };
      }

      // ========================================================
      // 6. ADVANCE PRO: SUBMIT REVIEW
      // ========================================================
      const isReviewSubmit =
        clean.includes("review dena") ||
        clean.includes("review likh") ||
        clean.includes("review add") ||
        clean.includes("star review") ||
        clean.includes("rating do") ||
        clean.includes("review submit") ||
        ((clean.includes("boht acha") || clean.includes("lajawab") || clean.includes("zabardast") || clean.includes("delicious")) && clean.includes("review"));

      if (isReviewSubmit) {
        const comment = raw.length > 15 ? raw : "Al Madina Restaurant ka khana nihayat lazeez aur taaza tha. Zabardast service!";
        const newRev = addReview({
          name: customerName,
          rating: 5,
          comment,
          status: "pending",
        });

        return {
          text: `Boht boht shukriya aapke review ka! ⭐⭐⭐⭐⭐\n\n📋 **Review:** "${comment}"\n👤 **Naam:** ${newRev.name}\n\n⏳ **Status: Pending Admin Approval**\n\n(Note: Aapke pass show ho raha hai k aapka review darj ho chuka hai, lekin actually abhi kisi customer ko show nahi hoga jab tak Admin check kar ke OK na karein. Jaise hi Admin OK karenge to yeh sabhi customers ko live dikhega!)`,
          product: null,
          suggestedQuestions: [
            "Reviews section dekhein",
            "Menu se dishes order karein",
            "Table reserve karein",
          ],
        };
      }

      // ========================================================
      // 7. ADVANCE PRO: SEND EMAIL / CONTACT MESSAGE
      // ========================================================
      const isEmailSend =
        clean.includes("email send") ||
        clean.includes("email bhejo") ||
        clean.includes("message send") ||
        clean.includes("message bhejo") ||
        clean.includes("owner ko message") ||
        clean.includes("management ko message") ||
        clean.includes("mail bhej do");

      if (isEmailSend) {
        const inquiry = {
          id: "inq_" + Date.now(),
          customer: customerName,
          email: customerEmail,
          message: raw,
          date: new Date().toISOString(),
        };
        try {
          const current = JSON.parse(localStorage.getItem("am_customer_inquiries") || "[]");
          localStorage.setItem("am_customer_inquiries", JSON.stringify([inquiry, ...current]));
        } catch {}

        return {
          text: `Aapka message Al Madina Restaurant Management ko kamyabi ke sath bhej diya gaya hai! 📩\n\n📋 **Message:** "${raw}"\n👤 **Sender:** ${customerName}\n\nHumari team jald hi aapse WhatsApp (+92 300 1234567) ya email par rabta karegi.`,
          whatsappSupport: true,
          product: null,
          suggestedQuestions: [
            "WhatsApp direct rabta",
            "Menu section pe le jao",
            "Table book karein",
          ],
        };
      }

      // ========================================================
      // 8. ADVANCE PRO: TABLE RESERVATION & CANCELLATION
      // ========================================================
      const isTableCancel =
        clean.includes("table cancel") ||
        clean.includes("reservation cancel") ||
        clean.includes("booking cancel");

      if (isTableCancel) {
        if (reservations && reservations.length > 0) {
          const targetRes = reservations[0];
          updateReservationStatus(targetRes.id, "cancelled");
          return {
            text: `Ji bhai, aapki Table Booking #${targetRes.id} cancel kar di gayi hai.`,
            product: null,
            suggestedQuestions: ["Nayi table book karein", "Menu dekhein"],
          };
        } else {
          return {
            text: "Aapki koi active table reservation nahi mili.",
            product: null,
            suggestedQuestions: ["Table book karein", "Menu dekhein"],
          };
        }
      }

      const isTableBooking =
        clean.includes("table book") ||
        clean.includes("table booking") ||
        clean.includes("table chahiye") ||
        clean.includes("seat book") ||
        clean.includes("table reserve") ||
        clean.includes("family hall");

      if (isTableBooking) {
        let guests = 4;
        const guestMatch = clean.match(/(\d+)\s*(afraad|people|persons|guest|guests|banday)/);
        if (guestMatch) guests = parseInt(guestMatch[1], 10);
        else if (clean.includes("2") || clean.includes("do")) guests = 2;
        else if (clean.includes("6") || clean.includes("chhe")) guests = 6;

        const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10);
        const newBooking = addReservation({
          name: customerName,
          phone: "0300-1234567",
          date: tomorrow,
          time: "20:30",
          guests,
          notes: "Booked automatically via Al Madina AI Assistant",
          status: "pending",
        });

        return {
          text: `🍽️ Table Booking Request Receive Ho Gayi Hai!\n\n📋 Booking ID: #${newBooking.id}\n👤 Mehmaan: ${newBooking.name}\n👥 Seating: ${newBooking.guests} Afraad (Family Hall)\n📅 Tareekh: ${newBooking.date} · ⏰ Waqt: ${newBooking.time}\n\n⏳ **Status: Pending Owner Approval**\n\n(Note: Pehle yeh booking pending rahegi, jaise hi restaurant owner check kar ke **OK** karenge to status Confirmed ho jayega. Yeh details aapki Booking History mein bhi live save ho chuki hain!)`,
          product: null,
          suggestedQuestions: [
            "📅 Booking History Dekhein",
            "📱 WhatsApp Owner se rabta",
            "Menu se dishes order karein",
          ],
        };
      }

      // ========================================================
      // 9. ADVANCE PRO: SECTION NAVIGATION
      // ========================================================
      const isNavIntent =
        clean.includes("go to") ||
        clean.includes("le jao") ||
        clean.includes("le jaon") ||
        clean.includes("le chalo") ||
        clean.includes("kholo") ||
        clean.includes("open") ||
        clean.includes("dikhayein") ||
        clean.includes("dikhao") ||
        clean.includes("section");

      if (isNavIntent) {
        let targetSection = null;
        let sectionName = "";

        if (clean.includes("menu") || clean.includes("khana") || clean.includes("dish")) {
          targetSection = "menu";
          sectionName = "Menu Section";
        } else if (clean.includes("deal") || clean.includes("offer") || clean.includes("discount")) {
          targetSection = "offers";
          sectionName = "Special Deals & Offers Section";
        } else if (clean.includes("review") || clean.includes("feedback") || clean.includes("tareef")) {
          targetSection = "reviews";
          sectionName = "Customer Reviews Section";
        } else if (clean.includes("booking") || clean.includes("table") || clean.includes("reservation") || clean.includes("seat")) {
          targetSection = "reservations";
          sectionName = "Table Reservations Section";
        } else if (clean.includes("about") || clean.includes("bawarchi") || clean.includes("chef") || clean.includes("history")) {
          targetSection = "about";
          sectionName = "About Us (Hamari Tareekh)";
        } else if (clean.includes("gallery") || clean.includes("photo") || clean.includes("tasweer")) {
          targetSection = "gallery";
          sectionName = "Food Gallery";
        } else if (clean.includes("contact") || clean.includes("location") || clean.includes("map") || clean.includes("pata")) {
          targetSection = "contact";
          sectionName = "Contact & Live Location Map";
        } else if (clean.includes("cart page") || clean.includes("cart kholo")) {
          navigate("/cart");
          return {
            text: "Yeh len, Cart page open kar diya hai! 🛒",
            product: null,
            suggestedQuestions: ["Mera order confirm karein", "Menu pe wapas chalo"],
          };
        } else if (clean.includes("favorite page") || clean.includes("favorites page")) {
          navigate("/favorites");
          return {
            text: "Yeh len, Favorites page open kar diya hai! 💖",
            product: null,
            suggestedQuestions: ["Cart mein add karein", "Menu pe wapas chalo"],
          };
        } else if (clean.includes("order history") || clean.includes("orders page")) {
          navigate("/orders");
          return {
            text: "Yeh len, Orders & Bookings History page open kar diya hai! 📋",
            product: null,
            suggestedQuestions: ["Menu dekhein", "Track order"],
          };
        }

        if (targetSection) {
          setTimeout(() => {
            const el = document.getElementById(targetSection) || document.querySelector(`#${targetSection}`);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 120);

          return {
            text: `Yeh len, aapka ${sectionName} open kar diya hai! ✨ Kiya ab koi lazeez cheez Cart ya Favorites mein shamil karni hai, ya main aapke liye order confirm kar doon?`,
            product: null,
            suggestedQuestions: [
              "🛒 Ye dish Cart mein add karein",
              "💖 Favorites mein shamil karein",
              "📦 Mera Order book karein",
              "🍽️ Table reserve karein",
            ],
          };
        }
      }

      // ========================================================
      // 10. ADVANCE PRO: BILL ESTIMATION
      // ========================================================
      const isBillRequest = clean.includes("bill") || clean.includes("total") || clean.includes("hisab") || clean.includes("calculate") || clean.includes("banao");
      let billData = null;
      if (isBillRequest) {
        billData = {
          items: [
            { name: "Chicken Biryani (2 Plates)", price: 1360 },
            { name: "Desi Mutton Karahi (1 KG Handi)", price: 1450 },
            { name: "Charcoal Seekh Kebab (1 Plate)", price: 650 },
          ],
          subtotal: 3460,
          delivery: 150,
          grandTotal: 3610,
        };
        return {
          text: `Yaqeenan! Yeh lijiye aapke muntakhib items ka mukammal Bill Estimate:\n\n📋 **BILL ESTIMATE:**\n• 2x Chicken Biryani: Rs 1,360\n• 1x Handi Mutton Karahi: Rs 1,450\n• 1x BBQ Seekh Kebab: Rs 650\n• Delivery Charge (All Karachi): Rs 150\n✨ **Kul Total Raqam:** Rs 3,610\n\n🍲 **SEHAT BAKHSH FAIDAY:**\n• Chicken Biryani: Khalis zafran aur sela basmati chawal jo hazme ke liye behtareen hain.\n• Mutton Karahi: Taaza Mandi ka bakra organic desi ghee mein tayyar — natural iron aur zinc se labrez.\n• Seekh Kebab: Koylay par char-grill low-calorie lean protein.\n\nKya aap yeh items cart mein add kar ke checkout karna chahenge?`,
          bill: billData,
          product: null,
          suggestedQuestions: ["Yehi order abhi confirm karein", "Kashmiri Chai add karein", "Delivery kitni der mein aayegi?"],
        };
      }

      // ========================================================
      // 10-B. WEBSITE MENU STATS: "Website par kitne items hain?"
      // ========================================================
      const isItemCountQuery =
        (clean.includes("kitne item") ||
          clean.includes("kitni dishes") ||
          clean.includes("kitne product") ||
          clean.includes("total item") ||
          clean.includes("total dish") ||
          clean.includes("total dishes")) &&
        (clean.includes("website") || clean.includes("menu") || clean.includes("paas") || clean.includes("hain"));

      if (isItemCountQuery) {
        const totalItemsCount = MENU_ITEMS.length;
        const categories = ["👑 VIP Selection", "Starters", "Mains", "Desserts", "Drinks"];
        const categoryBreakdown = categories
          .map((cat) => {
            const count = MENU_ITEMS.filter((it) => it.category === cat).length;
            return `• **${cat}:** ${count} Items`;
          })
          .join("\n");

        return {
          text: `Bhai jaan, hamari Al Madina Restaurant ki website par kul **${totalItemsCount} Special Shahi Dishes** dastyab hain! 🍽️✨\n\n📋 **Category-wise Tafseelat:**\n${categoryBreakdown}\n\nTamam dishes zabiha halaal, taaza desi masalon aur royal recipe ke sath tayyar ki jati hain. Kiya aap tamam items ki prices dekhna chahte hain?`,
          product: MENU_ITEMS[0],
          suggestedQuestions: [
            "Sabhi items ki prices show karo",
            "Kon kon se products offer me hain?",
            "Chicken Biryani order karein",
            "Menu section dekhein",
          ],
        };
      }

      // ========================================================
      // 10-C. ALL DISHES & RATES: "Sabhi items ki prices show kro"
      // ========================================================
      const isAllPricesQuery =
        (clean.includes("sab") || clean.includes("sabhi") || clean.includes("tamam") || clean.includes("all")) &&
        (clean.includes("price") || clean.includes("rate") || clean.includes("rates") || clean.includes("keemat") || clean.includes("daam") || clean.includes("list")) &&
        !clean.includes("order");

      if (isAllPricesQuery) {
        const fullRateList = MENU_ITEMS.map((it) => {
          const discountInfo = it.discount > 0 ? ` (${it.discount}% OFF Offer)` : "";
          return `• **${it.name}:** Rs ${it.price}${discountInfo} [${it.category}]`;
        }).join("\n");

        return {
          text: `Yeh lijiye Bhai jaan! Al Madina Restaurant Karachi ki tamam dishes ki mukammal Rate List hazir hai: 📜✨\n\n${fullRateList}\n\n🛵 **Delivery Charge:** All Karachi sirf Rs 150\n💡 Aap kisi bhi dish ka naam bol kar foran Cart mein add karwa sakte hain ya direct parcel order place kar sakte hain!`,
          product: MENU_ITEMS[1],
          suggestedQuestions: [
            "Kon kon se products offer me hain?",
            "10 samosa aur 1 biryani order karo",
            "Table book karein",
            "Cart dikhayein",
          ],
        };
      }

      // ========================================================
      // 10-D. OFFERS & DEALS: "Kon kon se products offer me chal rahe hain aur kitne offer me hain?"
      // ========================================================
      const isOfferQuery =
        clean.includes("offer") ||
        clean.includes("discount") ||
        clean.includes("deal") ||
        clean.includes("bachat") ||
        clean.includes("choot") ||
        clean.includes("sasti");

      if (isOfferQuery) {
        const discountedItems = MENU_ITEMS.filter((it) => it.discount > 0);
        const offerList = discountedItems
          .map((it) => {
            const originalPrice = Math.round(it.price / (1 - it.discount / 100));
            return `• **${it.name}:** Rs ${it.price} (Original: Rs ${originalPrice} — **${it.discount}% FLAT OFF**)`;
          })
          .join("\n");

        return {
          text: `Al Madina Restaurant par is waqt kul **${discountedItems.length} VIP Products Special Discount Offer** par chal rahe hain! 🎉🔥\n\n🎁 **Running Offers & Discounts:**\n${offerList}\n\n👑 **Special Deal Notice:** Yeh deals limited time period ke liye dastiyab hain. Aap in mein se koi bhi deal foran cart mein add ya order kar sakte hain!`,
          product: discountedItems[0],
          suggestedQuestions: [
            "VIP Shahi Dawat Platter cart mein dalo",
            "Sabhi items ki prices show karo",
            "Table book karein",
            "Ek acha sa review likh do",
          ],
        };
      }

      // ========================================================
      // 10-E. DIRECT WRITE REVIEW REQUEST: "Bhai ek review likh do"
      // ========================================================
      const isWriteReviewRequest =
        clean.includes("review likh do") ||
        clean.includes("review likh de") ||
        clean.includes("review likho") ||
        clean.includes("ek review do") ||
        clean.includes("review bana do") ||
        clean.includes("review tayyar karo");

      if (isWriteReviewRequest) {
        const reviewText =
          "Al Madina Restaurant Karachi ka khana nihayat lazeez, khushbudar aur taaza hai! Chicken Biryani dum pukht tareeqay se pakki hui hai, Mutton Karahi mitti ki handi mein desi ghee ke sath lajawab hai aur staff boht cooperative hai. 5 Stars VIP Service! ⭐⭐⭐⭐⭐";
        addReview({
          name: customerName,
          rating: 5,
          comment: reviewText,
          status: "pending",
        });

        return {
          text: `🌟 **Al Madina Review darj kar diya gaya hai:**\n\n"${reviewText}"\n\n👤 **Reviewer:** ${customerName}\n⭐ **Rating:** 5/5 Stars\n⏳ **Status: Submitted (Pending Admin Approval)**\n\n(Aapka review website database mein darj ho gaya hai. Jaise hi Admin panel se OK kiya jayega, yeh tamam customers ko live Customer Reviews section mein show hona shuru ho jayega!)`,
          reviewPrompt: true,
          suggestedQuestions: [
            "Reviews section dekhein",
            "Dishes order karein",
            "Table reserve karein",
          ],
        };
      }

      // Check for Gemini API or rich culinary fallback
      const geminiReply = await callServerGemini(raw);
      if (geminiReply) {
        return {
          text: geminiReply,
          product: findDishesInText(clean, lowerRaw)[0]?.product || null,
          bill: null,
          reviewPrompt: false,
          whatsappSupport: false,
          suggestedQuestions: [
            "🍖 Mutton Karahi ki price aur details?",
            "🍛 Chicken Biryani cart mein dalo",
            "💖 Samosa favorite kar do",
            "📍 Karachi branch kahan hai?",
          ],
        };
      }

      // Built-in culinary fallback
      const isMuttonInquiry =
        clean.includes("mutton") ||
        clean.includes("bakra") ||
        lowerRaw.includes("button") ||
        lowerRaw.includes("buttn") ||
        lowerRaw.includes("batan");

      if (isMuttonInquiry) {
        const item = MENU_RECOMMENDATIONS.karahi;
        return {
          text: `Bhai, aapka matlab 'Mutton' (Bakray ke gosht ki dishes) tha! Al Madina Restaurant Karachi mein hamari mashhoor Mutton dishes aur latest VIP rates yeh hain:\n\n🍖 **1. Desi Mitti Handi Mutton Karahi (1 KG):** Rs 1,450\n(Taaza zabiha halaal bakray ka gosht, khalis desi ghee, taaza tamatar, roasted zeera tadka aur pissa hua garam masala)\n\n👑 **2. VIP Royal Handi Mutton Feast Platter:** Rs 2,200\n(1 KG Mutton Karahi + 4x Rogheni Naan + Fresh Salad & Raita + 2 chilled Kashmiri Pink Chai)\n\n🍛 **3. Shahi Mutton Dum Biryani:** Rs 950\n(Zafrani sela basmati chawal aur naram chaamp ka gosht)\n\n🔥 **4. BBQ Mutton Seekh Kebabs (4 Pcs):** Rs 850\n(Koylay par sekha hua rasdar mutton seekh kebab)\n\n✨ **Sehat Bakhsh Faiday:**\nKhalis desi ghee aur Mandi bakray ka taaza gosht body vitality, natural iron, zinc aur high-quality protein ka behtareen zariya hai.\n\nKya aap Desi Mitti Handi Mutton Karahi (Rs 1,450) apni cart mein add karna chahenge?`,
          product: item,
          suggestedQuestions: [
            "🛒 Add Mutton Karahi (Rs 1450)",
            "💖 Mutton Karahi favorite kar do",
            "Chicken Biryani ka rate kya hai?",
            "🛵 Delivery charges kitne hain?",
          ],
        };
      }

      // Chicken Biryani
      if (clean.includes("biryani") || clean.includes("chawal") || clean.includes("rice")) {
        const item = MENU_RECOMMENDATIONS.biryani;
        return {
          text: `Al Madina ki Dum Pukht Chicken Biryani (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Saath Taaza Dahi Raita aur Salad shamil hai.\n\nKya aap ise apni cart ya favorites mein add karna chahenge?`,
          product: item,
          suggestedQuestions: ["🛒 Add to Cart (Rs 680)", "💖 Favorite mein dalo", "Karahi ka rate kya hai?"],
        };
      }

      // Vegetable Samosa
      if (clean.includes("samosa") || clean.includes("samose")) {
        const item = MENU_RECOMMENDATIONS.samosa;
        return {
          text: `Al Madina Crisp Handmade Vegetable Samosa (Rs ${item.price} Plate - 2 Pcs):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Saath Taaza Pudina Chatni aur Meethi Imli Sauce shamil hai.\n\nKya aap ise cart ya favorites mein shamil karna chahenge?`,
          product: item,
          suggestedQuestions: ["💖 Samosa favorite kar do", "🛒 Samosa cart mein add karo", "Menu dekhein"],
        };
      }

      // Contact / Location / Timing
      if (clean.includes("location") || clean.includes("address") || clean.includes("kahan") || clean.includes("pata")) {
        return {
          text: "📍 Al Madina Restaurant ka Karachi Address:\n25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.\n\nWebsite ke Contact section mein interactive live map aur Google Maps directions button bhi mojood hai!",
          product: null,
          suggestedQuestions: ["⏰ Khulne ka waqt kya hai?", "🛵 Delivery charges kitne hain?", "Menu dekhein"],
        };
      }

      if (clean.includes("timing") || clean.includes("time") || clean.includes("waqt") || clean.includes("open") || clean.includes("hours")) {
        return {
          text: "⏰ Al Madina Restaurant Rozana dopahar 12:00 PM se raat 12:00 AM tak khula rehta hai (Dine-in, Takeaway aur Home Delivery tamam waqt dastiyab hain).",
          product: null,
          suggestedQuestions: ["Table book karein", "Delivery charge kitna hai?", "Menu rate list"],
        };
      }

      // Greetings
      const isGreeting = clean.includes("salam") || clean.includes("hello") || clean.includes("hi") || clean.includes("kaise") || clean.includes("kese") || clean === "bhai" || clean === "bro";
      if (isGreeting) {
        return {
          text: "Wa Alaikum Assalam Bhai Jaan! Al Madina Restaurant Karachi mein khush aamdeed! 🍽️\n\nAaj dawat mein kya tayyar karwayein? Hamare paas taaza Desi Mutton Karahi, Dum Pukht Chicken Biryani, Charcoal BBQ Seekh Kebabs aur Kashmiri Pink Chai dastyab hain. Cart mein add karna ho, favorite karna ho, table book karni ho ya order place karna ho — bas ek lafz farmayein!",
          product: null,
          suggestedQuestions: [
            "🍖 Mutton Karahi aur rates?",
            "🍛 Chicken Biryani cart mein add karo",
            "💖 Samosa favorite kar do",
            "🧾 Mera bill bana do",
          ],
        };
      }

      // General dynamic fallback (Varied, intelligent Roman Urdu replies)
      return {
        text: getRandomFallback(),
        product: MENU_RECOMMENDATIONS.biryani,
        suggestedQuestions: [
          "🍖 Mutton Karahi ki price aur details?",
          "🍛 Chicken Biryani cart mein dalo",
          "💖 Samosa favorite kar do",
          "Table book karein",
        ],
      };
    } catch (err) {
      console.error("processResponse error:", err);
      return {
        text: "Bhai, main samajh gaya hoon! Al Madina Restaurant mein aapka khana hamari pehli tarjeeh hai. Kiya aap menu dekhna chahte hain ya direct order book karna chahenge?",
        product: MENU_RECOMMENDATIONS.biryani,
        suggestedQuestions: [
          "🍖 Mutton Karahi ka rate?",
          "🍛 Chicken Biryani mangwa do",
          "🛒 Cart dikhayein",
          "Table book karein",
        ],
      };
    }
  };

  const handleSend = async (textToSend = null) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text) return;

    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);

    const userMsg = { id: "msg_" + Date.now(), from: "user", text };
    const updatedMessages = [...messages, userMsg];

    // Auto-save customer message to Supabase
    saveChatMessage({
      sessionId: currentChatId,
      userId,
      customerName,
      customerEmail,
      sender: "customer",
      message: text,
    });

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentChatId) {
          const title =
            s.title === "New Chat" || s.title === "Al Madina Guftagu" || s.title === "Shahi Dawat Guftagu"
              ? text.slice(0, 24) + "..."
              : s.title;
          return { ...s, title, messages: updatedMessages };
        }
        return s;
      })
    );

    setInput("");
    setIsTyping(true);
    setIsGenerating(true);

    // Snappy, responsive 400ms typing delay with full safety
    pendingTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await processResponse(text);
        if (response) {
          streamBotMessage(response, updatedMessages);
        } else {
          setIsTyping(false);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("handleSend process error:", err);
        setIsTyping(false);
        setIsGenerating(false);
        streamBotMessage(
          {
            text: "Ji bhai, aapki baat note kar li gayi hai! Al Madina Restaurant Karachi mein khana order karna ho ya inquiry ho, main hazir hoon.",
            suggestedQuestions: ["Menu dekhein", "Cart dikhao", "Order confirm karein"],
          },
          updatedMessages
        );
      }
    }, 400);
  };

  // Chat Sessions Management
  const handleNewChat = () => {
    const newId = "chat_" + Date.now();
    const newChat = {
      id: newId,
      title: "New Chat",
      archived: false,
      trash: false,
      createdAt: Date.now(),
      messages: [INITIAL_MESSAGE],
    };
    setSessions((prev) => [newChat, ...prev]);
    setCurrentChatId(newId);
    setSidebarOpen(false);
    setSidebarTab("active");
  };

  const handleRenameChat = (chatId) => {
    if (!titleInput.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === chatId ? { ...s, title: titleInput.trim() } : s))
    );
    setEditingTitleId(null);
    setTitleInput("");
  };

  // Archive / Unarchive toggle
  const handleArchiveChat = (chatId) => {
    setSessions((prev) => {
      const target = prev.find((s) => s.id === chatId);
      if (!target) return prev;
      const willBeArchived = !target.archived;
      const updated = prev.map((s) => (s.id === chatId ? { ...s, archived: willBeArchived } : s));

      if (willBeArchived) {
        const remainingActive = updated.filter((s) => !s.trash && !s.archived);
        if (currentChatId === chatId) {
          if (remainingActive.length > 0) {
            setCurrentChatId(remainingActive[0].id);
          } else {
            const freshId = "chat_" + Date.now();
            const freshChat = {
              id: freshId,
              title: "New Chat",
              archived: false,
              trash: false,
              createdAt: Date.now(),
              messages: [INITIAL_MESSAGE],
            };
            setCurrentChatId(freshId);
            return [freshChat, ...updated];
          }
        }
      } else {
        // Unarchived: bring to top of active chats!
        const restored = { ...target, archived: false, trash: false };
        const others = updated.filter((s) => s.id !== chatId);
        setCurrentChatId(chatId);
        setSidebarTab("active");
        return [restored, ...others];
      }
      return updated;
    });
  };

  // Move chat to Trash
  const handleMoveToTrash = (chatId) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === chatId ? { ...s, trash: true, trashedAt: Date.now() } : s
      );
      const remainingActive = updated.filter((s) => !s.trash && !s.archived);
      if (currentChatId === chatId && remainingActive.length > 0) {
        setCurrentChatId(remainingActive[0].id);
      }
      return updated;
    });
  };

  // Restore chat from Trash to the VERY TOP of active chats
  const handleRestoreChat = (chatId) => {
    setSessions((prev) => {
      const target = prev.find((s) => s.id === chatId);
      if (!target) return prev;
      const restored = { ...target, trash: false, archived: false, updatedAt: Date.now() };
      const others = prev.filter((s) => s.id !== chatId);
      return [restored, ...others];
    });
    setCurrentChatId(chatId);
    setSidebarTab("active");
  };

  // Permanently Delete chat forever
  const handlePermanentDelete = (chatId) => {
    deleteChatSession(chatId);

    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== chatId);
      if (remaining.length === 0) {
        const freshId = "chat_" + Date.now();
        setCurrentChatId(freshId);
        return [
          {
            id: freshId,
            title: "New Chat",
            archived: false,
            trash: false,
            createdAt: Date.now(),
            messages: [INITIAL_MESSAGE],
          },
        ];
      }
      if (currentChatId === chatId) {
        const nextActive = remaining.find((s) => !s.trash) || remaining[0];
        setCurrentChatId(nextActive.id);
      }
      return remaining;
    });
  };

  return (
    <>
      <style>{`
        .am-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #D4AF37 0%, #F5DEB3 50%, #B8860B 100%);
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(212,175,55,0.4), 0 0 20px rgba(212,175,55,0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(255, 255, 255, 0.25);
        }
        .am-chat-fab:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 16px 40px rgba(212,175,55,0.6);
        }
        .am-chat-window {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 410px;
          max-width: calc(100vw - 32px);
          height: 610px;
          max-height: calc(100vh - 48px);
          border-radius: 20px;
          background: #0B0A08;
          border: 1px solid rgba(212,175,55,0.35);
          box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: inherit;
        }
        .am-chat-header {
          padding: 12px 16px;
          background: linear-gradient(180deg, #18150E 0%, #100E09 100%);
          border-bottom: 1px solid rgba(212,175,55,0.25);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .am-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: radial-gradient(circle at top right, rgba(212,175,55,0.04), transparent 60%);
        }
        .am-bubble {
          max-width: 88%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.5;
          position: relative;
          white-space: pre-wrap;
        }
        .am-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #D4AF37, #E8C15A);
          color: #0A0A0A;
          font-weight: 500;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(212,175,55,0.25);
        }
        .am-bubble.bot {
          align-self: flex-start;
          background: #181611;
          border: 1px solid rgba(212,175,55,0.2);
          color: #F5E9C8;
          border-bottom-left-radius: 4px;
        }
        .am-chat-footer {
          padding: 10px 14px;
          background: #100F0C;
          border-top: 1px solid rgba(212,175,55,0.2);
        }
        .am-chat-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1B1812;
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 14px;
          padding: 4px 6px 4px 12px;
          transition: border-color 0.2s ease;
        }
        .am-chat-input-wrap:focus-within {
          border-color: #D4AF37;
          box-shadow: 0 0 10px rgba(212,175,55,0.25);
        }
        .am-chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #FFFFFF;
          font-size: 13px;
        }
        .am-chat-send {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }
        .am-chat-send:hover {
          transform: scale(1.06);
        }
        .am-chat-send:disabled {
          opacity: 0.4;
          transform: none;
        }
        .am-chat-send.stop-active {
          background: #DC2626 !important;
          color: #FFFFFF !important;
          box-shadow: 0 0 14px rgba(220, 38, 38, 0.7) !important;
        }
        .am-chat-send.stop-active:hover {
          background: #B91C1C !important;
          transform: scale(1.08) !important;
        }
        .am-typing-indicator-box {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 14px;
          background: rgba(20, 18, 14, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.15);
        }
        .am-typing-logo {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid #D4AF37;
          object-fit: cover;
          animation: am-logo-spin 2.5s linear infinite;
        }
        @keyframes am-logo-spin {
          0% { transform: rotate(0deg) scale(0.95); }
          50% { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(0.95); }
        }
        .am-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .am-typing-dots span {
          width: 6px;
          height: 6px;
          background: #D4AF37;
          border-radius: 9999px;
          animation: am-dot-pulse 1.2s infinite ease-in-out;
        }
        .am-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .am-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        .am-typing-dots span:nth-child(4) { animation-delay: 0.6s; }
        @keyframes am-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
          40% { transform: scale(1.25); opacity: 1; }
        }
      `}</style>

      {/* Floating Chat Button */}
      {!open && (
        <button
          type="button"
          onClick={handleOpenChatbot}
          className="am-chat-fab cursor-pointer"
          aria-label="Open Al Madina AI Assistant"
        >
          <MessageCircle size={26} />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A] animate-pulse" />
        </button>
      )}

      {/* Main Chat Window */}
      {open && (
        <div className="am-chat-window">
          {/* Header */}
          <div className="am-chat-header">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-md text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-colors"
                title="Chat History"
              >
                <MenuIcon size={18} />
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C180A] to-[#0A0A0A] border border-[#D4AF37]/50 flex items-center justify-center">
                <Bot size={16} className="text-[#F0DFA0]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-wide" style={{ fontFamily: "'Amiri', serif" }}>
                    Al Madina AI Smart Assistant
                  </h4>
                  <Crown size={12} className="text-[#D4AF37]" />
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  AI Live Hospitality Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNewChat}
                className="p-1.5 text-white/60 hover:text-[#D4AF37] hover:bg-white/5 rounded-md transition-colors"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Sidebar Drawer: Chat History (Overlay Drawer on Left, Top to Bottom) */}
          {sidebarOpen && (
            <>
              {/* Semi-transparent Backdrop Overlay */}
              <div
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 bg-black/65 backdrop-blur-xs z-30 cursor-pointer animate-fade-in"
              />

              {/* Absolute Drawer from Top to Bottom on Left */}
              <div
                className="absolute inset-y-0 left-0 w-[295px] max-w-[88%] bg-[#12100C]/98 border-r border-[#D4AF37]/35 z-40 shadow-2xl flex flex-col p-3 backdrop-blur-md animate-fade-in text-xs text-white/80"
                style={{ boxShadow: "10px 0 30px rgba(0,0,0,0.8)" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2 shrink-0">
                  <span className="font-bold text-[#F0DFA0] flex items-center gap-1.5 text-xs">
                    <Archive size={14} className="text-[#D4AF37]" /> Chat Sessions History
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleNewChat}
                      className="px-2 py-1 rounded bg-[#D4AF37]/20 text-[#F0DFA0] hover:bg-[#D4AF37]/30 flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                      title="New Chat"
                    >
                      <Plus size={11} /> New
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                      title="Close History"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* 3 Tabs: Active, Archived, Trash */}
                <div className="flex items-center bg-black/50 border border-white/10 rounded-lg p-0.5 mb-2.5 shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("active")}
                    className={`flex-1 py-1 rounded text-[10.5px] font-semibold text-center transition-all cursor-pointer ${
                      sidebarTab === "active"
                        ? "bg-[#D4AF37] text-black shadow-sm font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Active ({sessions.filter((s) => !s.trash && !s.archived).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("archived")}
                    className={`flex-1 py-1 rounded text-[10.5px] font-semibold text-center transition-all cursor-pointer ${
                      sidebarTab === "archived"
                        ? "bg-[#D4AF37] text-black shadow-sm font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Archived ({sessions.filter((s) => !s.trash && s.archived).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("trash")}
                    className={`flex-1 py-1 rounded text-[10.5px] font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      sidebarTab === "trash"
                        ? "bg-red-500 text-white shadow-sm font-bold"
                        : "text-white/60 hover:text-red-300"
                    }`}
                  >
                    <Trash2 size={10} /> Trash ({sessions.filter((s) => s.trash).length})
                  </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {/* TAB 1: ACTIVE CHATS */}
                  {sidebarTab === "active" && (
                    <>
                      {sessions.filter((s) => !s.trash && !s.archived).length === 0 ? (
                        <p className="text-center text-white/40 text-[11px] py-8">Koi active chat nahi hai.</p>
                      ) : (
                        sessions
                          .filter((s) => !s.trash && !s.archived)
                          .map((sess) => (
                            <div
                              key={sess.id}
                              className={`p-2.5 rounded-lg flex items-center justify-between gap-2 group transition-colors ${
                                sess.id === currentChatId
                                  ? "bg-[#D4AF37]/20 text-[#FFF2A3] border border-[#D4AF37]/40 shadow-sm"
                                  : "hover:bg-white/5 text-white/70"
                              }`}
                            >
                              {editingTitleId === sess.id ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="bg-black/60 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white flex-1"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRenameChat(sess.id)}
                                    className="text-emerald-400 p-0.5 hover:text-emerald-300 cursor-pointer"
                                  >
                                    <Check size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className="flex-1 truncate cursor-pointer"
                                  onClick={() => {
                                    setCurrentChatId(sess.id);
                                    setSidebarOpen(false);
                                  }}
                                >
                                  <p className="truncate font-semibold">{sess.title}</p>
                                  <p className="text-[10px] text-white/40">
                                    {sess.messages?.length || 1} messages · {new Date(sess.createdAt || Date.now()).toLocaleDateString()}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTitleId(sess.id);
                                    setTitleInput(sess.title);
                                  }}
                                  className="p-1 hover:text-[#D4AF37] cursor-pointer"
                                  title="Rename Chat"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleArchiveChat(sess.id)}
                                  className="p-1 hover:text-amber-400 cursor-pointer"
                                  title="Archive (Move to Archive tab)"
                                >
                                  <Archive size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveToTrash(sess.id)}
                                  className="p-1 hover:text-red-400 cursor-pointer"
                                  title="Delete (Move to Trash)"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </>
                  )}

                  {/* TAB 2: ARCHIVED CHATS */}
                  {sidebarTab === "archived" && (
                    <>
                      {sessions.filter((s) => !s.trash && s.archived).length === 0 ? (
                        <p className="text-center text-white/40 text-[11px] py-8">Koi archived chat nahi hai.</p>
                      ) : (
                        sessions
                          .filter((s) => !s.trash && s.archived)
                          .map((sess) => (
                            <div
                              key={sess.id}
                              className="p-2.5 rounded-lg flex items-center justify-between gap-2 bg-white/[0.03] border border-white/5 hover:border-[#D4AF37]/30 text-white/70 transition-colors"
                            >
                              <div
                                className="flex-1 truncate cursor-pointer"
                                onClick={() => {
                                  setCurrentChatId(sess.id);
                                  setSidebarOpen(false);
                                }}
                              >
                                <p className="truncate font-semibold">{sess.title}</p>
                                <p className="text-[10px] text-amber-400/80">Archived · Mehfooz</p>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleArchiveChat(sess.id)}
                                  className="px-2 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F0DFA0] rounded text-[10px] font-semibold cursor-pointer hover:bg-[#D4AF37]/30"
                                  title="Unarchive to Active"
                                >
                                  Unarchive
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveToTrash(sess.id)}
                                  className="p-1 text-white/40 hover:text-red-400 cursor-pointer"
                                  title="Move to Trash"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </>
                  )}

                  {/* TAB 3: TRASH (Cannot open chat, but Restore to top & Permanent Delete) */}
                  {sidebarTab === "trash" && (
                    <>
                      {sessions.filter((s) => s.trash).length === 0 ? (
                        <p className="text-center text-white/40 text-[11px] py-8">Trash khaalii hai.</p>
                      ) : (
                        sessions
                          .filter((s) => s.trash)
                          .map((sess) => (
                            <div
                              key={sess.id}
                              className="p-2.5 rounded-lg flex items-center justify-between gap-2 bg-red-950/20 border border-red-500/20 text-white/60"
                            >
                              <div className="flex-1 truncate">
                                <p className="truncate font-medium line-through text-white/50">{sess.title}</p>
                                <p className="text-[10px] text-red-400">In Trash (Chat band hai)</p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleRestoreChat(sess.id)}
                                  className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Restore Chat (Sabhi chats ke top par wapas aayegi)"
                                >
                                  <RotateCcw size={10} /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm("Kiya aap waqai is chat ko hamesha keliye permanently delete karna chahte hain?")) {
                                      handlePermanentDelete(sess.id);
                                    }
                                  }}
                                  className="p-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded text-[10px] cursor-pointer transition-colors"
                                  title="Permanently Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Scroll Direction Controls Helper Bar (Top & Down Only per user instructions) */}
          <div className="px-3 py-1 bg-black/60 border-b border-white/5 flex items-center justify-between text-[11px] text-white/60">
            <span className="text-[10px] flex items-center gap-1 text-white/50">
              <CornerDownRight size={10} className="text-[#D4AF37]" /> Chat Scroll:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollChat("top")}
                className="px-2 py-0.5 bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#F0DFA0] rounded text-[10px] transition-colors"
                title="Scroll to Top"
              >
                ▲ Top
              </button>
              <button
                type="button"
                onClick={() => scrollChat("down")}
                className="px-2 py-0.5 bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#F0DFA0] rounded text-[10px] transition-colors"
                title="Scroll to Bottom"
              >
                ▼ Down
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="am-chat-body" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`am-bubble ${m.from}`}>
                <div className="leading-relaxed">{renderFormattedMessage(m.text)}</div>

                {/* Bill Breakdown Card */}
                {m.bill && (
                  <div className="mt-3 p-3 bg-black/70 border border-[#D4AF37]/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-xs font-bold text-[#F0DFA0] flex items-center gap-1">
                        <Receipt size={14} className="text-[#D4AF37]" /> Al Madina Restaurant Bill
                      </span>
                      <span className="text-[10px] text-white/50">Karachi Delivery</span>
                    </div>
                    {m.bill.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-white/80">
                        <span>{it.name}</span>
                        <span className="font-semibold text-white">Rs {it.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-white/60 pt-1 border-t border-white/10">
                      <span>Delivery Fee</span>
                      <span>Rs {m.bill.delivery}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-[#D4AF37] pt-1 border-t border-[#D4AF37]/40">
                      <span>Total Payable</span>
                      <span>Rs {m.bill.grandTotal}</span>
                    </div>
                  </div>
                )}

                {/* Auto Order Placed Banner */}
                {m.orderPlaced && (
                  <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl space-y-1 text-emerald-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 size={15} /> Order #{m.orderPlaced.id} Dispatched to Kitchen!
                    </div>
                    <p className="text-[11px] text-emerald-300/80">
                      Cash on Delivery · Karachi Home Delivery confirmed.
                    </p>
                  </div>
                )}

                {/* Inline Order Form */}
                {m.orderForm && !m.orderForm.submitted && (
                  <InlineOrderForm
                    initialItems={m.orderForm.initialItems}
                    defaultTotal={m.orderForm.total}
                    defaultCustomerName={customerName}
                    onConfirm={(data) => handleInlineOrderConfirm(data, m.id)}
                  />
                )}

                {/* Inline Table Booking Form */}
                {m.tableForm && !m.tableForm.submitted && (
                  <InlineTableForm
                    defaultCustomerName={customerName}
                    onConfirm={(data) => handleInlineTableConfirm(data, m.id)}
                  />
                )}

                {/* Verified Owner Contact & Payment Banner */}
                {m.ownerContact && <OwnerContactBanner />}

                {/* Single Product Card with direct Add to Cart */}
                {m.product && (
                  <div className="mt-3 p-2.5 rounded-xl bg-black/50 border border-[#D4AF37]/35 flex items-center gap-3">
                    <img
                      src={m.product.image}
                      alt={m.product.name}
                      className="w-14 h-14 rounded-lg object-cover border border-[#D4AF37]/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{m.product.name}</h5>
                      <p className="text-[10px] text-white/60 line-clamp-1">{m.product.desc}</p>
                      <p className="text-xs font-bold text-[#D4AF37] mt-0.5">Rs {m.product.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddToFavorites(m.product)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isFavorite(m.product.id)
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-red-400 hover:border-red-500/30"
                        }`}
                        title={isFavorite(m.product.id) ? "Already in Favorites" : "Add to Favorites"}
                      >
                        <Heart size={14} className={isFavorite(m.product.id) ? "fill-red-500" : ""} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(m.product)}
                        className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-[11px] shrink-0 hover:brightness-110 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {addedItem === m.product.id ? (
                          <>
                            <Check size={12} /> Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Prompt Option */}
                {m.reviewPrompt && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#F0DFA0] flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> Share your experience:
                    </span>
                    <a
                      href="/#reviews"
                      onClick={() => setOpen(false)}
                      className="px-2.5 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F0DFA0] text-xs font-semibold hover:bg-[#D4AF37]/30"
                    >
                      Write Review
                    </a>
                  </div>
                )}

                {/* Direct WhatsApp Contact */}
                {m.whatsappSupport && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Phone size={12} /> Instant Manager Support:
                    </span>
                    <a
                      href={`https://wa.me/92${RESTAURANT_PHONE.replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent("Assalam o Alaikum Al Madina Restaurant!")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/50"
                    >
                      Open WhatsApp
                    </a>
                  </div>
                )}

                {/* Suggested Questions Chips */}
                {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                    {m.suggestedQuestions.map((sq, sidx) => (
                      <button
                        key={sidx}
                        type="button"
                        onClick={() => handleSend(sq)}
                        className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-[#D4AF37]/25 border border-white/10 hover:border-[#D4AF37]/50 text-white/80 hover:text-white transition-all text-left"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Pen-style Typewriter streaming in progress */}
            {typewriterText && (
              <div className="am-bubble bot">
                <div className="leading-relaxed inline">{renderFormattedMessage(typewriterText)}</div>
                <span className="inline-block w-1.5 h-3.5 bg-[#D4AF37] ml-0.5 animate-pulse" />
              </div>
            )}

            {/* Typing Indicator with Animated Royal Logo & 4 VIP Dots */}
            {isTyping && (
              <div className="am-typing-indicator-box animate-fade-in my-1">
                <div className="w-6 h-6 rounded-full bg-black/80 border border-[#D4AF37] flex items-center justify-center p-0.5 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.6)] animate-[am-logo-spin_3s_linear_infinite]">
                  <svg width="18" height="18" viewBox="0 0 38 38" fill="none">
                    <path
                      d="M6 32 V19 C6 11.8 11.8 6 19 6 C26.2 6 32 11.8 32 19 V32 H6 Z"
                      stroke="#D4AF37"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="19" cy="17" r="3.4" fill="#FFF2A3" />
                  </svg>
                </div>
                <div className="am-typing-dots">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <span className="text-[10px] text-amber-300/80 font-medium tracking-wide">
                  Al Madina AI Assistant...
                </span>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="am-chat-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="space-y-1.5"
            >
              <div className="am-chat-input-wrap">
                <input
                  type="text"
                  value={input}
                  maxLength={500}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Button / Mutton price, biryani, bill calculation..."
                  className="am-chat-input"
                />
                {isGenerating || isTyping || typewriterText ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="am-chat-send stop-active cursor-pointer"
                    title="Stop AI Generation (Rokein)"
                    aria-label="Stop generation"
                  >
                    <Square size={13} className="fill-current text-white" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="am-chat-send cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                )}
              </div>

              {/* Character Counter & Notice */}
              <div className="flex items-center justify-between text-[10px] text-white/40 px-1">
                <span>Al Madina AI Assistant</span>
                <span className={input.length > 450 ? "text-amber-400 font-mono" : "font-mono"}>
                  {input.length} / 500 chars
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
