// ============================================================
// AL MADINA RESTAURANT — Intelligent Chatbot Engine
// Centralizes NLP, menu search, multi-item ordering, bill calculation,
// favorites, reservations, reviews, order status, and context memory.
// ============================================================

import { MENU_ITEMS, RESTAURANT_METADATA } from "../data/menuData";

// Normalizes input for typos and Roman Urdu transliterations
export function normalizeInput(raw) {
  let s = (raw || "").toLowerCase().trim();
  // Typo fixes for Mutton (handles "Button", "buttn", "muton", "matan", etc.)
  s = s.replace(/\b(button|buttn|butten|muton|matan|muttn|maton|batan|bton|bakra|bakray|gosht)\b/g, "mutton");
  s = s.replace(/bryani|baryani|beryani|biriyani/g, "biryani");
  s = s.replace(/krhai|krahi|karhi|kadai|kadhai/g, "karahi");
  s = s.replace(/kebabz|kabab|kabaabs|tikka|kababs|kebabs/g, "kebab");
  s = s.replace(/samosay|samose|smosa|samosas/g, "samosa");
  s = s.replace(/daal|makhni|dall/g, "makhani");
  s = s.replace(/mitha|metha|gulabjaman|jalebi/g, "gulab jamun");
  s = s.replace(/kashmiri chai|pink tea|chai/g, "chai");
  s = s.replace(/limon|limu|nimbu|lime soda/g, "fresh lime soda");
  s = s.replace(/whatapp|whatsap|whtsapp|watsapp/g, "whatsapp");
  s = s.replace(/adrs|adrees|adress|locashun|loction/g, "location");
  s = s.replace(/\b(bil|total|hisab|calculate)\b/g, "bill");
  s = s.replace(/\b(keemat|qemat|qimat|kimat|price|rates|daam|cost)\b/g, "price");
  s = s.replace(/\b(ordr|ordar|bok)\b/g, "order");
  s = s.replace(/\b(pasand|favourite|favorite|fav)\b/g, "favorites");
  s = s.replace(/\b(table|maiz|mez|baithna|seat)\b/g, "table");
  return s;
}

// Word-to-number dictionary
const WORD_TO_NUM = {
  ek: 1, aik: 1, one: 1, a: 1, an: 1,
  do: 2, two: 2,
  teen: 3, three: 3,
  chaar: 4, char: 4, four: 4,
  paanch: 5, panch: 5, five: 5,
  chhe: 6, che: 6, six: 6,
  saat: 7, seven: 7,
  aath: 8, eight: 8,
  nau: 9, nine: 9,
  das: 10, ten: 10,
};

// Item keyword mappings pointing to exact MENU_ITEMS ID
const DISH_KEYWORDS = [
  { id: 101, keywords: ["shahi dawat platter", "vip platter", "dawat platter", "family platter", "combo platter", "sultan e karachi", "platter"] },
  { id: 102, keywords: ["royal handi feast", "handi mutton feast", "mutton feast", "handi feast", "mitti di handi mutton feast"] },
  { id: 103, keywords: ["malai boti", "shahi malai boti", "boti", "charcoal boti"] },
  { id: 1, keywords: ["seekh kebab", "chicken seekh kebab", "seekh kabab", "kebab", "kabab"] },
  { id: 2, keywords: ["vegetable samosa", "samosa", "samose", "samosay", "veg samosa"] },
  { id: 3, keywords: ["mutton karahi", "karahi", "mutton handi", "desi mitti handi mutton"] },
  { id: 4, keywords: ["chicken biryani", "biryani", "chawal", "dum pukht biryani", "rice"] },
  { id: 5, keywords: ["dal makhani", "daal makhani", "dal", "makhani", "daal"] },
  { id: 6, keywords: ["gulab jamun", "meetha", "mithai", "dessert", "jamun"] },
  { id: 7, keywords: ["kashmiri chai", "pink tea", "chai", "qehwa", "tea"] },
  { id: 8, keywords: ["fresh lime soda", "lime soda", "soda", "fresh lime", "lemonade"] },
];

export function findDishByQuery(str) {
  const norm = normalizeInput(str);
  for (const dk of DISH_KEYWORDS) {
    for (const kw of dk.keywords) {
      if (norm.includes(kw)) {
        return MENU_ITEMS.find((m) => m.id === dk.id) || null;
      }
    }
  }
  return null;
}

// Parse multi-item order requests like:
// "Mujhe 2 Zinger Burgers aur 3 cold drinks order karni hain"
// "ek mutton aur ek seekh kabab aur ek samosa add to cart kr do"
export function parseMultiItemOrder(text) {
  const clean = normalizeInput(text);
  const matched = [];

  // Split clauses by 'aur', 'and', 'with', commas, plus
  const parts = clean.split(/,|\baur\b|\band\b|\bwith\b|\+/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check quantity
    let quantity = 1;
    const numMatch = trimmed.match(/\b(\d+)\b/);
    if (numMatch) {
      quantity = parseInt(numMatch[1], 10);
    } else {
      for (const [w, n] of Object.entries(WORD_TO_NUM)) {
        const regex = new RegExp(`\\b${w}\\b`, "i");
        if (regex.test(trimmed)) {
          quantity = n;
          break;
        }
      }
    }

    // Match dish
    for (const dk of DISH_KEYWORDS) {
      for (const kw of dk.keywords) {
        if (trimmed.includes(kw)) {
          const item = MENU_ITEMS.find((m) => m.id === dk.id);
          if (item) {
            const existing = matched.find((m) => m.item.id === item.id);
            if (existing) existing.quantity += Math.max(1, quantity);
            else matched.push({ item, quantity: Math.max(1, quantity) });
          }
          break;
        }
      }
    }
  }

  // Fallback single-line scan if splitting didn't catch all
  if (matched.length === 0) {
    for (const dk of DISH_KEYWORDS) {
      for (const kw of dk.keywords) {
        if (clean.includes(kw)) {
          const item = MENU_ITEMS.find((m) => m.id === dk.id);
          if (item) {
            // Check if quantity precedes keyword
            const qtyRegex = new RegExp(`(\\d+|ek|aik|do|teen|chaar|char|paanch|panch|chhe|che)\\s*(?:x|plate|plates|kg|handi)?\\s*${kw}`);
            const qm = clean.match(qtyRegex);
            let q = 1;
            if (qm) {
              const val = qm[1];
              q = parseInt(val, 10) || WORD_TO_NUM[val] || 1;
            }
            const existing = matched.find((m) => m.item.id === item.id);
            if (existing) existing.quantity += Math.max(1, q);
            else matched.push({ item, quantity: Math.max(1, q) });
          }
          break;
        }
      }
    }
  }

  return matched;
}

// Calculate precise bill from given items
export function calculateBill(items) {
  const lineItems = items.map((it) => ({
    id: it.id,
    name: it.name,
    price: it.price,
    quantity: it.quantity || 1,
    lineTotal: it.price * (it.quantity || 1),
    image: it.image,
  }));
  const subtotal = lineItems.reduce((sum, it) => sum + it.lineTotal, 0);
  const deliveryFee = subtotal > 0 ? RESTAURANT_METADATA.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  return {
    items: lineItems,
    subtotal,
    deliveryFee,
    grandTotal,
    currency: RESTAURANT_METADATA.currency,
  };
}
