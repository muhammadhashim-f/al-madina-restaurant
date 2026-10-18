// ============================================================
// AL MADINA RESTAURANT — Intelligent Chatbot Engine
// Centralizes NLP, menu search, multi-item ordering, bill calculation,
// favorites, reservations, reviews, order status, and context memory.
// ============================================================

import { MENU_ITEMS, RESTAURANT_METADATA, CATEGORIES } from "../data/menuData";

// Normalizes input for typos and Roman Urdu transliterations
export function normalizeInput(raw) {
  let s = (raw || "").toLowerCase().trim();

  // Typo fixes for Mutton (handles "Button", "buttn", "muton", "matan", "bakra", "gosht", etc.)
  s = s.replace(/\b(button|buttn|butten|muton|matan|muttn|maton|batan|bton|bakra|bakray|gosht|bakray ka gosht)\b/g, "mutton");
  s = s.replace(/\b(bryani|baryani|beryani|biriyani|chawal|biryani chawal)\b/g, "biryani");
  s = s.replace(/\b(krhai|krahi|karhi|kadai|kadhai|salan|handi)\b/g, "karahi");
  s = s.replace(/\b(kebabz|kabab|kabaabs|tikka|kababs|kebabs|seekh)\b/g, "kebab");
  s = s.replace(/\b(samosay|samose|smosa|samosas|somosa)\b/g, "samosa");
  s = s.replace(/\b(daal|makhni|dall|dal)\b/g, "makhani");
  s = s.replace(/\b(mitha|metha|gulabjaman|jalebi|meetha|mithai|sweet|dessert|desserts)\b/g, "gulab jamun");
  s = s.replace(/\b(kashmiri chai|pink tea|chai|tea|qehwa|kehwa|sabz chai)\b/g, "chai");
  s = s.replace(/\b(limon|limu|nimbu|lime soda|lemonade|soda|cold drink|sharbat)\b/g, "fresh lime soda");
  s = s.replace(/\b(whatapp|whatsap|whtsapp|watsapp|wa)\b/g, "whatsapp");
  s = s.replace(/\b(adrs|adrees|adress|locashun|loction|kahan hai|kidhar hai|pata|address)\b/g, "location");
  s = s.replace(/\b(timings|timing|time|waqt|kab khulta hai|kab band hota hai|hours|opening)\b/g, "timings");
  s = s.replace(/\b(bil|total|hisab|calculate|kitna bana|kitnay banay|kitna bill|grand total)\b/g, "bill");
  s = s.replace(/\b(keemat|qemat|qimat|kimat|price|rates|daam|cost|kitne ka|kitne ki|kitne paise)\b/g, "price");
  s = s.replace(/\b(ordr|ordar|bok|mangwana|order place|order confirm)\b/g, "order");
  s = s.replace(/\b(pasand|favourite|favorite|fav|favourate|like)\b/g, "favorites");
  s = s.replace(/\b(table|maiz|mez|baithna|seat|family hall|seating|dine in|booking|reservation)\b/g, "table");
  s = s.replace(/\b(halal|halaal|saaf|hygiene|clean|preservative)\b/g, "halal");
  s = s.replace(/\b(rider|tracking|bike|kahan pohncha|kahan pohancha|live location|dispatch)\b/g, "tracking");

  return s;
}

// Word-to-number dictionary
export const WORD_TO_NUM = {
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
export const DISH_KEYWORDS = [
  { id: 101, keywords: ["shahi dawat platter", "vip platter", "dawat platter", "family platter", "combo platter", "sultan e karachi", "platter", "shahi platter"] },
  { id: 102, keywords: ["royal handi feast", "handi mutton feast", "mutton feast", "handi feast", "mitti di handi mutton feast", "royal handi", "handi mutton"] },
  { id: 103, keywords: ["malai boti", "shahi malai boti", "boti", "charcoal boti", "chicken boti"] },
  { id: 1, keywords: ["seekh kebab", "chicken seekh kebab", "seekh kabab", "kebab", "kabab"] },
  { id: 2, keywords: ["vegetable samosa", "samosa", "samose", "samosay", "veg samosa", "khasta samosa"] },
  { id: 3, keywords: ["mutton karahi", "karahi", "mutton handi", "desi mitti handi mutton", "mutton"] },
  { id: 4, keywords: ["chicken biryani", "biryani", "dum pukht biryani", "rice", "biryani rice"] },
  { id: 5, keywords: ["dal makhani", "daal makhani", "dal", "makhani", "daal"] },
  { id: 6, keywords: ["gulab jamun", "meetha", "mithai", "dessert", "jamun", "gulab"] },
  { id: 7, keywords: ["kashmiri chai", "pink tea", "chai", "qehwa", "tea", "sabz chai"] },
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

// Find dishes by category or dietary filter
export function filterDishesByCategory(cat) {
  const c = (cat || "").toLowerCase();
  if (c.includes("vip")) {
    return MENU_ITEMS.filter((m) => m.isVIP || m.category.includes("VIP"));
  }
  if (c.includes("starter")) {
    return MENU_ITEMS.filter((m) => m.category === "Starters");
  }
  if (c.includes("main")) {
    return MENU_ITEMS.filter((m) => m.category === "Mains");
  }
  if (c.includes("dessert") || c.includes("meetha")) {
    return MENU_ITEMS.filter((m) => m.category === "Desserts");
  }
  if (c.includes("drink") || c.includes("chai") || c.includes("beverage")) {
    return MENU_ITEMS.filter((m) => m.category === "Drinks");
  }
  return MENU_ITEMS;
}

export function filterDishesByDiet(dietType) {
  const d = (dietType || "").toLowerCase();
  if (d === "veg" || d === "vegetarian" || d === "sabzi") {
    return MENU_ITEMS.filter((m) => m.isVeg);
  }
  if (d === "non-veg" || d === "gosht" || d === "meat") {
    return MENU_ITEMS.filter((m) => !m.isVeg);
  }
  if (d === "spicy" || d === "masaledar" || d === "chattpata") {
    return MENU_ITEMS.filter((m) => m.spicy);
  }
  if (d === "mild" || d === "non-spicy" || d === "saada") {
    return MENU_ITEMS.filter((m) => !m.spicy);
  }
  if (d === "mutton" || d === "bakra") {
    return MENU_ITEMS.filter((m) => m.name.toLowerCase().includes("mutton"));
  }
  if (d === "chicken") {
    return MENU_ITEMS.filter((m) => m.name.toLowerCase().includes("chicken") || m.name.toLowerCase().includes("boti"));
  }
  return MENU_ITEMS;
}

// Parse multi-item order requests like:
// "Mujhe 2 Chicken Biryani aur 3 Kashmiri Chai order karni hain"
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
            const qtyRegex = new RegExp(`(\\d+|ek|aik|do|teen|chaar|char|paanch|panch|chhe|che)\\s*(?:x|plate|plates|kg|handi|cup|glass)?\\s*${kw}`);
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

// Date parser for table reservations ("aaj", "today", "kal", "tomorrow", "parso")
export function parseReservationDate(text) {
  const s = (text || "").toLowerCase();
  const now = new Date();

  if (s.includes("aaj") || s.includes("today")) {
    return now.toISOString().slice(0, 10);
  }
  if (s.includes("kal") || s.includes("tomorrow")) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().slice(0, 10);
  }
  if (s.includes("parso") || s.includes("day after tomorrow")) {
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return dayAfter.toISOString().slice(0, 10);
  }

  // Look for YYYY-MM-DD or DD-MM-YYYY
  const dateMatch = s.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (dateMatch) return dateMatch[1];

  // Default to tomorrow
  const def = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return def.toISOString().slice(0, 10);
}
