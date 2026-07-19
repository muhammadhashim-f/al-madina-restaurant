import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

// ============================================================
// AL MADINA RESTAURANT — Helper Chatbot Widget
// Rule-based & scoped ON PURPOSE: it only answers questions about
// using this website (registration/login errors, ordering,
// reservations, payments, delivery, menu). Anything outside that
// scope gets a polite redirect, never a general-knowledge answer.
// Swap the matchIntent() function for a real API call later if
// you want smarter answers — keep the same topic restriction.
// ============================================================

const INTENTS = [
  {
    keywords: ["register", "registration", "sign up", "signup", "create account", "account not"],
    reply: "If signup isn't working: make sure your email isn't already registered, your password is at least 8 characters, and you have a stable connection. Still stuck? Try the 'Forgot password' link on the Login page, or refresh and try again.",
  },
  {
    keywords: ["login", "log in", "can't sign in", "password wrong", "wrong password"],
    reply: "For login issues: double check your email and password, and try 'Forgot password?' on the Login page to reset it. If you signed up with Google, use the 'Continue with Google' button instead of a password.",
  },
  {
    keywords: ["order", "my order", "order status", "track", "where is my food", "delivery time"],
    reply: "You can check your order status anytime from Order History (top-right profile menu, or /orders). If it's out for delivery, open that order and tap 'Track order' to see it live on the map.",
  },
  {
    keywords: ["reservation", "book a table", "table booking", "reserve"],
    reply: "To reserve a table, click 'Reserve a table' in the menu or on the homepage. Fill in your name, phone, date, time, and party size — you'll get an instant confirmation on screen.",
  },
  {
    keywords: ["payment", "card declined", "stripe", "refund", "charged twice", "checkout"],
    reply: "For payment issues at checkout: confirm your card details are correct and try again. If you were charged but didn't get an order confirmation, please contact us via the Contact page with your payment reference.",
  },
  {
    keywords: ["menu", "dish", "spicy", "vegetarian", "veg", "price", "discount"],
    reply: "You can browse the full menu, filter by category, and search dishes by name on the Menu section. Veg items show a green badge, spicy dishes show a flame icon, and discounted items show the offer badge automatically.",
  },
  {
    keywords: ["cart", "add to cart", "remove item", "cart empty"],
    reply: "Tap 'Add' on any dish in the Menu to add it to your cart — you'll see it fly into the cart icon. Open the cart from the navbar to change quantities or remove items before checkout.",
  },
];

const FALLBACK_REPLY =
  "I can only help with things related to Al Madina Restaurant's website — like registration, login, orders, reservations, payments, or the menu. For anything else, I'm not the right place to ask!";

const GREETING =
  "Assalam-o-Alaikum! I'm the Al Madina help assistant. Ask me about registration, login issues, orders, reservations, payments, or the menu.";

function matchIntent(message) {
  const lower = message.toLowerCase();
  const hit = INTENTS.find((intent) => intent.keywords.some((k) => lower.includes(k)));
  return hit ? hit.reply : FALLBACK_REPLY;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    const botMsg = { from: "bot", text: matchIntent(text) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <style>{`
        .am-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(212,175,55,0.4);
          z-index: 9998;
          transition: transform 0.25s ease;
        }
        .am-chat-fab:hover { transform: scale(1.08); }
        .am-chat-window {
          position: fixed;
          bottom: 92px;
          right: 24px;
          width: 340px;
          max-width: calc(100vw - 32px);
          height: 460px;
          background: #0F0F0F;
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: am-chat-in 0.25s ease;
        }
        @keyframes am-chat-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .am-chat-header {
          background: linear-gradient(115deg, #0A0A0A 0%, #181818 100%);
          padding: 14px 16px;
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
          gap: 10px;
        }
        .am-bubble {
          max-width: 80%;
          padding: 9px 13px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.45;
        }
        .am-bubble.bot {
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.25);
          color: #FFFFFF;
          align-self: flex-start;
          border-bottom-left-radius: 3px;
        }
        .am-bubble.user {
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          align-self: flex-end;
          border-bottom-right-radius: 3px;
          font-weight: 500;
        }
        .am-chat-input-row {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .am-chat-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.3);
          color: #FFFFFF;
          font-size: 13px;
          padding: 9px 12px;
          border-radius: 8px;
          outline: none;
        }
        .am-chat-input::placeholder { color: rgba(255,255,255,0.4); }
        .am-chat-send {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: linear-gradient(135deg, #D4AF37, #F0DFA0);
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      {!open && (
        <button className="am-chat-fab" onClick={() => setOpen(true)} aria-label="Open help chat">
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="am-chat-window">
          <div className="am-chat-header">
            <div className="flex items-center gap-2">
              <Bot size={18} style={{ color: "#D4AF37" }} />
              <span className="text-white text-sm font-medium">Al Madina Help</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" style={{ color: "rgba(255,255,255,0.6)" }}>
              <X size={18} />
            </button>
          </div>

          <div className="am-chat-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`am-bubble ${m.from}`}>{m.text}</div>
            ))}
          </div>

          <form onSubmit={handleSend} className="am-chat-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, login, menu..."
              className="am-chat-input"
            />
            <button type="submit" className="am-chat-send" aria-label="Send">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}