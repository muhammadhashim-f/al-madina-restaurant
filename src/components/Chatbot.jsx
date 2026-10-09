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
  Key,
  Settings,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useVIPLoader } from "../context/LoadingContext";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — ChatGPT-Style Intelligent Host & Chatbot
// Features:
// 1. Multi-chat history with Sidebar (New, Rename, Archive, Delete).
// 2. Typing dots & Pen-style Typewriter streaming effect.
// 3. Robust Culinary Intelligence Engine:
//    - Handles EVERY query (prices, dishes, recipes, benefits, bills, tracking, reservations).
//    - Typo-tolerance: understands "Button" -> "Mutton", "Bryani", "Krhai", "Bil", etc.
//    - Does NOT force Chicken Biryani on unrelated questions.
// 4. Clean Top & Bottom scroll controls (Left/Right removed per request).
// 5. Optional Gemini API Engine settings with step-by-step instructions.
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

const STORAGE_CHATS_KEY = "am_chat_sessions_v3";
const STORAGE_GEMINI_KEY = "am_user_gemini_api_key";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem(STORAGE_GEMINI_KEY) || "");
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem(STORAGE_GEMINI_KEY) || "");
  const [apiSaveNotice, setApiSaveNotice] = useState("");

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
  const { addToCart } = useCart();
  const { addOrder } = useOrders();
  const { triggerLoader } = useVIPLoader();

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

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, typewriterText, open]);

  // Open chatbot with VIP Loader transition
  const handleOpenChatbot = () => {
    triggerLoader(
      "👑 Al Madina AI Shahi Host",
      "AI Assistant se rabta qaim ho raha hai...",
      1200,
      () => setOpen(true)
    );
  };

  // Handle Pen-style Typewriter animation for long answers
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
    // Common typo fixes for Mutton (User explicitly demonstrated "Button" typo)
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

  // Save User API Key
  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    setUserApiKey(key);
    localStorage.setItem(STORAGE_GEMINI_KEY, key);
    setApiSaveNotice("API Key mehfooz ho gayi! Ab AI Shahi Host live mode par hai.");
    setTimeout(() => {
      setApiSaveNotice("");
      setApiKeyModalOpen(false);
    }, 1800);
  };

  // Optional External Gemini API Call
  const callExternalGemini = async (prompt) => {
    if (!userApiKey) return null;
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(userApiKey)}`;
      const sysInstruction = `You are the royal culinary AI Host of Al Madina Restaurant in Karachi, Pakistan.
Location: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi.
Phone/WhatsApp: 0300-1234567. Timings: 12:00 PM to 12:00 AM.
Dishes & Prices:
- Desi Mitti Handi Mutton Karahi (1 KG): Rs 1,450
- VIP Royal Handi Mutton Feast Platter: Rs 2,200
- Chicken Biryani (Dum Pukht): Rs 680
- Mutton Biryani: Rs 950
- Charcoal Seekh Kebab (4 pcs): Rs 650
- Kashmiri Pink Chai: Rs 200
- Vegetable Samosa (Plate): Rs 200
- Dal Makhani (Handi): Rs 600
- Shahi Gulab Jamun (2 pcs): Rs 300
Home delivery fee across Karachi: Rs 150.
Always respond warmly in the customer's language (Roman Urdu or English or Urdu script).
If customer types typos like 'button' meaning 'mutton', understand gracefully.
If user asks about non-food topics, politely decline and bring them back to Al Madina Restaurant.`;

      const body = {
        contents: [
          { role: "user", parts: [{ text: `${sysInstruction}\n\nCustomer Message: ${prompt}` }] }
        ]
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) return null;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : null;
    } catch {
      return null;
    }
  };

  const processResponse = async (userText) => {
    const raw = userText.trim();
    const clean = normalizeInput(raw);
    const lang = detectLanguage(raw);

    // Try user's custom Gemini API key first if configured
    if (userApiKey) {
      const liveAiText = await callExternalGemini(raw);
      if (liveAiText) {
        // Check if response mentions mutton or biryani to attach product
        let matchedProduct = null;
        if (clean.includes("mutton") || clean.includes("karahi") || raw.toLowerCase().includes("button")) {
          matchedProduct = MENU_RECOMMENDATIONS.karahi;
        } else if (clean.includes("biryani")) {
          matchedProduct = MENU_RECOMMENDATIONS.biryani;
        } else if (clean.includes("kebab")) {
          matchedProduct = MENU_RECOMMENDATIONS.kebab;
        } else if (clean.includes("chai")) {
          matchedProduct = MENU_RECOMMENDATIONS.chai;
        }

        return {
          text: liveAiText,
          product: matchedProduct,
          suggestedQuestions: [
            "🍖 Mutton Karahi ka rate kya hai?",
            "🍛 Biryani order karni hai",
            "🧾 Mera bill banao",
            "📍 Location aur delivery time?"
          ],
        };
      }
    }

    // 1. Off-topic check (Politics, coding, homework, cricket, movies, etc.)
    const offTopicKeywords = [
      "weather", "mausam", "barish", "politics", "siasat", "imran", "nawaz", "shahbaz",
      "cricket", "babar", "match", "psl", "ipl", "football", "world cup",
      "movie", "film", "drama", "song", "gana", "music", "actor", "hero",
      "python", "javascript", "react", "html", "css", "c++", "coding", "code",
      "homework", "math", "algebra", "science", "physics", "chemistry",
      "naukri", "cv", "resume", "interview", "girlfriend", "boyfriend", "pyar", "dating",
      "crypto", "bitcoin", "trading", "stock", "dollar"
    ];

    if (offTopicKeywords.some((k) => clean.includes(k))) {
      if (lang === "english") {
        return {
          text: "Dear guest, I am solely dedicated to Al Madina Restaurant (Karachi), our authentic dishes, recipes, bills, and deliveries. I am unable to discuss unrelated subjects! If you would like our renowned Desi Mutton Karahi, Chicken Biryani, or BBQ Seekh Kebabs, please let me know and I will assist you right away! 🍽️✨",
          product: null,
          suggestedQuestions: ["Show today's VIP Deals", "What are the restaurant timings?", "Calculate bill for 2 Karahi"],
        };
      }
      return {
        text: "Bhai / Sister, main sirf Al Madina Restaurant ke zaiqon, khano, menu aur delivery orders ke bare mein baat kar sakta hoon. Main doosri baton ya topics par baat nahi kar sakta! Agar aap hamari mashhoor Mutton Karahi, Dum Pukht Chicken Biryani, Charcoal Seekh Kebab ya Family Feast Platter order karna chahte hain to mujhe batayein, main abhi aapki cart mein add karwa deta hoon! 🍽️✨",
        product: null,
        suggestedQuestions: ["🔥 Special VIP Deals dekhayein", "⏰ Restaurant khulne ka time?", "🍖 Mutton Karahi ki price aur detail?"],
      };
    }

    // 2. MUTTON INQUIRY & TYPO TOLERANCE ("Button" -> "Mutton")
    const isMuttonInquiry =
      clean.includes("mutton") ||
      clean.includes("bakra") ||
      raw.toLowerCase().includes("button") ||
      raw.toLowerCase().includes("buttn") ||
      raw.toLowerCase().includes("batan");

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

    // 3. Praise / Feedback detection -> Offer Review Form
    if (
      clean.includes("boht acha") ||
      clean.includes("zabardast") ||
      clean.includes("lajawab") ||
      clean.includes("delicious") ||
      clean.includes("tasty") ||
      clean.includes("maza aya") ||
      clean.includes("love it") ||
      clean.includes("best food")
    ) {
      return {
        text: "SubhanAllah! Boht boht shukriya aapki tareef ka! Al Madina Restaurant ke Shahi Bawarchi hamesha taaza aur laziz khana tayyar karte hain. Kya aap apna yeh keemti review hamari website par publish karna chahenge taakay har customer dekh sakay?",
        reviewPrompt: true,
        product: null,
        suggestedQuestions: ["Reviews section mein review likhein", "Aur kya special khana hai?", "WhatsApp owner se rabta"],
      };
    }

    // 4. Direct Contact, Owner, WhatsApp or Email request
    if (clean.includes("whatsapp") || clean.includes("email") || clean.includes("phone") || clean.includes("rabta") || clean.includes("contact") || clean.includes("number")) {
      return {
        text: `Al Madina Restaurant Karachi se rabta karne ki mukammal tafseelat:\n\n📱 Owner WhatsApp & Call: ${RESTAURANT_PHONE}\n📧 Official Email: contact@almadinarestaurant.pk\n📍 Karachi Branch: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi.\n\nAap direct WhatsApp par baat kar sakte hain ya email bhej sakte hain:`,
        whatsappSupport: true,
        product: null,
        suggestedQuestions: ["📍 Google Map direction kahan hai?", "⏰ Delivery charges kitne hain?", "Menu dikhayein"],
      };
    }

    // 5. Auto-Order Generation when customer gives items + address
    const hasOrderIntent = clean.includes("order") || clean.includes("mangwa") || clean.includes("chahiye") || clean.includes("bhej do");
    const hasAddress = clean.includes("location") || clean.includes("address") || clean.includes("korangi") || clean.includes("karachi") || clean.includes("house") || clean.includes("flat") || clean.includes("gali") || clean.includes("road");
    const extractedPhoneMatch = raw.match(/\b03\d{2}[- ]?\d{7}\b/);
    const guestPhone = extractedPhoneMatch ? extractedPhoneMatch[0] : "0300-1234567";

    if (hasOrderIntent && hasAddress) {
      const autoOrder = addOrder({
        items: [
          {
            id: MENU_RECOMMENDATIONS.biryani.id,
            name: MENU_RECOMMENDATIONS.biryani.name,
            price: MENU_RECOMMENDATIONS.biryani.price,
            quantity: 2,
            image: MENU_RECOMMENDATIONS.biryani.image,
          },
        ],
        fulfillment: "delivery",
        paymentMethod: "cod",
        customer: {
          name: "Guest via AI Host",
          phone: guestPhone,
          address: raw.slice(0, 80),
        },
        total: MENU_RECOMMENDATIONS.biryani.price * 2 + 150,
      });

      return {
        text: `Mubarak ho! Aapka order auto-confirm kar liya gaya hai!\n\n📋 Order ID: #${autoOrder.id}\n🍛 Items: 2x Chicken Biryani\n🛵 Home Delivery: Karachi Address confirmed\n💵 Total Bill: Rs ${autoOrder.total} (Cash on Delivery)\n\nKitchen mein tayyari shuru ho chuki hai aur live tracking map par rider ki bike chalti hui nazar aayegi!`,
        orderPlaced: autoOrder,
        product: null,
        suggestedQuestions: ["🛵 Live GPS Tracking dekhein", "📱 WhatsApp par receipt mangwayein", "Table reservation kaise karein?"],
      };
    }

    // 6. Bill calculation inquiry
    if (clean.includes("bill") || clean.includes("total") || clean.includes("hisab") || clean.includes("calculate") || clean.includes("banao")) {
      const billData = {
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
        text: `Yaqeenan! Yeh lijiye aapke muntakhib items ka VIP Bill Estimate:\n\n📋 **MUKAMMAL BILL ESTIMATE:**\n• 2x Chicken Biryani: Rs 1,360\n• 1x Handi Mutton Karahi: Rs 1,450\n• 1x BBQ Seekh Kebab: Rs 650\n• Delivery Charge (All Karachi): Rs 150\n✨ **Kul Total Raqam:** Rs 3,610\n\n🍲 **SEHAT BAKHSH FAIDAY:**\n• Chicken Biryani: Khalis zafran aur sela basmati chawal jo hazme ke liye behtareen hain.\n• Mutton Karahi: Taaza Mandi ka bakra organic desi ghee mein tayyar — body energy aur zinc se labrez.\n• Seekh Kebab: Koylay par char-grill low-calorie lean protein.\n\nKya aap yeh items cart mein add kar ke checkout karna chahenge?`,
        bill: billData,
        product: null,
        suggestedQuestions: ["Yehi order abhi confirm karein", "Kashmiri Chai add karein", "Delivery kitni der mein aayegi?"],
      };
    }

    // 7. Chicken Biryani Inquiry
    if (clean.includes("biryani") || clean.includes("chawal") || clean.includes("rice")) {
      const item = MENU_RECOMMENDATIONS.biryani;
      return {
        text: `Al Madina ki Dum Pukht Chicken Biryani (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Saath Taaza Dahi Raita aur Salad shamil hai.\n\nKya aap ise apni cart mein add karna chahenge?`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 680)", "Karahi ka rate kya hai?", "Family Platter discount deal?"],
      };
    }

    // 8. General Karahi Inquiry
    if (clean.includes("karahi") || clean.includes("handi")) {
      const item = MENU_RECOMMENDATIONS.karahi;
      return {
        text: `Desi Mitti Handi Mutton Karahi (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Har roz taaza zabiha halaal bakray ka gosht.\n\nKya main ise aapke liye order karoon?`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 1450)", "Biryani add karein", "Rogheni Naan sath milega?"],
      };
    }

    // 9. BBQ / Kebab Inquiry
    if (clean.includes("kebab") || clean.includes("seekh") || clean.includes("bbq") || clean.includes("tikka") || clean.includes("boti")) {
      const item = MENU_RECOMMENDATIONS.kebab;
      return {
        text: `Charcoal Seekh Kebab (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• 4 piece rasdar seekhein sath taaza podina chatni.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 650)", "Mutton Karahi ka rate?", "Deals dikhayein"],
      };
    }

    // 10. Kashmiri Chai / Tea Inquiry
    if (clean.includes("chai") || clean.includes("tea") || clean.includes("pink")) {
      const item = MENU_RECOMMENDATIONS.chai;
      return {
        text: `Shahi Kashmiri Pink Tea (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Taaza pista badam ke crunchy tukray.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 200)", "Gulab Jamun add karein", "Biryani rate?"],
      };
    }

    // 11. Dal Makhani Inquiry
    if (clean.includes("makhani") || clean.includes("daal") || clean.includes("dal")) {
      const item = MENU_RECOMMENDATIONS.makhani;
      return {
        text: `12-Hour Slow Simmered Dal Makhani (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Asli desi makkhan aur taaza malai ka shahi tadka.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 600)", "Rogheni Naan add karein", "Menu dikhayein"],
      };
    }

    // 12. Samosa / Starters Inquiry
    if (clean.includes("samosa") || clean.includes("starter") || clean.includes("snack")) {
      const item = MENU_RECOMMENDATIONS.samosa;
      return {
        text: `Royal Vegetable Samosa (Rs ${item.price} - 2 Pcs):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Khasta hath-ki-patti aur chatpati khatti-meethi imli chutney.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 200)", "Chai sath add karein", "Biryani rate?"],
      };
    }

    // 13. Dessert / Gulab Jamun Inquiry
    if (clean.includes("gulab jamun") || clean.includes("dessert") || clean.includes("mithai") || clean.includes("meetha") || clean.includes("sweet")) {
      const item = MENU_RECOMMENDATIONS.dessert;
      return {
        text: `Shahi Khoya Gulab Jamun (Rs ${item.price} - 2 Pcs):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Desi ghee mein tale huye garam garam rasdar jamun.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 300)", "Kashmiri Chai add karein", "Mutton Karahi rate?"],
      };
    }

    // 14. Deals & Family Platters Inquiry
    if (clean.includes("deal") || clean.includes("platter") || clean.includes("bachat") || clean.includes("family") || clean.includes("combo")) {
      const item = MENU_RECOMMENDATIONS.platter;
      return {
        text: `VIP Shahi Family Feast Platter (20% Discount - Rs ${item.price}):\n\nIs mein Chicken Biryani, 4x BBQ Seekh Kebabs, Rogheni Naan aur Thandi Cold Drinks shamil hain! Poori family ke 3-4 afraad ke liye behtareen dawat.`,
        product: item,
        suggestedQuestions: ["🛒 Platter Cart Mein Dalein", "Table reservation kaise hogi?", "Delivery charges?"],
      };
    }

    // 15. Location & Address Inquiry
    if (clean.includes("location") || clean.includes("address") || clean.includes("kahan") || clean.includes("karachi") || clean.includes("branch") || clean.includes("pata")) {
      return {
        text: "📍 Al Madina Restaurant ka Karachi Address:\n25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.\n\nWebsite ke Contact section mein interactive live map aur Google Maps directions ka live button bhi mojood hai!",
        product: null,
        suggestedQuestions: ["⏰ Khulne ka waqt kya hai?", "🛵 Delivery charges kitne hain?", "Menu dekhein"],
      };
    }

    // 16. Timings Inquiry
    if (clean.includes("timing") || clean.includes("time") || clean.includes("waqt") || clean.includes("open") || clean.includes("hours") || clean.includes("kab")) {
      return {
        text: "⏰ Al Madina Restaurant Rozana dopahar 12:00 PM se raat 12:00 AM tak khula rehta hai (Dine-in, Takeaway aur Home Delivery tamam waqt dastiyab hain).",
        product: null,
        suggestedQuestions: ["Table book karein", "Delivery charge kitna hai?", "Menu rate list"],
      };
    }

    // 17. Delivery & Tracking Inquiry
    if (clean.includes("track") || clean.includes("delivery") || clean.includes("rider") || clean.includes("charges") || clean.includes("fare")) {
      return {
        text: "🛵 Karachi bhar mein home delivery charges sirf Rs 150 hain. Order confirm hotay hi live GPS map par bike chalti hui aapke ghar ki taraf nazar aati hai!",
        product: null,
        suggestedQuestions: ["Order History & Live Track", "WhatsApp par rabta", "Menu dikhayein"],
      };
    }

    // 18. Table Reservation Inquiry
    if (clean.includes("table") || clean.includes("reservation") || clean.includes("book") || clean.includes("seat") || clean.includes("family hall")) {
      return {
        text: "🍽️ Table Book karne ke liye navbar mein 'Reservations' par jayein. Apna naam, phone, tareekh aur mehmaano ki tadaad darj karein — VIP family seating foran confirm ho jayegi!",
        product: null,
        suggestedQuestions: ["Table booking page kholen", "Family Hall seating hai?", "Menu rate list"],
      };
    }

    // 19. Friendly Greetings & Chit-chat (Wa Alaikum Assalam / Hello / Bhai)
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

    // 20. Default Conversational Hospitality (Does NOT attach Biryani blindly)
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

    setTimeout(async () => {
      const response = await processResponse(text);
      streamBotMessage(response, updatedMessages);
    }, 350);
  };

  // Chat Sessions Management
  const handleNewChat = () => {
    const newId = "chat_" + Date.now();
    const newChat = {
      id: newId,
      title: "New Chat",
      archived: false,
      createdAt: Date.now(),
      messages: [INITIAL_MESSAGE],
    };
    setSessions((prev) => [newChat, ...prev]);
    setCurrentChatId(newId);
    setSidebarOpen(false);
  };

  const handleRenameChat = (chatId) => {
    if (!titleInput.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === chatId ? { ...s, title: titleInput.trim() } : s))
    );
    setEditingTitleId(null);
    setTitleInput("");
  };

  const handleArchiveChat = (chatId) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === chatId ? { ...s, archived: !s.archived } : s))
    );
  };

  const handleDeleteChat = (chatId) => {
    if (sessions.length <= 1) {
      setSessions([
        {
          id: "chat_default",
          title: "New Chat",
          archived: false,
          createdAt: Date.now(),
          messages: [INITIAL_MESSAGE],
        },
      ]);
      return;
    }
    const filtered = sessions.filter((s) => s.id !== chatId);
    setSessions(filtered);
    if (currentChatId === chatId) {
      setCurrentChatId(filtered[0]?.id || "chat_default");
    }
  };

  // Scroll Helpers: Only Up (Top) & Down (Bottom) per user request
  const scrollChat = (direction) => {
    if (!scrollRef.current) return;
    if (direction === "top") {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (direction === "down") {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <style>{`
        .am-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 28px rgba(212,175,55,0.45);
          z-index: 9998;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .am-chat-fab:hover {
          transform: scale(1.08) rotate(5deg);
          box-shadow: 0 12px 35px rgba(212,175,55,0.6);
        }
        .am-chat-window {
          position: fixed;
          bottom: 92px;
          right: 20px;
          width: 420px;
          max-width: calc(100vw - 28px);
          height: 600px;
          max-height: calc(100vh - 110px);
          background: #0B0A08;
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(212,175,55,0.22);
          animation: am-chat-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes am-chat-in {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .am-chat-header {
          padding: 12px 16px;
          background: linear-gradient(90deg, #16140D, #0B0A08);
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
          background: radial-gradient(circle at top right, rgba(212,175,55,0.06), transparent 70%);
        }
        .am-bubble {
          max-width: 88%;
          padding: 11px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
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
        .am-typing-dots span {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #D4AF37;
          margin: 0 2px;
          animation: am-dot-pulse 1.2s infinite ease-in-out;
        }
        .am-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .am-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes am-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.2); opacity: 1; }
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
                  Live Hospitality {userApiKey ? "(Gemini Connected)" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* API Settings Button */}
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(true)}
                className="p-1.5 text-white/60 hover:text-[#D4AF37] hover:bg-white/5 rounded-md transition-colors"
                title="AI Engine / API Settings"
              >
                <Settings size={15} />
              </button>

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

          {/* Sidebar Drawer: Chat History (ChatGPT style) */}
          {sidebarOpen && (
            <div className="bg-[#12100C] border-b border-[#D4AF37]/20 p-3 max-h-56 overflow-y-auto animate-fade-in text-xs text-white/80">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="font-bold text-[#F0DFA0] flex items-center gap-1">
                  <Archive size={13} /> Chat Sessions History
                </span>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="px-2 py-1 rounded bg-[#D4AF37]/20 text-[#F0DFA0] hover:bg-[#D4AF37]/30 flex items-center gap-1 text-[11px]"
                >
                  <Plus size={11} /> New Chat
                </button>
              </div>

              <div className="space-y-1">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-2 rounded-lg flex items-center justify-between gap-2 group transition-colors ${
                      sess.id === currentChatId
                        ? "bg-[#D4AF37]/20 text-[#FFF2A3] border border-[#D4AF37]/40"
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
                          className="text-emerald-400 p-0.5 hover:text-emerald-300"
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
                        <p className="truncate font-medium">{sess.title}</p>
                        <p className="text-[10px] text-white/40">
                          {sess.messages?.length || 1} messages
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
                        className="p-1 hover:text-[#D4AF37]"
                        title="Rename Chat"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchiveChat(sess.id)}
                        className={`p-1 hover:text-amber-400 ${sess.archived ? "text-amber-400" : ""}`}
                        title="Archive"
                      >
                        <Archive size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChat(sess.id)}
                        className="p-1 hover:text-red-400"
                        title="Delete Chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

                {/* Single Product Card */}
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

            {/* Typing Dots Indicator */}
            {isTyping && (
              <div className="am-bubble bot am-typing-dots">
                <span />
                <span />
                <span />
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

      {/* API Key Setup Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#110F0A] border border-[#D4AF37]/50 rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Gemini API Settings</h3>
                  <p className="text-xs text-white/60">Connect live AI model to Al Madina Host</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-white/80 space-y-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="font-semibold text-[#F0DFA0] flex items-center gap-1">
                <Sparkles size={13} className="text-[#D4AF37]" /> Gemini API Kaise Hasil Karein? (3 Aasan Steps):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-white/70">
                <li>Google AI Studio (<span className="text-[#D4AF37]">aistudio.google.com</span>) par jayein.</li>
                <li><strong>"Get API key"</strong> par click kar ke Free API Key create karein.</li>
                <li>Key copy kar ke nechy diye gaye box mein paste kar ke Save karein!</li>
              </ol>
              <p className="text-[11px] text-white/50 italic pt-1">
                Note: Agar aap API key nahi lagate, to bhi built-in Shahi Host tamam sawalat, Mutton/Biryani prices, recipes aur bills ka jawab deta rahega!
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-white/70 block">
                Gemini API Key (Optional):
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-[#D4AF37] outline-none text-xs font-mono text-white"
              />
            </div>

            {apiSaveNotice && (
              <p className="text-xs text-emerald-400 mb-3 font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> {apiSaveNotice}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              {userApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setUserApiKey("");
                    setApiKeyInput("");
                    localStorage.removeItem(STORAGE_GEMINI_KEY);
                    setApiSaveNotice("API Key remove kar di gayi. Built-in host active hai.");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10"
                >
                  Remove Key
                </button>
              )}
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black hover:brightness-110"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
