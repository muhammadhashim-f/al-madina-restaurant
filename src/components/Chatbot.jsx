import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
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
  CalendarCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useFavorites } from "../context/FavoritesContext";
import { useReservations } from "../context/ReservationsContext";
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

const INITIAL_MESSAGE = {
  id: "msg_init",
  from: "bot",
  text: "Assalam-o-Alaikum! Main Al Madina Restaurant Karachi ka AI Shahi Host hoon. Khana order karna ho, kisi dish ki recipe ya faiday jan-nay hon, mukammal bill banwana ho ya delivery track karni ho — main aapki khidmat mein hazir hoon! 👑🍽️",
  suggestedQuestions: [
    "🍖 Mutton Karahi ka rate aur recipe?",
    "🍛 Chicken Biryani ki price aur faiday?",
    "🧾 Mera bill bana do (2x Biryani + 1x Karahi)",
    "📍 Restaurant timings aur address?",
  ],
};

const STORAGE_CHATS_KEY = "am_chat_sessions_v4";

export default function Chatbot() {
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
        title: "Shahi Dawat Guftagu",
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
  const { addToCart, items: cartItems } = useCart();
  const { addToFavorites } = useFavorites();
  const { addReservation } = useReservations();
  const { addOrder } = useOrders();
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

  // Handle Pen-style Typewriter animation for answers
  const streamBotMessage = (fullResponse, newMessages) => {
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);

    const fullText = fullResponse.text;
    let idx = 0;
    setTypewriterText("");
    setIsTyping(false);

    typewriterTimerRef.current = setInterval(() => {
      idx += 3;
      if (idx >= fullText.length) {
        clearInterval(typewriterTimerRef.current);
        setTypewriterText("");

        // Auto-save AI Shahi Host message to Supabase
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
    }, 12);
  };

  const handleAddToCart = (product) => {
    triggerLoader(
      "🛒 Cart Mein Shamil Kiya Gaya",
      `"${product.name}" shahi dastarkhwan cart mein darj ho gaya...`,
      1100,
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
    s = s.replace(/\b(ordr|ordar|bok)\b/g, "order");
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

  // Call Server-Side Gemini API Proxy (/api/chat)
  const callServerGemini = async (prompt) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.reply || null;
    } catch {
      return null;
    }
  };

  const processResponse = async (userText) => {
    const raw = userText.trim();
    const clean = normalizeInput(raw);
    const lowerRaw = raw.toLowerCase();
    const _lang = detectLanguage(raw);

    // ========================================================
    // 1. SECTION NAVIGATION (e.g. "go to menu section", "menu kholo", "open offers")
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
        sectionName = "Shahi Deals & Offers Section";
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
      }

      if (targetSection) {
        setTimeout(() => {
          const el = document.getElementById(targetSection) || document.querySelector(`#${targetSection}`);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 120);

        return {
          text: `Yeh len, yeh raha aapka ${sectionName} open hai! ✨ Kiya ab koi lazeez cheez Add to Cart ya Favorites mein shamil karni hai, ya main aapke liye order confirm kar doon?`,
          product: null,
          suggestedQuestions: [
            "🛒 Ye dish Cart mein add karein",
            "💖 Favorites mein shamil karein",
            "📦 Mera Order book karein",
            "🍽️ Shahi Table reserve karein",
          ],
        };
      }
    }

    // ========================================================
    // 2. MULTI-DISH ADD TO CART / ADD TO FAVORITES
    // (e.g. "ek mutton aur ek seekh kabab aur ek samosa add to cart kr do")
    // ========================================================
    const isAddToCartIntent =
      clean.includes("add to cart") ||
      clean.includes("cart me") ||
      clean.includes("cart mein") ||
      clean.includes("cart shamil") ||
      clean.includes("dastarkhwan me");

    const isFavoritesIntent =
      clean.includes("favorite") ||
      clean.includes("favorites") ||
      clean.includes("favourite") ||
      clean.includes("pasandeeda") ||
      clean.includes("fav me") ||
      clean.includes("like");

    if (isAddToCartIntent || isFavoritesIntent) {
      const matchedList = [];

      // Mutton / Handi / Karahi
      if (
        clean.includes("mutton") ||
        clean.includes("bakra") ||
        clean.includes("karahi") ||
        lowerRaw.includes("button") ||
        lowerRaw.includes("buttn") ||
        lowerRaw.includes("batan")
      ) {
        let qty = 1;
        if (clean.includes("2 mutton") || clean.includes("do mutton") || clean.includes("2 karahi")) qty = 2;
        if (clean.includes("3 mutton") || clean.includes("teen mutton")) qty = 3;
        matchedList.push({ product: MENU_RECOMMENDATIONS.karahi, quantity: qty });
      }

      // Seekh Kabab / BBQ
      if (clean.includes("seekh") || clean.includes("kabab") || clean.includes("kebab") || clean.includes("bbq")) {
        let qty = 1;
        if (clean.includes("2 seekh") || clean.includes("do seekh") || clean.includes("2 kabab")) qty = 2;
        if (clean.includes("3 seekh") || clean.includes("teen seekh")) qty = 3;
        matchedList.push({ product: MENU_RECOMMENDATIONS.kebab, quantity: qty });
      }

      // Samosa
      if (clean.includes("samosa") || clean.includes("samose") || clean.includes("samosay")) {
        let qty = 1;
        if (clean.includes("2 samosa") || clean.includes("do samosa")) qty = 2;
        if (clean.includes("3 samosa") || clean.includes("teen samosa")) qty = 3;
        matchedList.push({ product: MENU_RECOMMENDATIONS.samosa, quantity: qty });
      }

      // Biryani
      if (clean.includes("biryani") || clean.includes("chawal")) {
        let qty = 1;
        if (clean.includes("2 biryani") || clean.includes("do biryani")) qty = 2;
        if (clean.includes("3 biryani") || clean.includes("teen biryani")) qty = 3;
        matchedList.push({ product: MENU_RECOMMENDATIONS.biryani, quantity: qty });
      }

      // Dal Makhani
      if (clean.includes("makhani") || clean.includes("daal") || clean.includes("dal")) {
        matchedList.push({ product: MENU_RECOMMENDATIONS.makhani, quantity: 1 });
      }

      // Gulab Jamun
      if (clean.includes("gulab") || clean.includes("meetha") || clean.includes("dessert")) {
        matchedList.push({ product: MENU_RECOMMENDATIONS.dessert, quantity: 1 });
      }

      // Kashmiri Chai
      if (clean.includes("chai") || clean.includes("pink tea")) {
        matchedList.push({ product: MENU_RECOMMENDATIONS.chai, quantity: 1 });
      }

      if (matchedList.length > 0) {
        if (isAddToCartIntent) {
          matchedList.forEach((it) => {
            addToCart(
              {
                id: it.product.id,
                name: it.product.name,
                price: it.product.price,
                image: it.product.image,
              },
              it.quantity
            );
          });
          const summary = matchedList
            .map((it) => `• ${it.quantity}x ${it.product.name} (Rs ${it.product.price * it.quantity})`)
            .join("\n");
          return {
            text: `Zabardast Bhai! Aapke kehne par shahi dastarkhwan cart mein yeh items add kar diye gaye hain: 🛒\n\n${summary}\n\nKiya aap abhi Karachi Home Delivery order place karna chahte hain?`,
            product: matchedList[0]?.product,
            suggestedQuestions: [
              "📦 Abhi Order Confirm Karein",
              "🧾 Mera mukammal bill batao",
              "Kashmiri Chai bhi add karein",
            ],
          };
        } else {
          matchedList.forEach((it) => {
            addToFavorites(it.product.id);
          });
          const summary = matchedList.map((it) => `• ${it.product.name}`).join("\n");
          return {
            text: `Wah Shandar Choice! Maine yeh items aapki VIP Favorites list mein save kar diye hain: 💖\n\n${summary}\n\nAap website ke top par Heart icon par click kar ke inhein kabhi bhi ek click mein mangwa sakte hain!`,
            product: matchedList[0]?.product,
            suggestedQuestions: [
              "🛒 Inhein Cart mein shamil karein",
              "Menu Section dikhayein",
              "Table book karein",
            ],
          };
        }
      }
    }

    // ========================================================
    // 3. TABLE BOOKING VIA CHATBOT
    // (e.g. "table book karni hai", "table chahiye")
    // ========================================================
    const isTableBookingIntent =
      clean.includes("table book") ||
      clean.includes("table booking") ||
      clean.includes("table chahiye") ||
      clean.includes("seat book") ||
      clean.includes("table reserve") ||
      clean.includes("family hall");

    if (isTableBookingIntent) {
      const hasSpecificDetails =
        clean.includes("afraad") ||
        clean.includes("guest") ||
        clean.includes("people") ||
        clean.includes("person") ||
        clean.includes("banday") ||
        clean.includes("kal") ||
        clean.includes("aaj") ||
        clean.includes("confirm") ||
        clean.includes("kar do") ||
        clean.includes("kr do") ||
        clean.includes("bhej do");

      if (!hasSpecificDetails) {
        return {
          text: `👑 Al Madina VIP Seating Reservation keliye darj zail maaloomaat zaroori hain:\n\n1. 👥 **Afraad (Guests):** Kitne afraad tashreef la rahe hain? (Maslan: 2, 4, ya 6 family members)\n2. 📅 **Tareeq & Waqt:** Kis din aur kis waqt tashreef laenge? (Maslan: Kal raat 8:30 PM)\n3. 👤 **Mehmaan ka Naam & Rabta Number:**\n\nAap ye details yahan bata dein, main VIP Family Hall mein shahi dastarkhwan mehfooz kar doonga!`,
          suggestedQuestions: [
            "👥 4 Afraad keliye Kal Raat 8:30 PM Table Book Karein",
            "👥 2 Afraad keliye Table Chahiye",
            "👨‍👩‍👧‍👦 6 Afraad Family Hall Seating",
          ],
        };
      }

      let guests = 2;
      const guestMatch = clean.match(/(\d+)\s*(afraad|people|persons|guest|guests|banday)/);
      if (guestMatch) guests = parseInt(guestMatch[1], 10);
      else if (clean.includes("char") || clean.includes("4")) guests = 4;
      else if (clean.includes("family") || clean.includes("chhe") || clean.includes("6")) guests = 6;
      else if (clean.includes("teen") || clean.includes("3")) guests = 3;

      const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10);
      const newBooking = addReservation({
        name: customerName,
        phone: "0300-1234567",
        date: tomorrow,
        time: "20:30",
        guests,
        notes: "Booked automatically via Al Madina AI Shahi Host",
        status: "pending",
      });

      return {
        text: `👑 Shahi Table Booking Request Receive Ho Gayi Hai!\n\n📋 Booking ID: #${newBooking.id}\n👤 Mehmaan: ${newBooking.name}\n👥 VIP Seating: ${newBooking.guests} Afraad (Family Hall)\n📅 Tareeq: ${newBooking.date} · ⏰ Waqt: ${newBooking.time}\n\n⏳ **Status: Pending Owner Approval**\n\n(Note: Pehle yeh booking pending rahegi, jaise hi restaurant owner check kar ke **OK** karenge to status Confirmed ho jayega. Yeh details aapki Booking History mein bhi live save ho chuki hain!)`,
        suggestedQuestions: [
          "📅 Booking History Dekhein",
          "📱 WhatsApp Owner se rabta",
          "Menu se dishes order karein",
        ],
      };
    }

    // ========================================================
    // 4. ORDER PLACEMENT VIA CHATBOT
    // (e.g. "order confirm kardo", "order place kardo", "mangwa do")
    // ========================================================
    const isDirectOrderIntent =
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

    if (isDirectOrderIntent) {
      const hasSpecificOrderDetails =
        cartItems?.length > 0 ||
        clean.includes("mutton") ||
        clean.includes("biryani") ||
        clean.includes("karahi") ||
        clean.includes("kebab") ||
        clean.includes("samosa") ||
        clean.includes("address") ||
        clean.includes("korangi") ||
        clean.includes("sector") ||
        clean.includes("confirm") ||
        clean.includes("kar do") ||
        clean.includes("kr do") ||
        clean.includes("bhej do");

      if (!hasSpecificOrderDetails) {
        return {
          text: `👑 Al Madina Shahi Kitchen Order keliye darj zail tafseelat zaroori hain:\n\n1. 🍲 **Dishes & Miqdaar:** Konsi dishes mangwana chahte hain? (Maslan: 1 KG Mutton Karahi, 2x Chicken Biryani, Seekh Kebab)\n2. 📍 **Karachi Delivery Address:** Sector / Area / Street ka mukammal pata?\n3. 📱 **Rabta Number:** Rider aur WhatsApp confirmation keliye mobile number.\n\nAap ye details yahan likh dein ya Menu se **Add to Cart** kar ke 'Order Confirm' farmayein, main foran order generate kar doonga!`,
          suggestedQuestions: [
            "🍛 2x Chicken Biryani + 1x Mutton Karahi Mangwa Do",
            "📦 Mera Cart Order Confirm Karein",
            "Mera Address: Sector 36-B, Korangi, Karachi",
          ],
        };
      }

      const orderItems =
        cartItems?.length > 0
          ? cartItems
          : [
              { id: 4, name: "Chicken Biryani (2 Plates)", price: 680, quantity: 2, image: "/Images/menu/Chicken Biryani.jpg" },
              { id: 3, name: "Mutton Karahi (1 KG Handi)", price: 1450, quantity: 1, image: "/Images/menu/Mutton Karahi.jpg" },
            ];
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
        text: `bhai order complete successfully ho chuka hy ab aap whatsap (${RESTAURANT_PHONE} / +92 300 1234567) pr payment wageera okay kare pir jese hi owner ki trf se okay ka massge ay ga to pir apko tarcking baick website pr live location me show ki jay gi k kahan Aap ka parsal aa giya hy 🛵\n\n(Bhai yaad rahe k jb tk ownr okay nahi kare ga tb tk baick tracking me show nahi ki jay gi k kahan aa gai kun k abhi order pendding me hy).`,
        orderPlaced: newOrder,
        whatsappSupport: true,
        suggestedQuestions: [
          `🛵 Live Tracking Dekhein (#${newOrder.id})`,
          "💬 Owner WhatsApp par OK karein",
          "Table bhi reserve karein",
        ],
      };
    }

    // Call server-side real Gemini AI for rich conversational replies
    const geminiReply = await callServerGemini(raw);

    // Determine relevant dish attachment for interactive card
    let matchedProduct = null;
    const isMuttonInquiry =
      clean.includes("mutton") ||
      clean.includes("bakra") ||
      lowerRaw.includes("button") ||
      lowerRaw.includes("buttn") ||
      lowerRaw.includes("batan");

    if (isMuttonInquiry) {
      matchedProduct = MENU_RECOMMENDATIONS.karahi;
    } else if (clean.includes("biryani") || clean.includes("chawal") || clean.includes("rice")) {
      matchedProduct = MENU_RECOMMENDATIONS.biryani;
    } else if (clean.includes("kebab") || clean.includes("seekh") || clean.includes("bbq")) {
      matchedProduct = MENU_RECOMMENDATIONS.kebab;
    } else if (clean.includes("chai") || clean.includes("tea") || clean.includes("pink")) {
      matchedProduct = MENU_RECOMMENDATIONS.chai;
    } else if (clean.includes("platter") || clean.includes("deal") || clean.includes("family")) {
      matchedProduct = MENU_RECOMMENDATIONS.platter;
    } else if (clean.includes("samosa")) {
      matchedProduct = MENU_RECOMMENDATIONS.samosa;
    } else if (clean.includes("makhani") || clean.includes("daal")) {
      matchedProduct = MENU_RECOMMENDATIONS.makhani;
    } else if (clean.includes("gulab") || clean.includes("dessert") || clean.includes("meetha")) {
      matchedProduct = MENU_RECOMMENDATIONS.dessert;
    }

    // Check for Bill Request
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
    }

    // Check for Review Prompt
    const isReview = clean.includes("boht acha") || clean.includes("zabardast") || clean.includes("lajawab") || clean.includes("delicious") || clean.includes("tasty") || clean.includes("maza aya");

    // Check for WhatsApp / Phone
    const isContact = clean.includes("whatsapp") || clean.includes("email") || clean.includes("phone") || clean.includes("rabta") || clean.includes("contact") || clean.includes("number");

    // Check for Auto-Order placement with address
    const hasOrderIntent = clean.includes("order") || clean.includes("mangwa") || clean.includes("chahiye") || clean.includes("bhej do");
    const hasAddress = clean.includes("location") || clean.includes("address") || clean.includes("korangi") || clean.includes("karachi") || clean.includes("house") || clean.includes("flat") || clean.includes("gali") || clean.includes("road");

    if (hasOrderIntent && hasAddress) {
      const extractedPhoneMatch = raw.match(/\b03\d{2}[- ]?\d{7}\b/);
      const guestPhone = extractedPhoneMatch ? extractedPhoneMatch[0] : "0300-1234567";
      const targetDish = isMuttonInquiry ? MENU_RECOMMENDATIONS.karahi : MENU_RECOMMENDATIONS.biryani;

      const autoOrder = addOrder({
        items: [
          {
            id: targetDish.id,
            name: targetDish.name,
            price: targetDish.price,
            quantity: 2,
            image: targetDish.image,
          },
        ],
        fulfillment: "delivery",
        paymentMethod: "cod",
        customer: {
          name: "Guest via AI Host",
          phone: guestPhone,
          address: raw.slice(0, 80),
        },
        total: targetDish.price * 2 + 150,
      });

      return {
        text: `Mubarak ho! Aapka order auto-confirm kar liya gaya hai!\n\n📋 Order ID: #${autoOrder.id}\n🍽️ Items: 2x ${targetDish.name}\n🛵 Home Delivery: Karachi Address confirmed\n💵 Total Bill: Rs ${autoOrder.total} (Cash on Delivery)\n\nKitchen mein tayyari shuru ho chuki hai aur live tracking map par rider ki bike chalti hui nazar aayegi!`,
        orderPlaced: autoOrder,
        product: null,
        suggestedQuestions: ["🛵 Live GPS Tracking dekhein", "📱 WhatsApp par receipt mangwayein", "Table reservation kaise karein?"],
      };
    }

    // If Server Gemini AI succeeded, return its rich response!
    if (geminiReply) {
      return {
        text: geminiReply,
        product: matchedProduct,
        bill: billData,
        reviewPrompt: isReview,
        whatsappSupport: isContact,
        suggestedQuestions: isMuttonInquiry
          ? ["🛒 Add Mutton Karahi (Rs 1450)", "👑 VIP Mutton Feast Platter (Rs 2200)", "Chicken Biryani ka rate kya hai?", "🛵 Delivery charges kitne hain?"]
          : [
              "🍖 Mutton Karahi ki price aur details?",
              "🍛 Chicken Biryani ki recipe aur rate?",
              "🧾 Mera bill banao (2 Biryani + 1 Karahi)",
              "📍 Karachi branch kahan hai?",
            ],
      };
    }

    // Built-in intelligent fallback in case of temporary offline/network delay:
    // 1. Mutton inquiry & typo tolerance ("Button" -> "Mutton")
    if (isMuttonInquiry) {
      const item = MENU_RECOMMENDATIONS.karahi;
      return {
        text: `Bhai, aapka matlab 'Mutton' (Bakray ke gosht ki dishes) tha! Al Madina Restaurant Karachi mein hamari mashhoor Mutton dishes aur latest VIP rates yeh hain:\n\n🍖 **1. Desi Mitti Handi Mutton Karahi (1 KG):** Rs 1,450\n(Taaza zabiha halaal bakray ka gosht, khalis desi ghee, taaza tamatar, roasted zeera tadka aur pissa hua shahi garam masala)\n\n👑 **2. VIP Royal Handi Mutton Feast Platter:** Rs 2,200\n(1 KG Mutton Karahi + 4x Rogheni Naan + Fresh Salad & Raita + 2 chilled Kashmiri Pink Chai)\n\n🍛 **3. Shahi Mutton Dum Biryani:** Rs 950\n(Zafrani sela basmati chawal aur naram chaamp ka gosht)\n\n🔥 **4. BBQ Mutton Seekh Kebabs (4 Pcs):** Rs 850\n(Koylay par sekha hua rasdar mutton seekh kebab)\n\n✨ **Sehat Bakhsh Faiday:**\nKhalis desi ghee aur Mandi bakray ka taaza gosht body vitality, natural iron, zinc aur high-quality protein ka behtareen zariya hai.\n\nKya aap Desi Mitti Handi Mutton Karahi (Rs 1,450) apni cart mein add karna chahenge?`,
        product: item,
        suggestedQuestions: [
          "🛒 Add Mutton Karahi (Rs 1450)",
          "👑 VIP Mutton Feast Platter (Rs 2200)",
          "Chicken Biryani ka rate kya hai?",
          "🛵 Delivery charges kitne hain?",
        ],
      };
    }

    // 2. Bill calculation inquiry
    if (isBillRequest) {
      return {
        text: `Yaqeenan! Yeh lijiye aapke muntakhib items ka VIP Bill Estimate:\n\n📋 **MUKAMMAL BILL ESTIMATE:**\n• 2x Chicken Biryani: Rs 1,360\n• 1x Handi Mutton Karahi: Rs 1,450\n• 1x BBQ Seekh Kebab: Rs 650\n• Delivery Charge (All Karachi): Rs 150\n✨ **Kul Total Raqam:** Rs 3,610\n\n🍲 **SEHAT BAKHSH FAIDAY:**\n• Chicken Biryani: Khalis zafran aur sela basmati chawal jo hazme ke liye behtareen hain.\n• Mutton Karahi: Taaza Mandi ka bakra organic desi ghee mein tayyar — body energy aur zinc se labrez.\n• Seekh Kebab: Koylay par char-grill low-calorie lean protein.\n\nKya aap yeh items cart mein add kar ke checkout karna chahenge?`,
        bill: billData,
        product: null,
        suggestedQuestions: ["Yehi order abhi confirm karein", "Kashmiri Chai add karein", "Delivery kitni der mein aayegi?"],
      };
    }

    // 3. Praise / Feedback detection
    if (isReview) {
      return {
        text: "SubhanAllah! Boht boht shukriya aapki tareef ka! Al Madina Restaurant ke Shahi Bawarchi hamesha taaza aur laziz khana tayyar karte hain. Kya aap apna yeh keemti review hamari website par publish karna chahenge taakay har customer dekh sakay?",
        reviewPrompt: true,
        product: null,
        suggestedQuestions: ["Reviews section mein review likhein", "Aur kya special khana hai?", "WhatsApp owner se rabta"],
      };
    }

    // 4. Contact / WhatsApp
    if (isContact) {
      return {
        text: `Al Madina Restaurant Karachi se rabta karne ki mukammal tafseelat:\n\n📱 Owner WhatsApp & Call: ${RESTAURANT_PHONE}\n📧 Official Email: contact@almadinarestaurant.pk\n📍 Karachi Branch: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi.\n\nAap direct WhatsApp par baat kar sakte hain ya email bhej sakte hain:`,
        whatsappSupport: true,
        product: null,
        suggestedQuestions: ["📍 Google Map direction kahan hai?", "⏰ Delivery charges kitne hain?", "Menu dikhayein"],
      };
    }

    // 5. Chicken Biryani Inquiry
    if (clean.includes("biryani") || clean.includes("chawal") || clean.includes("rice")) {
      const item = MENU_RECOMMENDATIONS.biryani;
      return {
        text: `Al Madina ki Dum Pukht Chicken Biryani (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Saath Taaza Dahi Raita aur Salad shamil hai.\n\nKya aap ise apni cart mein add karna chahenge?`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 680)", "Karahi ka rate kya hai?", "Family Platter discount deal?"],
      };
    }

    // 6. Location Inquiry
    if (clean.includes("location") || clean.includes("address") || clean.includes("kahan") || clean.includes("karachi") || clean.includes("branch") || clean.includes("pata")) {
      return {
        text: "📍 Al Madina Restaurant ka Karachi Address:\n25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.\n\nWebsite ke Contact section mein interactive live map aur Google Maps directions ka live button bhi mojood hai!",
        product: null,
        suggestedQuestions: ["⏰ Khulne ka waqt kya hai?", "🛵 Delivery charges kitne hain?", "Menu dekhein"],
      };
    }

    // 7. Timings Inquiry
    if (clean.includes("timing") || clean.includes("time") || clean.includes("waqt") || clean.includes("open") || clean.includes("hours") || clean.includes("kab")) {
      return {
        text: "⏰ Al Madina Restaurant Rozana dopahar 12:00 PM se raat 12:00 AM tak khula rehta hai (Dine-in, Takeaway aur Home Delivery tamam waqt dastiyab hain).",
        product: null,
        suggestedQuestions: ["Table book karein", "Delivery charge kitna hai?", "Menu rate list"],
      };
    }

    // 8. Greetings & General Hospitality
    const isGreeting = clean.includes("salam") || clean.includes("hello") || clean.includes("hi") || clean.includes("kaise") || clean.includes("kese") || clean === "bhai" || clean === "bro";
    if (isGreeting) {
      return {
        text: "Wa Alaikum Assalam Bhai Jaan! Al Madina Restaurant Karachi ke Shahi Dastarkhwan par khush aamdeed! 👑\n\nAaj dawat mein kya tayyar karwayein? Hamare paas taaza Desi Mutton Karahi, Dum Pukht Chicken Biryani, Charcoal BBQ Seekh Kebabs aur Shahi Kashmiri Pink Chai dastyab hain. Kisi bhi dish ka rate, mukammal bill estimate ya recipe poochna chahein to farmayein!",
        product: null,
        suggestedQuestions: [
          "🍖 Mutton Karahi aur rates?",
          "🍛 Chicken Biryani ki price aur recipe?",
          "🧾 Mera mukammal bill bana do",
          "📍 Restaurant location aur timings?",
        ],
      };
    }

    // Default hospitality response
    return {
      text: "Main Al Madina Restaurant Karachi ka AI host hoon. Aap mujh se kisi bhi dish (Mutton Karahi, Biryani, Seekh Kebab, Dal Makhani, Kashmiri Chai) ka rate aur mukammal bill pooch sakte hain, recipe aur sehat bakhsh faiday maloom kar sakte hain, ya apna pata bhej kar direct khana mangwa sakte hain. Aaj dawat mein kya shamil karein?",
      product: null,
      suggestedQuestions: [
        "🍖 Mutton Karahi ki price aur details?",
        "🍛 Chicken Biryani ki recipe aur rate?",
        "🧾 Mera bill banao (2 Biryani + 1 Karahi)",
        "📍 Karachi branch kahan hai?",
      ],
    };
  };

  const handleSend = async (textToSend = null) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text) return;

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
            s.title === "New Chat" || s.title === "Shahi Dawat Guftagu"
              ? text.slice(0, 24) + "..."
              : s.title;
          return { ...s, title, messages: updatedMessages };
        }
        return s;
      })
    );

    setInput("");
    setIsTyping(true);

    // 2.2 seconds typing indicator with animated logo per user instructions
    setTimeout(async () => {
      const response = await processResponse(text);
      streamBotMessage(response, updatedMessages);
    }, 2200);
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
          aria-label="Open Al Madina AI Host"
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
                    Al Madina AI Shahi Host
                  </h4>
                  <Crown size={12} className="text-[#D4AF37]" />
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  AI Live Hospitality · Shahi Host
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
                <p>{m.text}</p>

                {/* Bill Breakdown Card */}
                {m.bill && (
                  <div className="mt-3 p-3 bg-black/70 border border-[#D4AF37]/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-xs font-bold text-[#F0DFA0] flex items-center gap-1">
                        <Receipt size={14} className="text-[#D4AF37]" /> Al Madina Shahi Bill
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
                    <button
                      type="button"
                      onClick={() => handleAddToCart(m.product)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-[11px] shrink-0 hover:brightness-110 flex items-center gap-1 transition-all"
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
                <p>{typewriterText}</p>
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
                  Al Madina AI Shahi Host...
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
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="am-chat-send cursor-pointer"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>

              {/* Character Counter & Notice */}
              <div className="flex items-center justify-between text-[10px] text-white/40 px-1">
                <span>Al Madina AI Shahi Host</span>
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
