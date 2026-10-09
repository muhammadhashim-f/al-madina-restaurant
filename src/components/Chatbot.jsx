import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  ShoppingCart,
  Check,
  Crown,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { RESTAURANT_PHONE } from "../utils/whatsapp";

// ============================================================
// AL MADINA RESTAURANT — Intermediate Smart Host & Chatbot
// 100% Focused on Al Madina Restaurant (Karachi).
// - Comprehensive culinary knowledge, pricing, timings, deals,
//   halal standards, family dining, live GPS bike tracking, and WhatsApp ordering.
// - Authentic, polite Urdu/Roman Urdu conversational style.
// - Interactive Add-to-Cart cards right inside the chat.
// - Strict boundary detection: Politely turns away off-topic queries
//   and guides guests straight back to food ordering.
// ============================================================

const MENU_RECOMMENDATIONS = {
  biryani: {
    id: 4,
    name: "Chicken Biryani",
    price: 680,
    image: "/Images/menu/Chicken Biryani.jpg",
    desc: "Dum pukht sela basmati with tender spiced chicken, saffron aroma & mint raita.",
  },
  karahi: {
    id: 3,
    name: "Mutton Karahi",
    price: 1450,
    image: "/Images/menu/Mutton Karahi.jpg",
    desc: "Desi ghee & mitti ki handi mein dum diya gaya taaza desi bakray ka gosht.",
  },
  kebab: {
    id: 1,
    name: "Chicken Seekh Kebab",
    price: 650,
    image: "/Images/menu/Chicken Seekh Kebab.jpg",
    desc: "Charcoal-grilled minced chicken skewers infused with 16 royal spices.",
  },
  samosa: {
    id: 2,
    name: "Vegetable Samosa",
    price: 200,
    image: "/Images/menu/Vegetable Samosa.jpg",
    desc: "Crisp handmade pastry filled with spiced potatoes, peas & roasted cumin.",
  },
  makhani: {
    id: 5,
    name: "Dal Makhani",
    price: 600,
    image: "/Images/menu/Dal-Makhani.jpg",
    desc: "12-hour slow-simmered black lentils with churned butter & malai.",
  },
  dessert: {
    id: 6,
    name: "Gulab Jamun",
    price: 300,
    image: "/Images/menu/Gulab Jamun.jpg",
    desc: "Warm khoya dumplings in cardamom-rose syrup with crushed pistachios.",
  },
  chai: {
    id: 7,
    name: "Kashmiri Chai",
    price: 200,
    image: "/Images/menu/Kashmiri_Chai.png",
    desc: "Authentic pink tea slow-brewed with pistachios & crushed almonds.",
  },
  platter: {
    id: 101,
    name: "VIP Shahi Dawat Platter",
    price: 1920,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
    desc: "VIP royal combo: Chicken Biryani, Seekh Kebabs, Rogheni Naan & Drinks.",
  },
};

const SUGGESTION_CHIPS = [
  "🍛 Chicken Biryani",
  "🍖 Mutton Karahi Rate?",
  "🔥 Special Deals",
  "📍 Karachi Location",
  "⏰ Khulne Ka Time",
  "🛵 Live Delivery Tracking",
  "👨‍👩‍👧 Family Hall Seating",
  "📱 WhatsApp Order",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Assalam-o-Alaikum! Main Al Madina Restaurant ka digital host hoon. Khana order karna ho, menu ya deals dekhni hon, live delivery track karni ho ya table reserve karni ho — main aapki poori madad karunga! 👑🍽️",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const scrollRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

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

  const processResponse = (userText) => {
    const text = userText.toLowerCase().trim();

    // 1. Off-topic detection (strictly website focus)
    const offTopicKeywords = [
      "weather", "mausam", "barish", "politics", "siasat", "imran", "nawaz", "shahbaz",
      "cricket", "babar", "match", "psl", "ipl", "football", "world cup",
      "movie", "film", "drama", "song", "gana", "music", "actor", "hero",
      "code", "coding", "python", "javascript", "react", "html", "css", "c++",
      "homework", "math", "algebra", "science", "physics", "chemistry", "history",
      "job", "naukri", "cv", "resume", "interview",
      "girlfriend", "boyfriend", "pyar", "shadi", "dating", "love",
      "paisa", "dollar", "crypto", "bitcoin", "trading", "stock",
      "khabrain", "news", "pakistan news", "pti", "pmln", "america", "election"
    ];

    if (offTopicKeywords.some((k) => text.includes(k))) {
      return {
        text: "Bhai / Sister, main sirf Al Madina Restaurant ke zaiqon, khano, menu aur delivery orders ke bare mein baat kar sakta hoon. Main doosri baton ya topics par baat nahi kar sakta! Agar aap hamari mashhoor Chicken Biryani, Mutton Karahi, Charcoal Seekh Kebab ya Family Feast Platter order karna chahte hain to mujhe batayein, main abhi aapki cart mein add karwa deta hoon! 🍽️✨",
        product: MENU_RECOMMENDATIONS.biryani,
      };
    }

    // 2. Specific Food items & Pricing with direct Add to Cart cards
    if (text.includes("biryani") || text.includes("chawal") || text.includes("rice") || text.includes("pulao")) {
      return {
        text: "Al Madina ki Chicken Biryani Karachi bhar mein apni shahi khushbu aur dum pukht zaiqay ke liye mashhoor hai! Lambe basmati sela chawal, naram chicken aur sath taaza raita. Qeemat sirf Rs 680 hai. Abhi add karein?",
        product: MENU_RECOMMENDATIONS.biryani,
      };
    }

    if (text.includes("karahi") || text.includes("mutton") || text.includes("gosht") || text.includes("handi")) {
      return {
        text: "Hamari Mutton Karahi asli desi ghee aur taaza bakray ke gosht se mitti ki handi mein dum de kar tayyar ki jati hai. Lal tamatar, bareek adrak aur kali mirch ka behtareen tadka! Qeemat: Rs 1450.",
        product: MENU_RECOMMENDATIONS.karahi,
      };
    }

    if (text.includes("kebab") || text.includes("seekh") || text.includes("tikka") || text.includes("bbq") || text.includes("boti")) {
      return {
        text: "Chicken Seekh Kebab koylay ki angethi par taaza char-grill hote hain aur 16 shahi masalon ka rasdar zaiqa dete hain. Saath mint raita aur pyaz salad milti hai! Qeemat: Rs 650.",
        product: MENU_RECOMMENDATIONS.kebab,
      };
    }

    if (text.includes("samosa") || text.includes("starter") || text.includes("snack") || text.includes("roll")) {
      return {
        text: "Hath se baili hui khasta patti ke taaza Vegetable Samose jisme aaloo, matar aur bhuna zeera shamil hai. Sath khatti meethi imlee chutney! Qeemat: Rs 200.",
        product: MENU_RECOMMENDATIONS.samosa,
      };
    }

    if (text.includes("dal") || text.includes("daal") || text.includes("makhani") || text.includes("vegetable") || text.includes("sabzi")) {
      return {
        text: "Shahi Dal Makhani makhani aag par 12 ghantay karr kar pakaai jati hai aur asli makhan aur taaza malai ka tadka lagaya jata hai. Pure desi ghee ka zaiqa! Qeemat: Rs 600.",
        product: MENU_RECOMMENDATIONS.makhani,
      };
    }

    if (text.includes("meetha") || text.includes("sweet") || text.includes("gulab jamun") || text.includes("dessert") || text.includes("kheer")) {
      return {
        text: "Garam Shahi Gulab Jamun jo asli khoye aur elaichi ke sheeray mein doobay hote hain, upar pista aur badam ki barfi garnish hoti hai! Qeemat: Rs 300.",
        product: MENU_RECOMMENDATIONS.dessert,
      };
    }

    if (text.includes("chai") || text.includes("tea") || text.includes("pink tea") || text.includes("kashmiri") || text.includes("qehwa")) {
      return {
        text: "Asli Kashmiri Chai (Shahi Gulabi Tea) doodh, pista aur pise badam ke sath tayyar ki jati hai. Har ghoont mein sukoon! Qeemat: Rs 200.",
        product: MENU_RECOMMENDATIONS.chai,
      };
    }

    if (text.includes("deal") || text.includes("offer") || text.includes("platter") || text.includes("discount") || text.includes("bachat") || text.includes("sasta")) {
      return {
        text: "Hamari VIP 'Family Feast Platter' par is waqt 20% Shahi Discount active hai! Is mein Chicken Biryani, 4x BBQ Seekh Kebab, Rogheni Naan aur Drinks shamil hain. Qeemat discount ke baad Rs 1920 hai!",
        product: MENU_RECOMMENDATIONS.platter,
      };
    }

    // 3. Operational queries: Location, Timings, Bike GPS, WhatsApp, Family Hall, Halal
    if (text.includes("location") || text.includes("address") || text.includes("kahan") || text.includes("where") || text.includes("pata") || text.includes("branch") || text.includes("karachi")) {
      return {
        text: "📍 Al Madina Restaurant ka Karachi address: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan. Contact section mein interactive live map aur Google Maps directions ka button bhi mojood hai!",
      };
    }

    if (text.includes("timing") || text.includes("time") || text.includes("waqt") || text.includes("open") || text.includes("khula") || text.includes("close") || text.includes("band") || text.includes("hours")) {
      return {
        text: "⏰ Al Madina Restaurant Rozana (Every Day) dopahar 12:00 PM se raat 12:00 AM tak khula hota hai. Aap kisi bhi waqt dine-in kar sakte hain ya online order kar sakte hain!",
      };
    }

    if (text.includes("delivery") || text.includes("rider") || text.includes("bike") || text.includes("fees") || text.includes("charge") || text.includes("charges") || text.includes("ghar")) {
      return {
        text: "🛵 Karachi ke tamam ilaqon mein home delivery charges sirf Rs 150 hain! Aur jaise hi owner order approve karta hai, live road map par delivery rider bike aapke ghar ki taraf chalti hui nazar aati hai. Takeaway/pickup order bilkul free hai!",
      };
    }

    if (text.includes("track") || text.includes("tracking") || text.includes("status") || text.includes("live") || text.includes("map") || text.includes("kahan pohncha")) {
      return {
        text: "🗺️ Al Madina Restaurant par live delivery bike tracking mojood hai! Checkout karne ke baad ya Order History (/orders) page par 'Track Order' par click karein, wahan live bike rider road par chalti hui live dikhayi degi!",
      };
    }

    if (text.includes("whatsapp") || text.includes("owner") || text.includes("number") || text.includes("phone") || text.includes("call") || text.includes("rabta") || text.includes("contact")) {
      return {
        text: `📱 Restaurant Owner ka direct WhatsApp number: ${RESTAURANT_PHONE} hai. Checkout ke waqt direct WhatsApp par slip bhejne ka button bhi mojood hai jahan se aap direct rabta kar sakte hain!`,
      };
    }

    if (text.includes("family") || text.includes("pardah") || text.includes("hall") || text.includes("bache") || text.includes("aurat") || text.includes("seating")) {
      return {
        text: "👨‍👩‍👧 Al Madina Restaurant mein families ke liye alag pursukoon, air-conditioned aur purdah seating hall mojood hai jahan aap ba-izzat aur aasaish ke sath dawat ka lutf utha sakte hain.",
      };
    }

    if (text.includes("halal") || text.includes("safai") || text.includes("hygiene") || text.includes("gosht") || text.includes("quality") || text.includes("taza")) {
      return {
        text: "✨ 100% Shariah Compliant Zabiha Halal! Hum rozana subah Mandi se taaza gosht mangwate hain. Frozen gosht bilkul istemal nahi hota aur hamara kitchen bilkul saaf suthra aur open hai.",
      };
    }

    if (text.includes("table") || text.includes("reservation") || text.includes("book") || text.includes("seat") || text.includes("dawat")) {
      return {
        text: "📅 Table book karne ke liye navbar mein 'Reservations' par click karein. Apna naam, phone number, date, time aur mehmaano ki tadad darj karein — aapki reservation foran screen par confirm ho jayegi!",
      };
    }

    if (text.includes("payment") || text.includes("card") || text.includes("cod") || text.includes("cash") || text.includes("jazzcash") || text.includes("easypaisa")) {
      return {
        text: "💵 Hum Cash on Delivery (COD) aur Credit/Debit Card dono accept karte hain. Delivery ke waqt rider ko naqd ada kar sakte hain.",
      };
    }

    if (text.includes("salam") || text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("kese ho") || text.includes("kaise ho") || text.includes("sunen")) {
      return {
        text: "Walaikum Assalam! Khush aamdeed. Main Al Madina Restaurant ka shahi host hoon. Aaj aap kya khana pasand karenge — Dum Pukht Chicken Biryani, Handi Mutton Karahi ya Charcoal BBQ Seekh Kebab?",
        product: MENU_RECOMMENDATIONS.biryani,
      };
    }

    // Default friendly restaurant fallback
    return {
      text: "Main Al Madina Restaurant Karachi ka assistant hoon. Aap mujh se kisi bhi dish ki qeemat, deals, timing, Korangi location, live GPS tracking ya WhatsApp order ke baare mein pooch sakte hain. Kya main aapke liye koi mazedaar dish recommend karoon?",
      product: MENU_RECOMMENDATIONS.biryani,
    };
  };

  const handleSend = (textToSend = null) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Realistic intermediate delay (400ms - 600ms) with typing indicator
    setTimeout(() => {
      const response = processResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: response.text,
          product: response.product || null,
        },
      ]);
      setIsTyping(false);
    }, 500);
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
          width: 370px;
          max-width: calc(100vw - 32px);
          height: 540px;
          max-height: calc(100vh - 120px);
          background: #0D0D0D;
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 30px rgba(212,175,55,0.18);
          animation: am-chat-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes am-chat-in {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .am-chat-header {
          background: linear-gradient(115deg, #0A0A0A 0%, #1A1A1A 100%);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(212,175,55,0.25);
        }
        .am-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .am-bubble {
          max-width: 88%;
          padding: 11px 15px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.5;
        }
        .am-bubble.bot {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.25);
          color: #FBF7EF;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .am-bubble.user {
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
          font-weight: 500;
        }
        .am-chip-btn {
          font-size: 11px;
          padding: 5px 11px;
          border-radius: 14px;
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.3);
          color: #F0DFA0;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .am-chip-btn:hover {
          background: #D4AF37;
          color: #0A0A0A;
          transform: translateY(-1px);
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
      `}</style>

      {!open && (
        <button className="am-chat-fab" onClick={() => setOpen(true)} aria-label="Open Al Madina Assistant">
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div className="am-chat-window">
          {/* Header */}
          <div className="am-chat-header">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-bold">Al Madina Host</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#D4AF37]">Karachi Branch Support · Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-black/40 border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="am-chip-btn"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="am-chat-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`am-bubble ${m.from}`}>
                <p>{m.text}</p>

                {/* Interactive Product Card with Add to Cart option */}
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
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="am-bubble bot flex items-center gap-2 text-xs text-[#D4AF37]">
                <span>Al Madina Host is typing</span>
                <span className="am-typing-dots inline-flex items-center">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-black/60 border-t border-white/10 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Biryani, karahi, location, timings..."
              className="flex-1 bg-white/[0.06] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0DFA0] text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
