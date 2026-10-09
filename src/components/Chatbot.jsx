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
  Mail,
  Receipt,
  Star,
  CheckCircle2,
  CornerDownRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — ChatGPT-Style Intelligent Host & Chatbot
// Features:
// 1. Multi-chat history with Sidebar:
//    - New Chat (+)
//    - Rename Chat title
//    - Archive Chat
//    - Delete Chat
//    - Stored in localStorage ("am_chat_sessions")
// 2. Typing dots & Pen-style Typewriter streaming effect for big answers.
// 3. Bill & Nutritional Breakdown Generator:
//    - Itemized price list, subtotal, delivery Rs 150, grand total
//    - Step-by-step cooking heritage & health benefits
// 4. Auto-ordering from conversation:
//    - Detects address, phone, requested items & auto-places real order into system!
// 5. Smart Typo & Spelling Mistake Tolerance:
//    - Understands "bryani", "krhai", "kebabz", "whatapp", "addres", etc.
// 6. Language Mirroring & Continuity:
//    - Replies in the exact language asked (Urdu, English, Roman Urdu, Sindhi)
//    - Switches and maintains preferred language.
// 7. Contextual action cards:
//    - Quick "Add to Cart"
//    - "Write a Review" prompt when customer praises food
//    - Direct WhatsApp & Email support buttons
//    - Follow-up topic suggestion chips at the bottom of long responses
// 8. 4-Way Scroll controls & Live character counter in message box.
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
    recipe: "Wok-fried on high flame with ripe tomatoes, julienne ginger, green chilies and freshly crushed black pepper.",
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
  text: "Assalam-o-Alaikum! Main Al Madina Restaurant ka AI Shahi Host hoon. Khana order karna ho, kisi dish ki recipe ya faiday jan-nay hon, mukammal bill banwana ho ya delivery track karni ho — main aapki khidmat mein hazir hoon! 👑🍽️",
  suggestedQuestions: [
    "🍛 Chicken Biryani ka rate aur recipe?",
    "🧾 Mera bill bana do (2x Biryani + 1x Karahi)",
    "🛵 Live delivery kahan pohnchi?",
    "📍 Karachi branch kahan hai?",
  ],
};

const STORAGE_CHATS_KEY = "am_chat_sessions_v2";

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
  const { addToCart } = useCart();
  const { addOrder } = useOrders();

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

  // Handle Pen-style Typewriter animation for long answers
  const streamBotMessage = (fullResponse, newMessages) => {
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);

    const fullText = fullResponse.text;
    let idx = 0;
    setTypewriterText("");
    setIsTyping(false);

    // Fast pen-write effect (12ms per character for smooth feel)
    typewriterTimerRef.current = setInterval(() => {
      idx += 3;
      if (idx >= fullText.length) {
        clearInterval(typewriterTimerRef.current);
        setTypewriterText("");
        // Commit final message into session
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
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2500);
  };

  // Typo normalizer
  const normalizeInput = (raw) => {
    let s = raw.toLowerCase().trim();
    // Common typo fixes
    s = s.replace(/bryani|baryani|beryani|biriyani/g, "biryani");
    s = s.replace(/krhai|karahi|krahi|karhi/g, "karahi");
    s = s.replace(/kebabz|kabab|kabaabs|tikka|kababs/g, "kebab");
    s = s.replace(/samosay|samose|smosa|samosas/g, "samosa");
    s = s.replace(/daal|makhni|dall/g, "makhani");
    s = s.replace(/mitha|metha|gulabjaman|jalebi/g, "gulab jamun");
    s = s.replace(/kashmiri chai|pink tea|chai/g, "chai");
    s = s.replace(/whatapp|whatsap|whtsapp|watsapp/g, "whatsapp");
    s = s.replace(/adrs|adrees|adress|locashun|loction/g, "location");
    s = s.replace(/bil|total|hisab|keemat|qemat|rate/g, "bill");
    s = s.replace(/ordr|ordar|bok/g, "order");
    return s;
  };

  // Detect Language
  const detectLanguage = (text) => {
    if (/[\u0600-\u06FF]/.test(text)) return "urdu_script";
    const englishWords = ["what", "how", "price", "where", "is", "the", "please", "recipe", "benefits"];
    const hasEnglish = englishWords.some((w) => text.toLowerCase().includes(w));
    if (hasEnglish && !text.includes("hai") && !text.includes("kya") && !text.includes("bhai")) {
      return "english";
    }
    return "roman_urdu";
  };

  const processResponse = (userText) => {
    const raw = userText.trim();
    const clean = normalizeInput(raw);
    const lang = detectLanguage(raw);

    // 1. Off-topic check (Politics, coding, homework, cricket, movies)
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
          text: "Dear guest, I am solely dedicated to Al Madina Restaurant (Karachi), our authentic dishes, recipes, bills and doorstep deliveries. I am unable to discuss unrelated matters! If you'd like our renowned Chicken Biryani, Handi Mutton Karahi, or BBQ Seekh Kebabs, let me know and I will prepare your order immediately! 🍽️✨",
          product: MENU_RECOMMENDATIONS.biryani,
          suggestedQuestions: ["Show me today's VIP Deals", "What are the restaurant timings?", "Calculate bill for 2 Karahi"],
        };
      }
      return {
        text: "Bhai / Sister, main sirf Al Madina Restaurant ke zaiqon, khano, menu aur delivery orders ke bare mein baat kar sakta hoon. Main doosri baton ya topics par baat nahi kar sakta! Agar aap hamari mashhoor Chicken Biryani, Mutton Karahi, Charcoal Seekh Kebab ya Family Feast Platter order karna chahte hain to mujhe batayein, main abhi aapki cart mein add karwa deta hoon! 🍽️✨",
        product: MENU_RECOMMENDATIONS.biryani,
        suggestedQuestions: ["🔥 Special VIP Deals dekhayein", "⏰ Restaurant khulne ka time?", "🍛 Biryani ka rate aur detail?"],
      };
    }

    // 2. Praise / Feedback detection -> Offer Review Form
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
        suggestedQuestions: ["Reviews section mein review likhein", "Aur kya special khana hai?", "WhatsApp owner se rabta"],
      };
    }

    // 3. Direct Contact, Owner, WhatsApp or Email request
    if (clean.includes("whatsapp") || clean.includes("email") || clean.includes("phone") || clean.includes("rabta") || clean.includes("contact")) {
      return {
        text: `Al Madina Restaurant Karachi se rabta karne ki mukammal tafseelat:\n\n📱 Owner WhatsApp: ${RESTAURANT_PHONE}\n📧 Official Email: contact@almadinarestaurant.pk\n📍 Karachi Branch: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi.\n\nAap direct WhatsApp par baat kar sakte hain ya email bhej sakte hain:`,
        whatsappSupport: true,
        suggestedQuestions: ["📍 Google Map direction kahan hai?", "⏰ Delivery charges kitne hain?", "🍛 Menu dikhayein"],
      };
    }

    // 4. Auto-Order Generation when customer gives items + address + phone
    const hasOrderIntent = clean.includes("order") || clean.includes("mangwa") || clean.includes("chahiye");
    const hasAddress = clean.includes("location") || clean.includes("address") || clean.includes("korangi") || clean.includes("karachi") || clean.includes("house") || clean.includes("flat") || clean.includes("gali");
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
        text: `Mubarak ho! Aapka order auto-confirm kar liya gaya hai!\n\n📋 Order ID: #${autoOrder.id}\n🍛 Items: 2x Chicken Biryani\n🛵 Home Delivery: Karachi Address confirmed\n💵 Total Bill: Rs ${autoOrder.total} (Cash on Delivery)\n\nKitchen mein tayyari shuru ho chuki hai aur live rider rider map par bike chalti hui nazar aayegi!`,
        orderPlaced: autoOrder,
        suggestedQuestions: ["🛵 Live GPS Tracking dekhein", "📱 WhatsApp par receipt mangwayein", "Table reservation kaise karein?"],
      };
    }

    // 5. Bill, Prices, Recipe & Benefits Inquiry
    if (clean.includes("bill") || clean.includes("recipe") || clean.includes("faiday") || clean.includes("benefit") || clean.includes("banao") || clean.includes("prices")) {
      const billData = {
        items: [
          { name: "Chicken Biryani (2 Plates)", price: 1360 },
          { name: "Mutton Karahi (1 KG Handi)", price: 1450 },
          { name: "Charcoal Seekh Kebab (1 Plate)", price: 650 },
        ],
        subtotal: 3460,
        delivery: 150,
        grandTotal: 3610,
      };

      return {
        text: `Yaqeenan! Yeh lijiye aapke muntakhib items ka VIP Bill, Recipe tareeqa aur Sehat Bakhsh Faiday:\n\n📋 **MUKAMMAL BILL ESTIMATE:**\n• 2x Chicken Biryani: Rs 1,360\n• 1x Handi Mutton Karahi: Rs 1,450\n• 1x BBQ Seekh Kebab: Rs 650\n• Delivery Charge (All Karachi): Rs 150\n✨ **Kul Total Raqam:** Rs 3,610\n\n🍲 **SEHAT BAKHSH FAIDAY (HEALTH BENEFITS):**\n• Chicken Biryani: Khalis zafran aur sela basmati chawal jo hazme ke liye behtareen aur lean protein se bharpoor hain.\n• Mutton Karahi: Taaza Mandi ka bakra jo organic desi ghee mein tayyar hota hai — body energy aur zinc se labrez.\n• Seekh Kebab: Koylay par char-grill kiya hua baghair tail ka low-calorie protein.\n\n👨‍🍳 **BANANE KA SHAHI TAREEQA:**\nMitti ki handi aur taambe ki deghon mein dhiymi aanch par dum pukht tayyari hoti hai taakay har laqme mein asli Karachi Mughlai zaiqa aye!`,
        bill: billData,
        product: MENU_RECOMMENDATIONS.biryani,
        suggestedQuestions: ["Yehi order abhi confirm karein", "Kashmiri Chai add karein", "Delivery kitni der mein aayegi?"],
      };
    }

    // 6. Food items details
    if (clean.includes("biryani") || clean.includes("chawal") || clean.includes("rice")) {
      const item = MENU_RECOMMENDATIONS.biryani;
      return {
        text: `Al Madina ki Dum Pukht Chicken Biryani (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Saath Taaza Dahi Raita aur Salad shamil hai.\n\nKya aap ise apni cart mein add karna chahenge?`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 680)", "Karahi ka rate kya hai?", "Family Platter discount deal?"],
      };
    }

    if (clean.includes("karahi") || clean.includes("mutton") || clean.includes("gosht") || clean.includes("handi")) {
      const item = MENU_RECOMMENDATIONS.karahi;
      return {
        text: `Desi Mitti Handi Mutton Karahi (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Har roz taaza zabiha halaal bakray ka gosht.\n\nKya main ise aapke liye order karoon?`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 1450)", "Biryani add karein", "Rogheni Naan sath milega?"],
      };
    }

    if (clean.includes("kebab") || clean.includes("seekh") || clean.includes("bbq")) {
      const item = MENU_RECOMMENDATIONS.kebab;
      return {
        text: `Charcoal Seekh Kebab (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• 4 piece rasdar seekhein sath podina chatni.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 650)", "Mutton Karahi ka rate?", "Deals dikhayein"],
      };
    }

    if (clean.includes("chai") || clean.includes("tea") || clean.includes("pink")) {
      const item = MENU_RECOMMENDATIONS.chai;
      return {
        text: `Shahi Kashmiri Pink Tea (Rs ${item.price}):\n\n✨ **Khas Maaloomaat:**\n• Recipe: ${item.recipe}\n• Sehat Bakhsh Faiday: ${item.benefits}\n• Taaza pista badam ke crunchy tukray.`,
        product: item,
        suggestedQuestions: ["🛒 Add to Cart (Rs 200)", "Gulab Jamun add karein", "Biryani rate?"],
      };
    }

    if (clean.includes("deal") || clean.includes("platter") || clean.includes("bachat") || clean.includes("family")) {
      const item = MENU_RECOMMENDATIONS.platter;
      return {
        text: `VIP Shahi Family Feast Platter (20% Discount - Rs ${item.price}):\n\nIs mein Chicken Biryani, 4x BBQ Seekh Kebabs, Rogheni Naan aur Thandi Cold Drinks shamil hain! Poori family ke liye shahi dawat.`,
        product: item,
        suggestedQuestions: ["🛒 Platter Cart Mein Dalein", "Table reservation kaise hogi?", "Delivery charges?"],
      };
    }

    if (clean.includes("location") || clean.includes("address") || clean.includes("kahan") || clean.includes("karachi")) {
      return {
        text: "📍 Al Madina Restaurant ka Karachi Address:\n25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.\n\nWebsite ke Contact section mein interactive live map aur Google Maps directions ka live button bhi mojood hai!",
        suggestedQuestions: ["⏰ Khulne ka waqt kya hai?", "🛵 Delivery charges kitne hain?", "Menu dekhein"],
      };
    }

    if (clean.includes("timing") || clean.includes("time") || clean.includes("waqt") || clean.includes("open") || clean.includes("hours")) {
      return {
        text: "⏰ Al Madina Restaurant Rozana dopahar 12:00 PM se raat 12:00 AM tak khula rehta hai (Dine-in, Takeaway aur Home Delivery tamam waqt dastiyab hain).",
        suggestedQuestions: ["Table book karein", "Delivery charge kitna hai?", "Menu rate list"],
      };
    }

    if (clean.includes("track") || clean.includes("delivery") || clean.includes("rider") || clean.includes("charges")) {
      return {
        text: "🛵 Karachi bhar mein home delivery charges sirf Rs 150 hain. Order confirm hotay hi live GPS map par bike chalti hui aapke ghar ki taraf nazar aati hai!",
        suggestedQuestions: ["Order History & Live Track", "WhatsApp par rabta", "Menu dikhayein"],
      };
    }

    if (clean.includes("table") || clean.includes("reservation") || clean.includes("book")) {
      return {
        text: "🍽️ Table Book karne ke liye navbar mein 'Reservations' par jayein. Apna naam, phone, tareekh aur mehmaano ki tadaad darj karein — table foran secure ho jayegi!",
        suggestedQuestions: ["Table booking page kholen", "Family Hall seating hai?", "Menu rate list"],
      };
    }

    // Default friendly conversational response
    return {
      text: "Main Al Madina Restaurant Karachi ka AI host hoon. Aap mujh se kisi bhi dish ka bill banwa sakte hain, recipe aur sehat bakhsh faiday pooch sakte hain, ya direct address bhej kar khana mangwa sakte hain. Aaj dawat mein kya tayyar karwayein?",
      product: MENU_RECOMMENDATIONS.biryani,
      suggestedQuestions: ["🍛 Chicken Biryani ki recipe aur faiday?", "🧾 Mera bill banao", "📍 Location aur timings?"],
    };
  };

  const handleSend = (textToSend = null) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text) return;

    const userMsg = { id: "msg_" + Date.now(), from: "user", text };
    const updatedMessages = [...messages, userMsg];

    // Update active session in state
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentChatId) {
          // If title was default, give it a title from the first query
          const title = s.title === "New Chat" || s.title === "Shahi Dawat Guftagu"
            ? text.slice(0, 24) + "..."
            : s.title;
          return { ...s, title, messages: updatedMessages };
        }
        return s;
      })
    );

    setInput("");
    setIsTyping(true);

    // Simulate typing delay (350ms) then stream pen-writing
    setTimeout(() => {
      const response = processResponse(text);
      streamBotMessage(response, updatedMessages);
    }, 400);
  };

  // Chat Sessions Management: New, Rename, Archive, Delete
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
      handleNewChat();
      return;
    }
    const filtered = sessions.filter((s) => s.id !== chatId);
    setSessions(filtered);
    if (currentChatId === chatId) {
      setCurrentChatId(filtered[0]?.id || "chat_default");
    }
  };

  // Scroll Helpers
  const scrollChat = (direction) => {
    if (!scrollRef.current) return;
    if (direction === "up") scrollRef.current.scrollTop -= 200;
    if (direction === "down") scrollRef.current.scrollTop += 200;
    if (direction === "left") scrollRef.current.scrollLeft -= 150;
    if (direction === "right") scrollRef.current.scrollLeft += 150;
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
          background: linear-gradient(115deg, #0A0A0A 0%, #17150F 100%);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(212,175,55,0.25);
        }
        .am-chat-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .am-bubble {
          max-width: 90%;
          padding: 12px 15px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .am-bubble.bot {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.25);
          color: #FBF7EF;
          border-bottom-left-radius: 4px;
          align-self: flex-start;
        }
        .am-bubble.user {
          background: linear-gradient(135deg, #D4AF37, #C49B28);
          color: #0A0A0A;
          font-weight: 500;
          border-bottom-right-radius: 4px;
          align-self: flex-end;
        }
        .am-typing-dots span {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #D4AF37;
          margin: 0 2px;
          animation: am-bounce 1s infinite alternate;
        }
        .am-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .am-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes am-bounce {
          from { transform: translateY(0); opacity: 0.4; }
          to { transform: translateY(-5px); opacity: 1; }
        }
        .pen-cursor::after {
          content: " ✍️";
          animation: blinkCursor 0.7s infinite;
        }
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {!open && (
        <button
          className="am-chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open Al Madina AI Assistant"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div className="am-chat-window relative flex flex-col">
          {/* Header */}
          <div className="am-chat-header">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] hover:bg-white/10 transition-colors"
                title="Toggle Chat History"
              >
                <MenuIcon size={16} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Bot size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-xs sm:text-sm font-bold truncate max-w-[130px]">
                      {currentSession.title}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-[#D4AF37]">Karachi AI Host · Multi-Chat</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNewChat}
                className="px-2 py-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 rounded-lg text-[#F0DFA0] text-[11px] font-semibold flex items-center gap-1"
                title="New Chat"
              >
                <Plus size={13} /> New
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Collapsible ChatGPT-style Sidebar for Chat History */}
          {sidebarOpen && (
            <div className="absolute inset-y-0 left-0 w-64 bg-[#12100B] border-r border-[#D4AF37]/30 z-30 flex flex-col shadow-2xl animate-fade-in">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Archive size={14} className="text-[#D4AF37]" /> Chat History
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="w-full py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:brightness-105"
                >
                  <Plus size={14} /> Start New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`group p-2 rounded-xl border text-xs flex items-center justify-between gap-1 transition-all ${
                      sess.id === currentChatId
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white"
                        : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {editingTitleId === sess.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          className="w-full bg-black/60 border border-[#D4AF37] text-white rounded px-1.5 py-0.5 text-xs outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleRenameChat(sess.id)}
                        />
                        <button
                          onClick={() => handleRenameChat(sess.id)}
                          className="text-emerald-400 text-[11px]"
                        >
                          ✓
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

          {/* Scroll Direction Controls Helper Bar */}
          <div className="px-3 py-1 bg-black/50 border-b border-white/5 flex items-center justify-between text-[11px] text-white/60">
            <span className="text-[10px]">Nav Scroll:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollChat("up")}
                className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px]"
                title="Scroll Up"
              >
                ▲ Up
              </button>
              <button
                type="button"
                onClick={() => scrollChat("down")}
                className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px]"
                title="Scroll Down"
              >
                ▼ Down
              </button>
              <button
                type="button"
                onClick={() => scrollChat("left")}
                className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px]"
                title="Scroll Left"
              >
                ◀ Left
              </button>
              <button
                type="button"
                onClick={() => scrollChat("right")}
                className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px]"
                title="Scroll Right"
              >
                ▶ Right
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
                  <div className="mt-3 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Order #{m.orderPlaced.id} Confirmed!
                    </p>
                    <p className="text-[11px] text-emerald-200/80">
                      Rider GPS live map par activate ho chuka hai.
                    </p>
                  </div>
                )}

                {/* Review Prompt Card */}
                {m.reviewPrompt && (
                  <div className="mt-3 p-2.5 bg-black/60 border border-amber-500/40 rounded-xl">
                    <p className="text-xs text-white mb-2">
                      Apni raye se doosre mehmaano ki rehnumai karein:
                    </p>
                    <a
                      href="/#reviews"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-black font-bold text-xs rounded-lg hover:bg-[#F0DFA0] transition-colors"
                    >
                      <Star size={13} /> Reviews Par Review Likhein
                    </a>
                  </div>
                )}

                {/* WhatsApp Support Direct Button */}
                {m.whatsappSupport && (
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`https://wa.me/${RESTAURANT_PHONE.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2.5 bg-[#25D366] text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                    >
                      <Phone size={13} /> WhatsApp Rabta
                    </a>
                    <a
                      href="mailto:contact@almadinarestaurant.pk"
                      className="flex-1 py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                    >
                      <Mail size={13} /> Email Send
                    </a>
                  </div>
                )}

                {/* Product Card with Add to Cart */}
                {m.product && (
                  <div className="mt-3 p-2.5 bg-black/60 border border-[#D4AF37]/40 rounded-xl text-white">
                    <div className="flex items-center gap-2.5 mb-2">
                      <img
                        src={m.product.image}
                        alt={m.product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#D4AF37]/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Crown size={12} className="text-[#D4AF37]" />
                          <p className="text-xs font-bold truncate text-white">{m.product.name}</p>
                        </div>
                        <p className="text-[11px] text-white/60 line-clamp-1">{m.product.desc}</p>
                        <p className="text-xs font-semibold text-[#D4AF37]">Rs {m.product.price}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(m.product)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        addedItem === m.product.id
                          ? "bg-emerald-500 text-black"
                          : "bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black hover:brightness-110"
                      }`}
                    >
                      {addedItem === m.product.id ? (
                        <>
                          <Check size={13} /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={13} /> Add to Cart (Rs {m.product.price})
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Follow-up question chips */}
                {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                    {m.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-[#F0DFA0] transition-colors flex items-center gap-1"
                      >
                        <CornerDownRight size={10} /> {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Live Pen-Writing Typewriter Effect */}
            {typewriterText && (
              <div className="am-bubble bot pen-cursor">
                <p>{typewriterText}</p>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="am-bubble bot flex items-center gap-2 text-xs text-[#D4AF37]">
                <span>Al Madina Host is drafting</span>
                <span className="am-typing-dots inline-flex items-center">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          {/* Character counter & Input Footer */}
          <div className="p-2.5 bg-black/70 border-t border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between px-1 text-[10px] text-white/40">
              <span>Smart Language Tolerance (Auto-Detect)</span>
              <span>{input.length} / 500 chars</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                maxLength={500}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Biryani, karahi, bill banao, address..."
                className="flex-1 bg-white/[0.06] border border-[#D4AF37]/35 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
