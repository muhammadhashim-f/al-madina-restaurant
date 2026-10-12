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
  Minus,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useFavorites } from "../context/FavoritesContext";
import { useReservations } from "../context/ReservationsContext";
import { useVIPLoader } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewsContext";
import { saveChatMessage, deleteChatSession } from "../lib/chatService";
import { RESTAURANT_PHONE } from "../utils/whatsapp";
import { MENU_ITEMS, RESTAURANT_METADATA } from "../data/menuData";
import {
  normalizeInput,
  findDishByQuery,
  parseMultiItemOrder,
  calculateBill,
} from "../utils/chatbotEngine";

// ============================================================
// AL MADINA RESTAURANT — Royal AI Shahi Host & Action-Capable Assistant
// Features:
// 1. Exact authoritative menu & price retrieval.
// 2. Real multi-item cart synchronization with interactive quantity (+/-) controls.
// 3. Mathematical precision for bill breakdown & line items.
// 4. Working order confirmation using real addOrder function.
// 5. Working Favorites management (add, remove, clear, order favorites).
// 6. Working Table Reservations (booking, update time/guests, cancel).
// 7. Working Reviews integration (5-star ratings, moderation note).
// 8. Order status tracking & history.
// 9. Multi-turn conversation memory with Roman Urdu, Urdu & English support.
// ============================================================

const INITIAL_MESSAGE = {
  id: "msg_init",
  from: "bot",
  text: "Assalam-o-Alaikum! Main Al Madina Restaurant Karachi ka AI Shahi Host hoon. Khana order karna ho, kisi dish ki price/recipe poocheni ho, table book karni ho ya mukammal bill calculate karwana ho — main aapki khidmat mein hazir hoon! 👑🍽️",
  suggestedQuestions: [
    "🍖 Mutton Karahi ka rate aur details?",
    "🍛 Chicken Biryani ki price aur recipe?",
    "🧾 Mera bill bana do (2 Biryani + 1 Karahi)",
    "🛒 2 Mutton Karahi aur 3 Kashmiri Chai cart mein add karo",
    "📅 Kal raat 8 baje 4 logon ki table book karo",
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

  // Real Website System Contexts
  const {
    items: cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();
  const {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  } = useFavorites();
  const {
    reservations,
    addReservation,
    updateReservationDetails,
    deleteReservation,
  } = useReservations();
  const { orders, addOrder } = useOrders();
  const { reviews, addReview, averageRating } = useReviews();
  const { triggerLoader } = useVIPLoader();
  const authContext = useAuth();
  const [sidebarTab, setSidebarTab] = useState("active"); // "active" | "archived" | "trash"

  // Contextual conversation memory (stores last mentioned items & proposal)
  const [conversationContext, setConversationContext] = useState({
    lastDishList: [],
    pendingProposal: null, // { type: 'order' | 'booking' | 'review', data }
  });

  const currentUser = authContext?.session?.user || null;
  const customerName =
    currentUser?.user_metadata?.full_name ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Guest Customer");
  const customerEmail = currentUser?.email || "guest@customer";
  const userId = currentUser?.id || null;

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Current session & messages
  const currentSession =
    sessions.find((s) => s.id === currentChatId) || sessions[0] || {
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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Open Chatbot with VIP Loader and Start New Chat
  const handleOpenChatbot = () => {
    setSessions((prev) => {
      const latest = prev[0];
      if (
        latest &&
        latest.messages?.length === 1 &&
        latest.messages[0]?.from === "bot"
      ) {
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

  // Pen-style Typewriter animation for answers
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

        // Auto-save AI message to Supabase
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
                    orderProposal: fullResponse.orderProposal || null,
                    orderPlaced: fullResponse.orderPlaced || null,
                    reviewPrompt: fullResponse.reviewPrompt || false,
                    whatsappSupport: fullResponse.whatsappSupport || false,
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

  const handleAddToCart = (product, qty = 1) => {
    triggerLoader(
      "🛒 Cart Mein Shamil Kiya Gaya",
      `"${product.name}" shahi dastarkhwan cart mein darj ho gaya...`,
      900,
      () => {
        addToCart(
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
          },
          qty
        );
        setAddedItem(product.id);
        setTimeout(() => setAddedItem(null), 2500);
      }
    );
  };

  // Call Server-Side Gemini API Proxy (/api/chat)
  const callServerGemini = async (prompt, history = []) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: history.slice(-8).map((entry) => ({
            role: entry.role === "model" || entry.from === "bot" ? "model" : "user",
            text: entry.text,
          })),
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.reply || null;
    } catch {
      return null;
    }
  };

  // ========================================================
  // CORE INTENT PROCESSOR (Authoritative Logic Engine)
  // ========================================================
  const processResponse = async (userText) => {
    const raw = userText.trim();
    const clean = normalizeInput(raw);
    const lowerRaw = raw.toLowerCase();

    // --------------------------------------------------------
    // A. SECTION NAVIGATION
    // --------------------------------------------------------
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

    if (
      isNavIntent &&
      !clean.includes("add to") &&
      !clean.includes("cart") &&
      !clean.includes("order")
    ) {
      let targetSection = null;
      let sectionName = "";

      if (
        clean.includes("menu") ||
        clean.includes("khana") ||
        clean.includes("dish")
      ) {
        targetSection = "menu";
        sectionName = "Menu Section";
      } else if (
        clean.includes("deal") ||
        clean.includes("offer") ||
        clean.includes("discount")
      ) {
        targetSection = "offers";
        sectionName = "Shahi Deals & Offers Section";
      } else if (
        clean.includes("review") ||
        clean.includes("feedback") ||
        clean.includes("tareef")
      ) {
        targetSection = "reviews";
        sectionName = "Customer Reviews Section";
      } else if (
        clean.includes("booking") ||
        clean.includes("table") ||
        clean.includes("reservation") ||
        clean.includes("seat")
      ) {
        targetSection = "reservations";
        sectionName = "Table Reservations Section";
      } else if (
        clean.includes("about") ||
        clean.includes("bawarchi") ||
        clean.includes("chef") ||
        clean.includes("history")
      ) {
        targetSection = "about";
        sectionName = "About Us (Hamari Tareekh)";
      } else if (
        clean.includes("gallery") ||
        clean.includes("photo") ||
        clean.includes("tasweer")
      ) {
        targetSection = "gallery";
        sectionName = "Food Gallery";
      } else if (
        clean.includes("contact") ||
        clean.includes("location") ||
        clean.includes("map") ||
        clean.includes("pata")
      ) {
        targetSection = "contact";
        sectionName = "Contact & Live Location Map";
      }

      if (targetSection) {
        setTimeout(() => {
          const el =
            document.getElementById(targetSection) ||
            document.querySelector(`#${targetSection}`);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 120);

        return {
          text: `Yeh len, yeh raha aapka ${sectionName} open hai! ✨ Kiya ab koi lazeez dish Cart ya Favorites mein shamil karni hai, ya main aapke liye order confirm kar doon?`,
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

    // --------------------------------------------------------
    // B. ORDER CONFIRMATION / PLACEMENT ("confirm", "place my order", "haan order kar do")
    // --------------------------------------------------------
    const isConfirmIntent =
      clean.includes("confirm") ||
      clean.includes("order confirm") ||
      clean.includes("place my order") ||
      clean.includes("order place kar do") ||
      clean.includes("haan order kar do") ||
      clean.includes("haan order kardo") ||
      clean.includes("order bhej do") ||
      clean.includes("order book kar do");

    if (isConfirmIntent) {
      const activeItems = cartItems;

      if (!activeItems || activeItems.length === 0) {
        return {
          text: "Bhai jaan, aapki cart is waqt khali hai! Pehle menu se koi dish muntakhib farmayein (maslan: 2 Chicken Biryani ya 1 Mutton Karahi), phir hum foran order place kar denge! 🛒",
          suggestedQuestions: [
            "Menu Section dikhao",
            "2 Chicken Biryani cart mein add karo",
            "1 Mutton Karahi add karo",
          ],
        };
      }

      const phoneMatch = raw.match(/(?:\+?92|0)\d[\d\s-]{8,}/);
      const addressMatch = raw.match(/(?:address|pata|delivery address)\s*[:\-]?\s*(.+)/i);
      if (!phoneMatch || !addressMatch || addressMatch[1].trim().length < 8) {
        return {
          text: "Bhai, order ko sahi aur safe tareeqe se place karne ke liye abhi aapka asli phone number aur delivery address chahiye. Main koi dummy details use nahi karunga. Is format mein bhej dein: Confirm order, phone: 03XXXXXXXXX, address: House/Street/Area, Karachi.",
          suggestedQuestions: [
            "Mera bill batao",
            "Cart dikhao",
            "Order confirm karne ke liye details kya chahiye?",
          ],
        };
      }

      const calculated = calculateBill(activeItems);
      const newOrder = addOrder({
        items: calculated.items,
        fulfillment: "delivery",
        paymentMethod: "cod",
        status: "awaiting_approval",
        customer: {
          name: customerName,
          phone: phoneMatch[0].replace(/[\s-]/g, ""),
          address: addressMatch[1].trim(),
        },
        total: calculated.grandTotal,
      });

      // Clear pending proposal
      setConversationContext((prev) => ({ ...prev, pendingProposal: null }));

      return {
        text: `Bhai order complete successfully ho chuka hy (Order #${newOrder.id})! 🎉\n\nAb aap hamare official WhatsApp (${RESTAURANT_PHONE} / +92 300 1234567) pr payment wageera okay kare, pir jese hi owner ki trf se okay ka massage ay ga to pir apko tracking bike website pr live location me show ki jay gi k kahan Aap ka parsal aa giya hy 🛵\n\n(Bhai yaad rahe k jb tk owner okay nahi kare ga tb tk bike tracking me show nahi ki jay gi k kahan aa gai kun k abhi order pending me hy).`,
        orderPlaced: newOrder,
        whatsappSupport: true,
        suggestedQuestions: [
          `🛵 Live Tracking Dekhein (#${newOrder.id})`,
          "💬 Owner WhatsApp par OK karein",
          "Table bhi reserve karein",
        ],
      };
    }

    // --------------------------------------------------------
    // C. MULTI-ITEM ORDERING & CART UPDATES
    // (e.g. "Add 2 burgers, 3 fries and 2 drinks", "ek mutton aur ek seekh kabab add karo")
    // --------------------------------------------------------
    const isAddIntent =
      clean.includes("add") ||
      clean.includes("shamil") ||
      clean.includes("cart me") ||
      clean.includes("cart mein") ||
      clean.includes("mangwa") ||
      clean.includes("chahiye") ||
      clean.includes("order kar do") ||
      clean.includes("dal do");

    const isRemoveIntent =
      clean.includes("remove") ||
      clean.includes("hata do") ||
      clean.includes("nikal do") ||
      clean.includes("cancel the") ||
      clean.includes("kam kar do");

    // Check remove first
    if (isRemoveIntent) {
      const parsedToRemove = parseMultiItemOrder(raw);
      if (parsedToRemove.length > 0) {
        parsedToRemove.forEach((p) => {
          const inCart = cartItems.find((item) => item.id === p.item.id);
          if (!inCart) return;
          if (p.quantity < inCart.quantity) {
            updateQuantity(p.item.id, inCart.quantity - p.quantity);
          } else {
            removeFromCart(p.item.id);
          }
        });
        const summary = parsedToRemove.map((p) => `• ${p.quantity}x ${p.item.name}`).join("\n");
        return {
          text: `Bhai, aapke hukum par cart se yeh items remove kar diye gaye hain: 🗑️\n\n${summary}\n\nKiya aap mojooda cart ka updated bill dekhna chahte hain?`,
          suggestedQuestions: [
            "🧾 Mera updated bill batao",
            "Mera order confirm karo",
            "Aur kya add karna hai?",
          ],
        };
      }
    }

    // Contextual: "Add another one" / "Make that two" / "Add the same thing again"
    if (
      clean.includes("add another") ||
      clean.includes("ek aur add") ||
      clean.includes("same thing again") ||
      clean.includes("wohi dobara")
    ) {
      if (conversationContext.lastDishList.length > 0) {
        const dish = conversationContext.lastDishList[0];
        addToCart(dish, 1);
        return {
          text: `Zabardast! Ek aur ${dish.name} (Rs ${dish.price}) cart mein add kar diya gaya hai! 🛒\n\nKiya aap abhi order confirm karna chahenge?`,
          product: dish,
          suggestedQuestions: [
            "📦 Haan Order Confirm Karein",
            "🧾 Mera bill batao",
            "Menu dikhao",
          ],
        };
      }
    }

    // Check multi-dish addition
    const parsedOrders = parseMultiItemOrder(raw);
    if (parsedOrders.length > 0 && (isAddIntent || parsedOrders.length > 1)) {
      parsedOrders.forEach((p) => {
        addToCart(
          {
            id: p.item.id,
            name: p.item.name,
            price: p.item.price,
            image: p.item.image,
          },
          p.quantity
        );
      });

      // Update conversation context memory
      setConversationContext((prev) => ({
        ...prev,
        lastDishList: parsedOrders.map((p) => p.item),
        pendingProposal: {
          items: parsedOrders.map((p) => ({
            id: p.item.id,
            name: p.item.name,
            price: p.item.price,
            quantity: p.quantity,
            image: p.item.image,
          })),
        },
      }));

      const summaryLines = parsedOrders.map(
        (p) => `• ${p.quantity}x ${p.item.name} (Rs ${p.item.price * p.quantity})`
      );
      const subtotal = parsedOrders.reduce(
        (sum, p) => sum + p.item.price * p.quantity,
        0
      );
      const totalPayable = subtotal + RESTAURANT_METADATA.deliveryFee;

      return {
        text: `Zabardast Bhai! Aapke kehne par shahi dastarkhwan cart mein yeh items add kar diye gaye hain: 🛒\n\n${summaryLines.join("\n")}\n\n🧾 Subtotal: Rs ${subtotal}\n🛵 Delivery Fee: Rs ${RESTAURANT_METADATA.deliveryFee}\n✨ Grand Total: Rs ${totalPayable}\n\nKiya aap abhi Karachi Home Delivery order place karna chahte hain?`,
        product: parsedOrders[0]?.item,
        suggestedQuestions: [
          "📦 Haan Abhi Order Confirm Karein",
          "🧾 Mera mukammal bill batao",
          "Kashmiri Chai bhi add karein",
        ],
      };
    }

    // --------------------------------------------------------
    // D. BILL CALCULATION ("Calculate my bill", "total hisab", "kitna bana")
    // --------------------------------------------------------
    const isBillRequest =
      clean.includes("bill") ||
      clean.includes("total") ||
      clean.includes("hisab") ||
      clean.includes("calculate") ||
      clean.includes("kitne paise") ||
      clean.includes("how much");

    if (isBillRequest) {
      const itemsToCalculate =
        cartItems.length > 0
          ? cartItems
          : parsedOrders.length > 0
          ? parsedOrders.map((p) => ({
              id: p.item.id,
              name: p.item.name,
              price: p.item.price,
              quantity: p.quantity,
            }))
          : [
              MENU_ITEMS.find((m) => m.id === 4), // Biryani
              MENU_ITEMS.find((m) => m.id === 3), // Mutton Karahi
            ].map((m) => ({ ...m, quantity: 1 }));

      const calc = calculateBill(itemsToCalculate);
      const billData = {
        items: calc.items.map((i) => ({
          name: `${i.quantity}x ${i.name}`,
          price: i.lineTotal,
        })),
        subtotal: calc.subtotal,
        delivery: calc.deliveryFee,
        grandTotal: calc.grandTotal,
      };

      const breakdown = calc.items
        .map((i) => `• ${i.quantity}x ${i.name}: Rs ${i.lineTotal}`)
        .join("\n");

      return {
        text: `Yaqeenan! Yeh lijiye aapke muntakhib items ka VIP Bill Breakdown:\n\n📋 **MUKAMMAL BILL HISAB:**\n${breakdown}\n\n💵 Subtotal: Rs ${calc.subtotal}\n🛵 Delivery Fee (All Karachi): Rs ${calc.deliveryFee}\n✨ **Kul Total Raqam: Rs ${calc.grandTotal}**\n\nKiya aap yeh order confirm karna chahenge?`,
        bill: billData,
        suggestedQuestions: [
          "📦 Haan Order Confirm Karein",
          "Kashmiri Chai bhi add karein",
          "Table reservation kaise karein?",
        ],
      };
    }

    // --------------------------------------------------------
    // E. FAVORITES MANAGEMENT
    // --------------------------------------------------------
    const isFavoritesManagement =
      clean.includes("favorite") ||
      clean.includes("favourites") ||
      clean.includes("pasandeeda");

    if (isFavoritesManagement) {
      // 1. Show favorites
      if (
        clean.includes("show") ||
        clean.includes("dikhao") ||
        clean.includes("list") ||
        clean.includes("meri")
      ) {
        if (favorites.length === 0) {
          return {
            text: "Aapki Favorites list is waqt khali hai! Aap kisi bhi dish par Heart icon click kar ke ya mujhe keh kar apni pasandeeda dishes save kar sakte hain.",
            suggestedQuestions: [
              "Chicken Biryani favorite karo",
              "Mutton Karahi favorite karo",
              "Menu dikhao",
            ],
          };
        }
        const favList = favorites.map((f) => `• ${f.name} (Rs ${f.price})`).join("\n");
        return {
          text: `👑 **Aapki Shahi Favorites List:**\n\n${favList}\n\nKiya aap in tamam favorite dishes ko cart mein add karna chahte hain?`,
          suggestedQuestions: [
            "🛒 Tamam favorites cart mein add karo",
            "Mutton Karahi cart mein add karo",
            "Menu dekhein",
          ],
        };
      }

      // 2. Order all favorites
      if (clean.includes("cart mein") || clean.includes("order all") || clean.includes("shamil")) {
        favorites.forEach((f) => {
          addToCart(f, 1);
        });
        return {
          text: `Zabardast! Aapki tamam ${favorites.length} favorite dishes cart mein shamil kar di gayi hain! 🛒\n\nAb aap inka bill dekh kar order confirm kar sakte hain.`,
          suggestedQuestions: [
            "🧾 Mera bill batao",
            "📦 Order confirm karo",
          ],
        };
      }

      // Remove one specific dish from Favorites before handling bulk clearing.
      const isRemovingOneFavorite =
        clean.includes("remove") ||
        clean.includes("remove from") ||
        clean.includes("hata do") ||
        clean.includes("nikal do") ||
        clean.includes("unfavorite") ||
        clean.includes("favorite se");
      if (isRemovingOneFavorite) {
        const dishToRemove = findDishByQuery(raw);
        if (!dishToRemove) {
          return {
            text: "Bhai, kaunsi dish Favorites se remove karni hai? Dish ka naam bata dein.",
            suggestedQuestions: [
              "Chicken Biryani favorites se remove karo",
              "Mutton Karahi favorites se remove karo",
              "Meri favorites list dikhao",
            ],
          };
        }
        if (!favorites.some((item) => item.id === dishToRemove.id)) {
          return {
            text: `"${dishToRemove.name}" aapki Favorites list mein nahi hai, is liye kuch remove nahi kiya.`,
            suggestedQuestions: ["Meri favorites list dikhao", "Menu dekho"],
          };
        }
        removeFavorite(dishToRemove.id);
        return {
          text: `"${dishToRemove.name}" ko Favorites se remove kar diya hai.`,
          product: dishToRemove,
          suggestedQuestions: ["Meri favorites list dikhao", "Menu dekho"],
        };
      }

      // 3. Clear favorites
      if (clean.includes("remove all") || clean.includes("clear") || clean.includes("khatam")) {
        clearFavorites();
        return {
          text: "Aapki tamam favorite dishes Favorites list se remove kar di gayi hain.",
          suggestedQuestions: ["Menu dekhein", "New dishes favorite karein"],
        };
      }

      // 4. Add specific dish to favorites
      const dishToFav = findDishByQuery(raw);
      if (!dishToFav) {
        return {
          text: "Bhai, kis dish ko Favorites mein save karna hai? Menu ka exact naam bata dein, jaise Chicken Biryani ya Mutton Karahi. Main andazay se koi doosri dish save nahi karunga.",
          suggestedQuestions: [
            "Chicken Biryani favorite karo",
            "Mutton Karahi favorite karo",
            "Meri favorites list dikhao",
          ],
        };
      }
      addFavorite(dishToFav);
      return {
        text: `Wah Shandar Choice! "${dishToFav.name}" (Rs ${dishToFav.price}) aapki VIP Favorites list mein save kar diya gaya hai! 💖`,
        product: dishToFav,
        suggestedQuestions: [
          "💖 Meri favorites list dikhao",
          "🛒 Isay cart mein add karo",
          "Menu dikhao",
        ],
      };
    }

    // --------------------------------------------------------
    // F. TABLE BOOKINGS & RESERVATION MANAGEMENT
    // --------------------------------------------------------
    const isTableIntent =
      clean.includes("table") ||
      clean.includes("booking") ||
      clean.includes("reserve") ||
      clean.includes("seat") ||
      clean.includes("family hall");

    if (isTableIntent) {
      // 1. Cancellation must identify the booking and confirm intent.
      if (clean.includes("cancel") || clean.includes("mansookh")) {
        const bookingIdMatch = raw.match(/(?:booking|reservation)?\s*#?\s*(RES-?\d+|\d{4,})/i);
        const hasExplicitCancelConfirmation =
          clean.includes("confirm cancel") ||
          clean.includes("cancel booking #") ||
          clean.includes("cancel reservation #") ||
          clean.includes("booking cancel kar do #");
        if (!bookingIdMatch || !hasExplicitCancelConfirmation) {
          return {
            text: "Bhai, ghalti se booking cancel na ho is liye main bina booking ID aur clear confirmation ke cancel nahi karunga. Apni booking ID ke sath likhein: Confirm cancel booking #RES-12345. Pehle apni booking history check kar sakte hain.",
            suggestedQuestions: ["Meri bookings dikhao", "Nayi table book karein", "Menu dekhein"],
          };
        }
        const requestedId = bookingIdMatch[1].replace(/^RES-?/i, "");
        const targetBooking = reservations.find((r) =>
          String(r.id).replace(/^RES-?/i, "") === requestedId
        );
        if (!targetBooking) {
          return {
            text: "Bhai, yeh booking ID current booking list mein nahi mili. Apni booking history check karke sahi ID bhej dein.",
            suggestedQuestions: ["Meri bookings dikhao", "Menu dekhein"],
          };
        }
        deleteReservation(targetBooking.id);
        return {
          text: `Booking #${targetBooking.id} (${targetBooking.guests} afraad, ${targetBooking.date}) cancel kar di gayi hai.`,
          suggestedQuestions: ["Nayi table book karein", "Menu dekhein"],
        };
      }

      // 2. Show booking details
      if (clean.includes("show") || clean.includes("dikhao") || clean.includes("status") || clean.includes("detail")) {
        if (reservations.length > 0) {
          const resList = reservations
            .map(
              (r) =>
                `• Booking #${r.id}: ${r.guests} Afraad, Tareeq: ${r.date}, Waqt: ${r.time} (${r.status.toUpperCase()})`
            )
            .join("\n");
          return {
            text: `📋 **Aapki Table Bookings:**\n\n${resList}\n\n(Note: Booking pehle Pending rehti hai, restaurant owner check kar ke OK karte hain to Confirmed hoti hai).`,
            suggestedQuestions: ["Booking waqt change karo", "Menu dekhein"],
          };
        }
      }

      // 3. Create a booking only when the customer clearly requests one
      // and supplies the actual details. Never invent date, time, guests, or phone.
      const explicitBookingRequest =
        /\b(book|reserve|reservation)\b/.test(clean) ||
        clean.includes("booking kar") ||
        clean.includes("table chahiye") ||
        clean.includes("table book") ||
        clean.includes("table reserve");
      const guestMatch = clean.match(/(\d+)\s*(afraad|people|persons|guest|guests|banday|log)/);
      const guests = guestMatch ? parseInt(guestMatch[1], 10) : null;
      const phoneMatch = raw.match(/(?:\+?92|0)\d[\d\s-]{8,}/);
      // A bare number such as "4 guests" must not be mistaken for a time.
      const timeMatch = clean.match(/\b(\d{1,2}:\d{2}\s*(?:pm|am)?|\d{1,2}\s*(?:pm|am|baje))\b/i);
      const dateMatch = clean.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
      const relativeDateMatch = clean.match(/\b(today|tomorrow|aaj|kal)\b/);
      const hasDate = Boolean(dateMatch || relativeDateMatch);
      const timeParts = timeMatch?.[1].match(/^(\d{1,2})(?::(\d{2}))?\s*(pm|am|baje)?$/i);
      const timeHour = timeParts ? Number(timeParts[1]) : NaN;
      const timeMinute = timeParts?.[2] ? Number(timeParts[2]) : 0;
      const timeSuffix = timeParts?.[3]?.toLowerCase();
      const validTime = Boolean(
        timeParts &&
        timeMinute >= 0 && timeMinute <= 59 &&
        (timeSuffix === "am" || timeSuffix === "pm"
          ? timeHour >= 1 && timeHour <= 12
          : timeHour >= 0 && timeHour <= 23)
      );
      const parsedDate = dateMatch ? new Date(dateMatch[1] + "T00:00:00") : null;
      const dateIsValid = !dateMatch || (
        parsedDate &&
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === dateMatch[1]
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateIsNotPast = !dateMatch || (parsedDate && parsedDate >= today);
      const validGuests = Number.isInteger(guests) && guests >= 1 && guests <= 30;

      if (!explicitBookingRequest || !validGuests || !hasDate || !validTime || !dateIsValid || !dateIsNotPast || !phoneMatch) {
        return {
          text: "Bhai, table ka zikr karne se main booking create nahi karunga. Agar aap waqai table book karna chahte hain to apni request is format mein bhejein: Book table, date: tomorrow (ya YYYY-MM-DD), time: 8:00 PM, guests: 4, phone: 03XXXXXXXXX. Booking details milne par hi request save hogi.",
          suggestedQuestions: [
            "Book table, date: tomorrow, time: 8:00 PM, guests: 4, phone: 03XXXXXXXXX",
            "Meri bookings dikhao",
            "Table reservation section kholo",
          ],
        };
      }

      let bookingDate = dateMatch?.[1] || "";
      if (!bookingDate) {
        const base = new Date();
        if (/\b(tomorrow|kal)\b/.test(clean)) base.setDate(base.getDate() + 1);
        bookingDate = base.toISOString().slice(0, 10);
      }
      const bookingTime = timeMatch[1].replace(/\s*baje\b/i, "").trim();
      const newBooking = addReservation({
        name: customerName,
        phone: phoneMatch[0].replace(/[\s-]/g, ""),
        date: bookingDate,
        time: bookingTime,
        guests,
        notes: "Booked via Al Madina AI Shahi Host",
        status: "pending",
      });

      return {
        text: `👑 **Shahi Table Booking Request Receive Ho Gayi Hai!**\n\n📋 Booking ID: #${newBooking.id}\n👤 Mehmaan: ${newBooking.name}\n👥 VIP Seating: ${newBooking.guests} Afraad (Family Hall)\n📅 Tareeq: ${newBooking.date} · ⏰ Waqt: ${newBooking.time}\n\n⏳ **Status: Pending Owner Approval**\n\n(Note: Pehle yeh booking pending rahegi, jaise hi restaurant owner check kar ke **OK** karenge to status Confirmed ho jayega. Yeh details aapki Booking History mein bhi live save ho chuki hain!)`,
        suggestedQuestions: [
          "📅 Booking History Dekhein",
          "📱 WhatsApp Owner se rabta",
          "Menu se dishes order karein",
        ],
      };
    }

    // --------------------------------------------------------
    // G. REVIEWS & RATINGS ("give 5 stars", "submit review", "ratings")
    // --------------------------------------------------------
    const isReviewIntent =
      clean.includes("review") ||
      clean.includes("star") ||
      clean.includes("rate") ||
      clean.includes("rating") ||
      clean.includes("tareef");

    if (isReviewIntent && (clean.includes("give") || clean.includes("submit") || clean.includes("likh") || /\b[1-5]\s*star/.test(clean) || clean.includes("review bhej"))) {
      const ratingMatch = clean.match(/\b([1-5])\s*star/);
      const rating = ratingMatch ? Number(ratingMatch[1]) : null;
      const commentMatch = raw.match(/(?:comment|review|feedback|raaye)\s*[:\-]\s*(.+)/i);
      const comment = commentMatch?.[1]?.trim();

      if (!rating || !comment || comment.length < 3) {
        return {
          text: "Bhai, main aapki taraf se review ya tareef khud se nahi likhunga. Apna rating aur asli feedback is format mein bhejein: Review, 5 star, comment: Khana bohat acha tha.",
          reviewPrompt: true,
          suggestedQuestions: [
            "Review, 5 star, comment: Khana bohat acha tha",
            "Reviews section kholo",
            "Menu dikhao",
          ],
        };
      }

      const newReview = addReview({
        name: customerName,
        rating,
        comment,
        status: "pending",
      });

      return {
        text: `Shukriya ${customerName}! Aapka ${rating}-Star review record kar liya gaya hai! ⭐⭐⭐⭐⭐\n\n(Aapko yeh review preview mein dikhayi dega, magar baqi public customers ko yeh Admin ki tasdeeq / OK ke baad nazar aayega taakay authenticity qaim rahay).`,
        reviewPrompt: true,
        suggestedQuestions: [
          "Reviews section dekhein",
          "Menu dekhein",
          "Order place karein",
        ],
      };
    }

    // --------------------------------------------------------
    // H. ORDER STATUS & TRACKING ("Where is my order", "order number")
    // --------------------------------------------------------
    const isOrderStatusIntent =
      clean.includes("where is my order") ||
      clean.includes("order status") ||
      clean.includes("kahan hai mera order") ||
      clean.includes("order track") ||
      clean.includes("order number");

    if (isOrderStatusIntent) {
      if (orders.length > 0) {
        const latestOrder = orders[0];
        return {
          text: `🛵 **Aapka Order Status:**\n\n📋 Order ID: #${latestOrder.id}\n💵 Total: Rs ${latestOrder.total}\n⏳ Status: ${
            latestOrder.status === "awaiting_approval"
              ? "⏳ Awaiting Owner Approval (WhatsApp payment confirmation ke baad bike live map par chalegi)"
              : latestOrder.status === "out_for_delivery"
              ? "🛵 Rider Raste Mein Hai (Live GPS Moving)"
              : latestOrder.status
          }\n\nAap website ke top par "Orders" par click kar ke live interactive tracking dekh sakte hain!`,
          suggestedQuestions: [
            `🛵 Live Tracking Dekhein (#${latestOrder.id})`,
            "📱 Owner WhatsApp rabta",
            "Mera bill batao",
          ],
        };
      }
      return {
        text: "Aapka koi active order is waqt process mein nahi hai. Agar aap kuch lazeez mangwana chahein to main foran cart mein add kar ke order confirm karwa deta hoon!",
        suggestedQuestions: [
          "Chicken Biryani order karo",
          "Mutton Karahi order karo",
          "Menu dekhein",
        ],
      };
    }

    // --------------------------------------------------------
    // I. EXACT DISH INQUIRY / PRICING / INGREDIENTS
    // --------------------------------------------------------
    const specificDish = findDishByQuery(raw);
    if (specificDish) {
      setConversationContext((prev) => ({
        ...prev,
        lastDishList: [specificDish],
      }));

      return {
        text: `👑 **${specificDish.name} (Al Madina Royal Special):**\n\n💵 **Official Rate:** Rs ${specificDish.price}\n📦 **Serving Size:** ${specificDish.serving || "1-2 persons"}\n⏱️ **Preparation Time:** ${specificDish.prepTime || "15-20 mins"}\n\n✨ **Shahi Khasiyat & Recipe:**\n${specificDish.description}\n\n🥗 **Sehat Bakhsh Faiday:**\n${specificDish.benefits || "Taaza halaal ingredients, zero artificial preservatives."}\n\nKiya aap ise apni cart mein add karna chahenge?`,
        product: specificDish,
        suggestedQuestions: [
          `🛒 Add to Cart (Rs ${specificDish.price})`,
          `💖 Save to Favorites`,
          "Mera mukammal bill batao",
          "Karachi delivery charges kitne hain?",
        ],
      };
    }

    // --------------------------------------------------------
    // J. SERVER GEMINI AI CALL (Real conversational assistant)
    // --------------------------------------------------------
    const geminiReply = await callServerGemini(
      raw,
      messages.slice(-8).map((entry) => ({
        role: entry.from === "bot" ? "model" : "user",
        text: entry.text,
      }))
    );
    if (geminiReply) {
      return {
        text: geminiReply,
        product: null,
        suggestedQuestions: [
          "🍖 Mutton Karahi ka rate?",
          "🍛 Chicken Biryani ki price?",
          "🧾 Mera bill bana do",
          "📍 Restaurant location aur timings?",
        ],
      };
    }

    // --------------------------------------------------------
    // K. DEFAULT INTELLIGENT HOSPITALITY FALLBACK
    // --------------------------------------------------------
    return {
      text: `Main Al Madina Restaurant Karachi ka AI Shahi Host hoon. 👑\n\nAap mujh se kisi bhi dish ka exact rate aur ingredients pooch sakte hain, multi-item order cart mein shamil karwa sakte hain, live bill calculate karwa sakte hain, ya VIP family hall table book kar sakte hain.\n\nAaj dastarkhwan par kya pesh kiya jaye?`,
      product: null,
      suggestedQuestions: [
        "🍖 Mutton Karahi aur rates?",
        "🍛 Chicken Biryani ki price aur recipe?",
        "🧾 Mera bill banao (2 Biryani + 1 Karahi)",
        "📍 Restaurant location aur timings?",
      ],
    };
  };

  // ========================================================
  // SEND MESSAGE HANDLER
  // ========================================================
  const handleSend = async (textToSend = null) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text) return;

    const userMsg = { id: "msg_" + Date.now(), from: "user", text };
    const updatedMessages = [...messages, userMsg];

    // Save customer message to Supabase
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

    // 2.2 seconds animated restaurant logo typing indicator
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
      prev.map((s) =>
        s.id === chatId ? { ...s, title: titleInput.trim() } : s
      )
    );
    setEditingTitleId(null);
    setTitleInput("");
  };

  // Archive / Unarchive toggle
  const handleArchiveChat = (chatId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === chatId ? { ...s, archived: !s.archived } : s
      )
    );
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
      const restored = {
        ...target,
        trash: false,
        archived: false,
        updatedAt: Date.now(),
      };
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
        setCurrentChatId(remaining[0].id);
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
                className="p-1 rounded-md text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-colors cursor-pointer"
                title="Chat History"
              >
                <MenuIcon size={18} />
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C180A] to-[#0A0A0A] border border-[#D4AF37]/50 flex items-center justify-center">
                <Bot size={16} className="text-[#F0DFA0]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4
                    className="text-xs font-bold text-white tracking-wide"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
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
                className="p-1.5 text-white/60 hover:text-[#D4AF37] hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
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
                        <p className="text-center text-white/40 text-[11px] py-8">
                          Koi active chat nahi hai.
                        </p>
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
                                    {sess.messages?.length || 1} messages ·{" "}
                                    {new Date(
                                      sess.createdAt || Date.now()
                                    ).toLocaleDateString()}
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
                        <p className="text-center text-white/40 text-[11px] py-8">
                          Koi archived chat nahi hai.
                        </p>
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
                                <p className="text-[10px] text-amber-400/80">
                                  Archived · Mehfooz
                                </p>
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

                  {/* TAB 3: TRASH */}
                  {sidebarTab === "trash" && (
                    <>
                      {sessions.filter((s) => s.trash).length === 0 ? (
                        <p className="text-center text-white/40 text-[11px] py-8">
                          Trash khaalii hai.
                        </p>
                      ) : (
                        sessions
                          .filter((s) => s.trash)
                          .map((sess) => (
                            <div
                              key={sess.id}
                              className="p-2.5 rounded-lg flex items-center justify-between gap-2 bg-red-950/20 border border-red-500/20 text-white/60"
                            >
                              <div className="flex-1 truncate">
                                <p className="truncate font-medium line-through text-white/50">
                                  {sess.title}
                                </p>
                                <p className="text-[10px] text-red-400">
                                  In Trash (Chat band hai)
                                </p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleRestoreChat(sess.id)}
                                  className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Restore Chat"
                                >
                                  <RotateCcw size={10} /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Kiya aap waqai is chat ko hamesha keliye permanently delete karna chahte hain?"
                                      )
                                    ) {
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

          {/* Scroll Direction Controls Helper Bar */}
          <div className="px-3 py-1 bg-black/60 border-b border-white/5 flex items-center justify-between text-[11px] text-white/60">
            <span className="text-[10px] flex items-center gap-1 text-white/50">
              <CornerDownRight size={10} className="text-[#D4AF37]" /> Chat Scroll:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollChat("top")}
                className="px-2 py-0.5 bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#F0DFA0] rounded text-[10px] transition-colors cursor-pointer"
                title="Scroll to Top"
              >
                ▲ Top
              </button>
              <button
                type="button"
                onClick={() => scrollChat("down")}
                className="px-2 py-0.5 bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#F0DFA0] rounded text-[10px] transition-colors cursor-pointer"
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

                {/* Interactive Multi-Item Cart / Order Card */}
                {cartItems && cartItems.length > 0 && m.from === "bot" && (m.bill || m.text.includes("shahi dastarkhwan cart")) && (
                  <div className="mt-3 p-3 bg-black/80 border border-[#D4AF37]/50 rounded-xl space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-xs font-bold text-[#F0DFA0] flex items-center gap-1.5">
                        <ShoppingCart size={14} className="text-[#D4AF37]" /> Live Dastarkhwan Cart ({cartItems.length} items)
                      </span>
                      <span className="text-[10px] bg-[#D4AF37]/20 text-[#F0DFA0] px-2 py-0.5 rounded-full font-semibold border border-[#D4AF37]/30">
                        Synchronized
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs text-white/90 bg-white/[0.03] p-1.5 rounded-lg border border-white/5"
                        >
                          <div className="flex items-center gap-2 truncate flex-1">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-7 h-7 rounded object-cover shrink-0 border border-white/10"
                              />
                            )}
                            <div className="truncate">
                              <p className="font-semibold truncate">{item.name}</p>
                              <p className="text-[10px] text-white/50">
                                Rs {item.price} each · Line: Rs {item.price * item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Plus, Minus, Remove Controls connected to real Cart */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer font-bold text-xs transition-colors"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-bold text-[#D4AF37] text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer font-bold text-xs transition-colors"
                              title="Increase quantity"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-white/40 hover:text-red-400 cursor-pointer transition-colors"
                              title="Remove item"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Exact Totals Calculation */}
                    <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Subtotal</span>
                        <span>Rs {cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Delivery Fee (Karachi)</span>
                        <span>Rs {cartTotal > 0 ? RESTAURANT_METADATA.deliveryFee : 0}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-[#D4AF37] pt-1 border-t border-[#D4AF37]/30">
                        <span>Total Payable</span>
                        <span>Rs {cartTotal > 0 ? cartTotal + RESTAURANT_METADATA.deliveryFee : 0}</span>
                      </div>
                    </div>

                    {/* Real Order Confirmation Button */}
                    <button
                      type="button"
                      onClick={() => handleSend("Order confirm kar do")}
                      className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <CheckCircle2 size={14} /> Confirm Order (Karachi Delivery)
                    </button>
                  </div>
                )}

                {/* Bill Breakdown Card */}
                {m.bill && !cartItems?.length && (
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
                  <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl space-y-1 text-emerald-200 animate-fade-in">
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
                      <p className="text-[10px] text-white/60 line-clamp-1">{m.product.description || m.product.desc}</p>
                      <p className="text-xs font-bold text-[#D4AF37] mt-0.5">Rs {m.product.price}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(m.product, 1)}
                        className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-bold text-[11px] hover:brightness-110 flex items-center justify-center gap-1 transition-all cursor-pointer"
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
                      <button
                        type="button"
                        onClick={() => {
                          addFavorite(m.product);
                        }}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isFavorite(m.product.id)
                            ? "bg-red-500/20 border-red-500/40 text-red-300"
                            : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        <Heart size={10} fill={isFavorite(m.product.id) ? "currentColor" : "none"} /> Fav
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
                        className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-[#D4AF37]/25 border border-white/10 hover:border-[#D4AF37]/50 text-white/80 hover:text-white transition-all text-left cursor-pointer"
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

            {/* Typing Indicator with Animated Restaurant Logo & Dots */}
            {isTyping && (
              <div className="am-typing-indicator-box animate-fade-in my-1">
                <img
                  src="/Images/logo/almadina.png"
                  alt="Al Madina"
                  className="am-typing-logo"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="am-typing-dots">
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
                <span
                  className={
                    input.length > 450 ? "text-amber-400 font-mono" : "font-mono"
                  }
                >
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
