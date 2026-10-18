// ============================================================
// AL MADINA RESTAURANT — Intelligent Chatbot Engine
// Centralizes NLP, menu search, multi-item ordering, bill calculation,
// favorites, reservations, reviews, order status, and context memory.
// ============================================================

import { MENU_ITEMS, RESTAURANT_METADATA } from "../data/menuData";

// Normalizes input for typos and Roman Urdu transliterations
export function normalizeInput(raw) {
  let s = (raw || "").toLowerCase().trim();

  // 1. Separate numbers attached to 'x' or letters:
  // "10xKashmiri" -> "10 kashmiri"
  // "20xsamosa" -> "20 samosa"
  // "4xGulab" -> "4 gulab"
  s = s.replace(/(\d+)\s*[xX]\s*/g, "$1 ");
  s = s.replace(/(\d+)([a-zA-Z])/g, "$1 $2");
  s = s.replace(/([a-zA-Z])(\d+)/g, "$1 $2");

  // 2. Normalization of Urdu/Roman Urdu words and typos:
  s = s.replace(/\b(button|buttn|butten|muton|matan|muttn|maton|batan|bton)\b/g, "mutton");
  s = s.replace(/\b(bakray|bakre)\b/g, "bakra");
  s = s.replace(/\b(bryani|baryani|beryani|biriyani|biryanis)\b/g, "biryani");
  s = s.replace(/\b(krhai|krahi|karhi|kadai|kadhai)\b/g, "karahi");
  s = s.replace(/\b(kebabz|kabab|kabaabs|tikka|kababs|kebabs)\b/g, "kebab");
  s = s.replace(/\b(samosay|samose|smosa|samosas)\b/g, "samosa");
  s = s.replace(/\b(daal|makhni|dall)\b/g, "makhani");
  s = s.replace(/\b(mitha|metha|gulabjaman|jalebi)\b/g, "gulab jamun");
  s = s.replace(/\b(whatapp|whatsap|whtsapp|watsapp)\b/g, "whatsapp");
  s = s.replace(/\b(adrs|adrees|adress|locashun|loction)\b/g, "location");
  s = s.replace(/\b(bil|hisab|calculate)\b/g, "bill");
  s = s.replace(/\b(keemat|qemat|qimat|kimat|rates|daam|cost)\b/g, "price");
  s = s.replace(/\b(ordr|ordar|bok|parsal|parcel)\b/g, "order");
  s = s.replace(/\b(pasand|favourite|fevrite|fevorite|fav)\b/g, "favorite");
  s = s.replace(/\b(tabel|tablee|maiz|mez|baithna)\b/g, "table");
  s = s.replace(/\b(carts|cartss)\b/g, "cart");
  s = s.replace(/\b(addd|adddd)\b/g, "add");
  s = s.replace(/\b(leemo|limu|limo|limon|nimbu)\b/g, "lime");

  return s;
}

// Word-to-number dictionary
export const WORD_TO_NUM = {
  ek: 1, aik: 1, one: 1, a: 1, an: 1,
  do: 2, doh: 2, two: 2,
  teen: 3, tin: 3, three: 3,
  chaar: 4, char: 4, four: 4,
  paanch: 5, panch: 5, five: 5,
  chhe: 6, che: 6, six: 6,
  saat: 7, seven: 7,
  aath: 8, ath: 8, eight: 8,
  nau: 9, no: 9, nine: 9,
  das: 10, ten: 10,
  gyarah: 11, eleven: 11,
  barah: 12, twelve: 12,
  terah: 13, thirteen: 13,
  chaudah: 14, fourteen: 14,
  pandrah: 15, fifteen: 15,
  solah: 16, sixteen: 16,
  satrah: 17, seventeen: 17,
  atharah: 18, eighteen: 18,
  unnees: 19, nineteen: 19,
  bees: 20, twenty: 20,
  tees: 30, thirty: 30,
  chaalis: 40, forty: 40,
  pachaas: 50, fifty: 50,
};

// Item keyword mappings pointing to exact MENU_ITEMS ID
export const DISH_KEYWORDS = [
  {
    id: 101,
    name: "VIP Shahi Dawat Platter",
    keywords: [
      "vip shahi dawat platter",
      "shahi dawat platter",
      "dawat platter",
      "vip platter",
      "family platter",
      "platter deal",
      "sultan e karachi",
      "platter",
    ],
  },
  {
    id: 102,
    name: "VIP Royal Handi Mutton Feast",
    keywords: [
      "vip royal handi mutton feast",
      "royal handi mutton feast",
      "handi mutton feast",
      "mutton feast",
      "mutton deal",
    ],
  },
  {
    id: 103,
    name: "Shahi Malai Boti (Charcoal)",
    keywords: [
      "shahi malai boti",
      "malai boti",
      "charcoal boti",
      "malai tikka",
      "boti",
    ],
  },
  {
    id: 1,
    name: "Chicken Seekh Kebab",
    keywords: [
      "chicken seekh kebab",
      "chicken seekh kabab",
      "seekh kebab",
      "seekh kabab",
      "seekh",
      "kebab",
      "kabab",
      "bbq",
    ],
  },
  {
    id: 2,
    name: "Vegetable Samosa",
    keywords: [
      "vegetable samosa",
      "veg samosa",
      "samosay",
      "samose",
      "samosa",
      "smosa",
    ],
  },
  {
    id: 3,
    name: "Mutton Karahi",
    keywords: [
      "mutton karahi",
      "mutton handi",
      "karahi",
      "mutton",
      "handi",
      "bakra karahi",
      "bakra",
      "gosht",
    ],
  },
  {
    id: 4,
    name: "Chicken Biryani",
    keywords: [
      "dum pukht chicken biryani",
      "chicken biryani",
      "dum pukht biryani",
      "biryani",
      "bryani",
      "baryani",
      "chawal",
      "rice",
    ],
  },
  {
    id: 5,
    name: "Dal Makhani",
    keywords: [
      "daal makhani",
      "dal makhani",
      "makhani",
      "daal",
      "dal",
    ],
  },
  {
    id: 6,
    name: "Gulab Jamun",
    keywords: [
      "shahi gulab jamun",
      "gulab jamun",
      "gulab jamuns",
      "gulab",
      "meetha",
      "mithai",
      "dessert",
      "jamun",
    ],
  },
  {
    id: 7,
    name: "Kashmiri Chai",
    keywords: [
      "kashmiri chai",
      "kashmiri pink chai",
      "pink chai",
      "pink tea",
      "kashmiri tea",
      "qehwa",
      "chai",
      "tea",
    ],
  },
  {
    id: 8,
    name: "Fresh Lime Soda",
    keywords: [
      "fresh lime soda",
      "lime soda",
      "fresh lime",
      "leemo soda",
      "limon soda",
      "soda",
      "lime",
      "lemonade",
    ],
  },
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

// Extracts quantity from text preceding or following a dish
function parseQuantityFromContext(textBefore, textAfter) {
  // Check text before dish first (e.g. "10 ", "aur 10 ", "ek ", "do ")
  if (textBefore) {
    const tokens = textBefore.trim().split(/\s*(?:aur|and|,|\+)\s*/).filter(Boolean);
    const sub = (tokens[tokens.length - 1] || textBefore).trim();

    // Check digit matches
    const numMatches = [...sub.matchAll(/\b(\d+)\b/g)];
    if (numMatches.length > 0) {
      return parseInt(numMatches[numMatches.length - 1][1], 10);
    }

    // Check word matches
    const words = sub.split(/\s+/);
    for (let i = words.length - 1; i >= 0; i--) {
      const w = words[i].toLowerCase();
      if (WORD_TO_NUM[w]) return WORD_TO_NUM[w];
    }
  }

  // If no number before, check text immediately after dish (e.g. "samosa 20 plate", "biryani 2")
  if (textAfter) {
    const sub = textAfter.trim().slice(0, 20);
    const numMatch = sub.match(/^\s*(\d+)/);
    if (numMatch) {
      return parseInt(numMatch[1], 10);
    }
    const words = sub.split(/\s+/);
    if (words[0] && WORD_TO_NUM[words[0].toLowerCase()]) {
      return WORD_TO_NUM[words[0].toLowerCase()];
    }
  }

  return 1;
}

// Parse multi-item order requests with 100% precision
// Handles: "10xKashmiri Chai aur 10xFresh Lime Soda aur 1xChicken Biryani aur 20xsamosa aur 4xGulab Jamun order kro"
// Handles: "bhai ek samosa aur ek mutton order kro"
export function parseMultiItemOrder(text) {
  const clean = normalizeInput(text);
  const found = [];

  // Find occurrences of each dish keyword
  const occurrences = [];
  DISH_KEYWORDS.forEach((dk) => {
    for (const kw of dk.keywords) {
      let startPos = 0;
      while (startPos < clean.length) {
        const idx = clean.indexOf(kw, startPos);
        if (idx === -1) break;

        // Check word boundaries for short keywords
        const isWordBoundaryBefore = idx === 0 || /[\s,.\-+]/.test(clean[idx - 1]);
        const isWordBoundaryAfter = idx + kw.length >= clean.length || /[\s,.\-+]/.test(clean[idx + kw.length]);

        if (isWordBoundaryBefore && isWordBoundaryAfter) {
          occurrences.push({
            dishId: dk.id,
            keyword: kw,
            index: idx,
            endIndex: idx + kw.length,
          });
          break; // Avoid duplicate matches of other keywords for same dish at same spot
        }
        startPos = idx + 1;
      }
    }
  });

  // Sort occurrences by index in text; if same index, longer keyword first
  occurrences.sort((a, b) => a.index - b.index || b.keyword.length - a.keyword.length);

  // Filter overlapping occurrences (prefer longer keyword, e.g. "mutton karahi" over "mutton")
  const nonOverlapping = [];
  occurrences.forEach((occ) => {
    const overlaps = nonOverlapping.some(
      (n) => Math.max(occ.index, n.index) < Math.min(occ.endIndex, n.endIndex)
    );
    if (!overlaps) {
      nonOverlapping.push(occ);
    }
  });

  // Extract quantity for each dish
  for (let i = 0; i < nonOverlapping.length; i++) {
    const curr = nonOverlapping[i];
    const prev = i > 0 ? nonOverlapping[i - 1] : null;
    const next = i < nonOverlapping.length - 1 ? nonOverlapping[i + 1] : null;

    const startBoundary = prev ? prev.endIndex : 0;
    const endBoundary = next ? next.index : clean.length;

    const textBefore = clean.slice(startBoundary, curr.index);
    const textAfter = clean.slice(curr.endIndex, endBoundary);

    const qty = parseQuantityFromContext(textBefore, textAfter);
    const item = MENU_ITEMS.find((m) => m.id === curr.dishId);

    if (item) {
      const existing = found.find((f) => f.item.id === item.id);
      if (existing) {
        existing.quantity += Math.max(1, qty);
      } else {
        found.push({
          item,
          quantity: Math.max(1, qty),
        });
      }
    }
  }

  return found;
}

// Calculate precise bill from given items
export function calculateBill(items) {
  const lineItems = items.map((it) => ({
    id: it.id,
    name: it.name,
    price: it.price,
    quantity: Math.max(1, Number(it.quantity) || 1),
    lineTotal: (it.price || 0) * Math.max(1, Number(it.quantity) || 1),
    image: it.image || "",
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

// ============================================================
// Authoritative Restaurant Knowledge & Q&A Engine
// Handles General Restaurant, Menu Search, Recommendations, Budgets, Operations
// ============================================================
export function handleRestaurantQuestions(clean, raw) {
  // 1. Cheapest items
  if (
    clean.includes("cheapest") ||
    clean.includes("cheap") ||
    clean.includes("sasta") ||
    clean.includes("sasti") ||
    clean.includes("kam qeemat") ||
    clean.includes("lowest price")
  ) {
    return {
      text: `👑 **Al Madina Restaurant ke Sab Se Saste & Lazeez Items:**\n\n1. 🥤 Fresh Lime Soda — Rs 180 (1 Glass Chilled)\n2. ☕ Kashmiri Chai — Rs 200 (1 Cup Gulabi Qehwa)\n3. 🥟 Vegetable Samosa — Rs 250 (2 Pcs Plate Imlee Chutney ke sath)\n4. 🍯 Shahi Gulab Jamun — Rs 300 (2 Pcs Plate Warm)\n5. 🍲 Dal Makhani — Rs 600 (2 Persons Handi)\n\nKiya aap inmein se koi item dastarkhwan cart mein shamil karna chahenge?`,
      product: MENU_ITEMS.find((m) => m.id === 8),
      suggestedQuestions: [
        "2 Vegetable Samosa cart mein add karo",
        "2 Kashmiri Chai add karo",
        "Menu dikhao",
      ],
    };
  }

  // 2. Most expensive items
  if (
    clean.includes("most expensive") ||
    clean.includes("expensive") ||
    clean.includes("mehnga") ||
    clean.includes("mehngi") ||
    clean.includes("highest price")
  ) {
    return {
      text: `👑 **Al Madina Restaurant ke Shahi & VIP Grand Feasts:**\n\n1. 👑 VIP Shahi Dawat Platter — Rs 2,400 (Saffron Biryani, 4x Seekh Kebabs, Malai Boti, 2 Rogheni Naan, Gulab Jamun — 3-4 Persons)\n2. 👑 VIP Royal Handi Mutton Feast — Rs 2,200 (Desi Ghee Mutton Handi, 4 Rogheni Naan, 2 Kashmiri Chai — 2-3 Persons)\n3. 🍖 Mutton Karahi (1 KG Handi) — Rs 1,450 (Pure Desi Ghee & Fresh Bakra)\n4. 🍛 Dum Pukht Chicken Biryani — Rs 850\n\nKiya aap kisi shahi dawat ke liye inmein se koi deal book karna chahte hain?`,
      product: MENU_ITEMS.find((m) => m.id === 101),
      suggestedQuestions: [
        "VIP Shahi Dawat Platter cart mein add karo",
        "VIP Royal Handi Mutton Feast add karo",
        "Mutton Karahi ka rate?",
      ],
    };
  }

  // 3. Budget inquiries: Rs 500
  if (
    clean.includes("500") ||
    (clean.includes("five hundred") && clean.includes("budget"))
  ) {
    return {
      text: `👑 **Rs 500 ke Budget Mein Behtareen Royal Choices:**\n\n• Option 1: 1x Vegetable Samosa (Rs 250) + 1x Kashmiri Chai (Rs 200) = Rs 450 (Rs 50 bachat!)\n• Option 2: 1x Gulab Jamun (Rs 300) + 1x Fresh Lime Soda (Rs 180) = Rs 480\n• Option 3: 2x Kashmiri Chai (Rs 400)\n• Option 4: 2x Fresh Lime Soda (Rs 360)\n\nKiya aap Option 1 ya 2 cart mein add karna chahenge?`,
      product: MENU_ITEMS.find((m) => m.id === 2),
      suggestedQuestions: [
        "1 Samosa aur 1 Kashmiri Chai cart mein dalo",
        "1 Gulab Jamun aur 1 Lime Soda dalo",
        "Rs 1000 mein kya milega?",
      ],
    };
  }

  // 4. Budget inquiries: Rs 1,000
  if (
    clean.includes("1000") ||
    clean.includes("1,000") ||
    clean.includes("hazar") ||
    clean.includes("one thousand")
  ) {
    return {
      text: `👑 **Rs 1,000 ke Budget Mein Superhit Royal Meals:**\n\n• Option 1 (Biryani Special): 1x Dum Pukht Chicken Biryani (Rs 850) + 1x Fresh Lime Soda (Rs 180) = Rs 1,030\n• Option 2 (BBQ Feast): 1x Chicken Seekh Kebab 4 Pcs (Rs 650) + 1x Shahi Gulab Jamun (Rs 300) = Rs 950\n• Option 3 (Malai Boti Treat): 1x Shahi Malai Boti (Rs 780) + 1x Kashmiri Chai (Rs 200) = Rs 980\n• Option 4 (Desi Veg Special): 1x Dal Makhani (Rs 600) + 1x Vegetable Samosa (Rs 250) = Rs 850\n\nBataiye konsa option aapke dastarkhwan par sajaya jaye?`,
      product: MENU_ITEMS.find((m) => m.id === 4),
      suggestedQuestions: [
        "1 Biryani aur 1 Lime Soda add karo",
        "1 Seekh Kebab aur 1 Gulab Jamun add karo",
        "Mera bill calculate karo",
      ],
    };
  }

  // 5. Budget inquiries: Rs 2,000 / Meal for 4
  if (
    (clean.includes("2000") ||
      clean.includes("2,000") ||
      clean.includes("char") ||
      clean.includes("4 log") ||
      clean.includes("4 person") ||
      clean.includes("four people")) &&
    (clean.includes("meal") ||
      clean.includes("suggest") ||
      clean.includes("budget") ||
      clean.includes("khana"))
  ) {
    return {
      text: `👑 **4 Afraad ke Liye Rs 2,000 ke Budget Mein Shahi Package:**\n\n• 2x Dum Pukht Chicken Biryani (Rs 850 x 2 = Rs 1,700)\n• 1x Vegetable Samosa 2 Pcs Plate (Rs 250)\n\n🧾 Subtotal: Rs 1,950 (Aapke Rs 2,000 ke budget ke bilkul mutabiq!)\n🛵 Delivery Fee (All Karachi): Rs 150\n✨ Grand Total: Rs 2,100\n\nKiya main yeh 4 logon ka shahi meal cart mein shamil kar doon?`,
      product: MENU_ITEMS.find((m) => m.id === 4),
      suggestedQuestions: [
        "2 Biryani aur 1 Samosa cart mein add karo",
        "VIP Platter ka rate kya hai?",
        "Table reserve karein",
      ],
    };
  }

  // 6. Meal for two people (2 persons)
  if (
    (clean.includes("two people") ||
      clean.includes("2 log") ||
      clean.includes("2 person") ||
      clean.includes("do logon") ||
      clean.includes("couple")) &&
    (clean.includes("meal") ||
      clean.includes("suggest") ||
      clean.includes("recommend") ||
      clean.includes("khana"))
  ) {
    return {
      text: `👑 **2 Afraad ke Liye Hamari Behtareen Shahi Recommendations:**\n\n• Package A (Biryani & BBQ Combo):\n  - 1x Chicken Biryani (Rs 850)\n  - 1x Chicken Seekh Kebab (Rs 650)\n  - 2x Kashmiri Chai (Rs 400)\n  ✨ Kul Subtotal: Rs 1,900\n\n• Package B (Mitti Handi Mutton Dawat):\n  - 1x VIP Royal Handi Mutton Feast (Rs 2,200)\n  (Desi Ghee Mutton Handi + 4 Rogheni Naan + 2 Chilled Kashmiri Chai!)\n\nKiya aap Package A ya Package B cart mein mangwana chahte hain?`,
      product: MENU_ITEMS.find((m) => m.id === 102),
      suggestedQuestions: [
        "1 Biryani, 1 Seekh Kebab aur 2 Kashmiri Chai add karo",
        "VIP Royal Handi Mutton Feast add karo",
        "Mera bill batao",
      ],
    };
  }

  // 7. Vegetarian food
  if (
    clean.includes("vegetarian") ||
    clean.includes("veg food") ||
    clean.includes("sabzi") ||
    clean.includes("bina gosht") ||
    clean.includes("suitable for vegetarians")
  ) {
    return {
      text: `🥗 **Al Madina Restaurant ka 100% Khalis Vegetarian Menu:**\n\n1. 🍲 Dal Makhani — Rs 600 (12 ghantay pakki hui kale urad aur rajma, makhan aur malai ka shahi tadka)\n2. 🥟 Vegetable Samosa — Rs 250 (Taaza aaloo, matar aur anardana patti, 2 Pcs Plate)\n3. 🍯 Shahi Gulab Jamun — Rs 300 (Khalis khoya aur rose syrup, 2 Pcs Plate)\n4. ☕ Kashmiri Pink Chai — Rs 200 (Badam pista aur doodh wali sabz patti chai)\n5. 🥤 Fresh Lime Soda — Rs 180 (Taaza desi leemo, pudina aur sparkling soda)\n\nTamam vegetarian khane 100% alag bartano mein ehtiyat se tayyar kiye jaate hain!`,
      product: MENU_ITEMS.find((m) => m.id === 5),
      suggestedQuestions: [
        "1 Dal Makhani aur 2 Samosa cart mein add karo",
        "2 Kashmiri Chai add karo",
        "Menu dekhein",
      ],
    };
  }

  // 8. Spicy food
  if (
    clean.includes("spicy") ||
    clean.includes("mirch") ||
    clean.includes("teekha") ||
    clean.includes("chatpata")
  ) {
    return {
      text: `🌶️ **Teekha & Chatpata Khana — Al Madina Spicy Specials:**\n\n1. 🍖 Mutton Karahi (Rs 1,450) — High flame par lal tamatar, hari mirch, roasted zeera aur kali mirch ka karak desi ghee tadka! (Boht teekhi & flavorful)\n2. 🍛 Dum Pukht Chicken Biryani (Rs 850) — Dum-cooked teekhay biryani masalay, aaloo-bukhara aur taaza chicken.\n3. 🍢 Chicken Seekh Kebab (Rs 650) — 16 shahi khushbudar masalon se koyla-dam char-grill (4 Pcs).\n\nKiya aap inmein se koi spicy dish cart mein add karna chahenge?`,
      product: MENU_ITEMS.find((m) => m.id === 3),
      suggestedQuestions: [
        "1 Mutton Karahi cart mein add karo",
        "2 Chicken Biryani add karo",
        "Kashmiri Chai bhi add karo",
      ],
    };
  }

  // 9. Chicken dishes
  if (
    clean.includes("chicken dishes") ||
    clean.includes("all chicken") ||
    clean.includes("chicken menu") ||
    (clean.includes("chicken") &&
      (clean.includes("kya hai") ||
        clean.includes("konsi") ||
        clean.includes("show") ||
        clean.includes("dikhao")))
  ) {
    return {
      text: `🍗 **Al Madina Shahi Chicken Dishes:**\n\n1. 🍛 Dum Pukht Chicken Biryani — Rs 850 (Crown Jewel, Sela Basmati Rice & Desi Chicken)\n2. 🍢 Chicken Seekh Kebab — Rs 650 (Charcoal Grilled 4 Pcs)\n3. 🍗 Shahi Malai Boti (Charcoal) — Rs 780 (Creamy cashew melt-in-mouth boneless boti)\n4. 👑 VIP Shahi Dawat Platter — Rs 2,400 (Biryani, 4x Seekh Kebabs, Malai Boti, Rogheni Naans & Desserts)\n\nBataiye inmein se konsi chicken dish order karni hai?`,
      product: MENU_ITEMS.find((m) => m.id === 4),
      suggestedQuestions: [
        "1 Chicken Biryani cart mein add karo",
        "1 Shahi Malai Boti add karo",
        "Mera bill batao",
      ],
    };
  }

  // 10. Beef Inquiry
  if (
    clean.includes("beef") ||
    clean.includes("bada gosht") ||
    clean.includes("bade ka gosht") ||
    clean.includes("cow")
  ) {
    return {
      text: `Al Madina Restaurant mein hum sirf Taaza Desi Mutton (bakray ka gosht) aur A-Grade Chicken serve karte hain, beef hamare menu par dastiyab nahi hai. 🍖\n\nAap hamari mashhoor Mutton Karahi (Rs 1,450) ya VIP Handi Mutton Feast (Rs 2,200) zaroor try karein jo pure desi ghee mein mitti ki handi mein dum di jaati hai!`,
      product: MENU_ITEMS.find((m) => m.id === 3),
      suggestedQuestions: [
        "1 Mutton Karahi cart mein add karo",
        "VIP Royal Handi Mutton Feast add karo",
        "Menu dikhao",
      ],
    };
  }

  // 11. Burgers / Pizza / Fast food
  if (
    clean.includes("burger") ||
    clean.includes("pizza") ||
    clean.includes("fast food") ||
    clean.includes("sandwich") ||
    clean.includes("zinger")
  ) {
    return {
      text: `Al Madina Restaurant khalis Royal Pakistani Desi Cuisines ka markaz hai (Mutton Karahi, Dum Pukht Biryani, Mitti Handi aur Char-grilled BBQ). Hum fast-food burger ya pizza serve nahi karte. 👑\n\nLekin hamare Starters jese Chicken Seekh Kebab (Rs 650), Shahi Malai Boti (Rs 780), aur Vegetable Samosa (Rs 250) fast food se kahin zyada lazeez aur sehat bakhsh hain! Kiya main inmein se koi item cart mein add karoon?`,
      product: MENU_ITEMS.find((m) => m.id === 1),
      suggestedQuestions: [
        "1 Chicken Seekh Kebab add karo",
        "1 Shahi Malai Boti add karo",
        "Menu dikhao",
      ],
    };
  }

  // 12. Drinks & Beverages
  if (
    clean.includes("drink") ||
    clean.includes("beverage") ||
    clean.includes("peene") ||
    clean.includes("sharbath") ||
    clean.includes("cold drink")
  ) {
    return {
      text: `🥤 **Al Madina Shahi Drinks Menu:**\n\n1. ☕ Kashmiri Chai — Rs 200 (Pahari sabz patti se 4 ghantay karr kar nikala gaya qudrati gulabi rang, doodh, kuta hua badam aur pista)\n2. 🥤 Fresh Lime Soda — Rs 180 (Taaza desi leemo, pudina, kala namak aur chilled sparkling soda)\n\nKiya aap dastarkhwan ke sath inmein se koi drink add karna chahte hain?`,
      product: MENU_ITEMS.find((m) => m.id === 7),
      suggestedQuestions: [
        "2 Kashmiri Chai cart mein add karo",
        "2 Fresh Lime Soda add karo",
        "Mera bill batao",
      ],
    };
  }

  // 13. Desserts
  if (
    clean.includes("dessert") ||
    clean.includes("meetha") ||
    clean.includes("mithai") ||
    clean.includes("sweets")
  ) {
    return {
      text: `🍯 **Al Madina Shahi Desserts:**\n\n👑 Shahi Gulab Jamun — Rs 300 (2 Pcs Plate)\nAsli khoya aur pisi elaichi se tayyar shuda garam naram gulab jamun, kewra aur gulab-jal se mehakti shahi sheere mein doobay hue, pista barfi garnish ke sath!\nAur meethi garam Kashmiri Chai — Rs 200!\n\nKiya aap Gulab Jamun cart mein add karna chahenge?`,
      product: MENU_ITEMS.find((m) => m.id === 6),
      suggestedQuestions: [
        "2 Gulab Jamun cart mein add karo",
        "1 Gulab Jamun aur 1 Chai add karo",
        "Menu dekhein",
      ],
    };
  }

  // 14. Family meals / Combo deals
  if (
    clean.includes("combo") ||
    clean.includes("family meal") ||
    clean.includes("family deal") ||
    (clean.includes("deal") && !clean.includes("karahi deal")) ||
    clean.includes("platter")
  ) {
    return {
      text: `👑 **Al Madina VIP Family Combos & Deals:**\n\n1. 👑 VIP Shahi Dawat Platter (Rs 2,400 — 20% OFF!):\n   Saffron Biryani, 4x Seekh Kebabs, Malai Boti, 2 Rogheni Naan, Mint Salad, Raita & 2x Gulab Jamun. Serving: 3-4 Persons.\n\n2. 👑 VIP Royal Handi Mutton Feast (Rs 2,200 — 15% OFF!):\n   Pure Desi Ghee Mutton Handi, 4 Rogheni Naan aur 2 Chilled Kashmiri Chai. Serving: 2-3 Persons.\n\nKiya aap inmein se koi Grand Deal order karna chahte hain?`,
      product: MENU_ITEMS.find((m) => m.id === 101),
      suggestedQuestions: [
        "VIP Shahi Dawat Platter cart mein add karo",
        "VIP Royal Handi Mutton Feast add karo",
        "Table book karein",
      ],
    };
  }

  // 15. Specialties & Most Popular
  if (
    clean.includes("specialt") ||
    clean.includes("popular") ||
    clean.includes("mashhoor") ||
    clean.includes("khas dish") ||
    clean.includes("best dish")
  ) {
    return {
      text: `👑 **Al Madina Restaurant ki Mashhoor-e-Zamana Specialties:**\n\n1. 🍖 Mutton Karahi (Rs 1,450) — Mitti ki handi aur pure desi ghee mein pakka bakray ka gosht.\n2. 🍛 Dum Pukht Chicken Biryani (Rs 850) — Zafrani sela basmati chawal ki shahi biryani.\n3. 🍢 Charcoal Chicken Seekh Kebab (Rs 650) — 16 masalon ke char-grilled juicy kebabs.\n4. ☕ Kashmiri Pink Chai (Rs 200) — Pista badam wali asli gulabi chai.\n\nKiya aap hamari specialty ka maza lena chahenge?`,
      product: MENU_ITEMS.find((m) => m.id === 3),
      suggestedQuestions: [
        "1 Mutton Karahi cart mein add karo",
        "1 Chicken Biryani add karo",
        "Mera bill batao",
      ],
    };
  }

  // 16. Opening hours / Timings
  if (
    clean.includes("timing") ||
    clean.includes("opening hours") ||
    clean.includes("hours") ||
    clean.includes("kab khulta") ||
    clean.includes("band hota") ||
    clean.includes("timing kya")
  ) {
    return {
      text: `⏰ **Al Madina Restaurant Timings:**\n\nHum rozana Dopahar 12:00 PM se Raat 12:00 AM tak khule rehte hain (Haftay ke tamam 7 din open).\n\n🛵 Home Delivery: 12:00 PM – 11:30 PM\n🍽️ Dine-in & VIP Family Hall: 12:00 PM – 12:00 AM Midnight.`,
      product: null,
      suggestedQuestions: [
        "Table reserve karein",
        "Menu dikhao",
        "Delivery kitne mein hoti hai?",
      ],
    };
  }

  // 17. Location / Address
  if (
    clean.includes("location") ||
    clean.includes("address") ||
    clean.includes("pata") ||
    clean.includes("kahan hai") ||
    clean.includes("where is your restaurant") ||
    clean.includes("located")
  ) {
    return {
      text: `📍 **Al Madina Restaurant Live Location:**\n\nAddress: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.\n\n(Aap website ke Contact section par ja kar live Google Map aur navigation directions bhi dekh sakte hain!)`,
      product: null,
      suggestedQuestions: [
        "Contact section dikhao",
        "Delivery charges kitne hain?",
        "Menu dekhein",
      ],
    };
  }

  // 18. Contact number / WhatsApp
  if (
    clean.includes("contact number") ||
    clean.includes("phone number") ||
    clean.includes("whatsapp number") ||
    clean.includes("mobile number") ||
    clean.includes("call number") ||
    clean.includes("rabta")
  ) {
    return {
      text: `📞 **Al Madina Restaurant Official Contact & Helpline:**\n\n• Phone & WhatsApp: 0300-1234567 (+92 300 1234567)\n• Email: contact@almadinarestaurant.pk\n\nAap kisi bhi waqt WhatsApp par direct manager se rabta kar sakte hain!`,
      product: null,
      suggestedQuestions: [
        "💬 Manager se WhatsApp par rabta",
        "Mera order place karo",
        "Menu dikhao",
      ],
    };
  }

  // 19. Delivery / Takeaway & Charges
  if (
    clean.includes("delivery") ||
    clean.includes("takeaway") ||
    clean.includes("home delivery") ||
    clean.includes("rider")
  ) {
    return {
      text: `🛵 **Karachi Home Delivery Details:**\n\n• Delivery Charge: Tamam Karachi mein sirf Rs 150 flat delivery fee hai.\n• Coverage: All Karachi sectors & areas.\n• Live GPS Tracking: Order confirm hone par aap website par rider ki bike live map par dekh sakte hain!\n• Minimum Order: Koi sakht shart nahi.`,
      product: null,
      suggestedQuestions: [
        "2 Biryani cart mein add karo",
        "Payment methods kya hain?",
        "Order track kaise karein?",
      ],
    };
  }

  // 20. How long does an order take / Delivery time
  if (
    (clean.includes("how long") ||
      clean.includes("kitna time") ||
      clean.includes("kitni der") ||
      clean.includes("der lagegi")) &&
    (clean.includes("delivery") ||
      clean.includes("order") ||
      clean.includes("khana") ||
      clean.includes("ready"))
  ) {
    return {
      text: `⏱️ **Preparation & Delivery Waqt:**\n\n• Kitchen Prep Time: 15 se 25 minutes (taaza dam dawat).\n• Rider Delivery Time: Karachi traffic ke hisab se taqreeban 35 se 45 minutes.\n\nOrder confirm hote hi aap live tracking par rider ki position dekh sakte hain!`,
      product: null,
      suggestedQuestions: [
        "Mera order track karo",
        "Chicken Biryani order karo",
        "Menu dekhein",
      ],
    };
  }

  // 21. Payment methods
  if (
    clean.includes("payment") ||
    clean.includes("pay") ||
    clean.includes("cash") ||
    clean.includes("card") ||
    clean.includes("paise kaise")
  ) {
    return {
      text: `💳 **Payment Ke Tareeqay (Payment Methods):**\n\n1. 💵 Cash on Delivery (COD) — Jab rider aapke ghar parcel laye to naqad ada karein.\n2. 📱 Direct WhatsApp Online Transfer — Hamare official WhatsApp (0300-1234567) par bank transfer ya JazzCash/EasyPaisa ki receipt bhej kar confirmation karwayein.`,
      product: null,
      suggestedQuestions: [
        "Mera order confirm karo",
        "Mera bill calculate karo",
        "Menu dikhao",
      ],
    };
  }

  // 22. Compare options
  if (
    clean.includes("compare") ||
    clean.includes("muqabla") ||
    clean.includes("difference") ||
    clean.includes("faraq")
  ) {
    return {
      text: `⚖️ **Mutton Karahi VS Dum Pukht Chicken Biryani Muqabla:**\n\n• 🍖 Mutton Karahi (Rs 1,450):\n  1 KG Handi mein taaza desi bakray ka gosht, pure desi ghee aur rich traditional spicy gravy. 2-3 afraad ke liye la-jawab shahi dawat!\n\n• 🍛 Chicken Biryani (Rs 850):\n  Dum pukht zafrani sela basmati chawal taaza chicken aur aaloo-bukhara ke sath. 1-2 afraad ke liye full single/double plate meal.\n\nAgar heavy gravied gosht khana ho to Mutton Karahi chuniye, aur aromatic chawal pasand hon to Biryani behtareen hai!`,
      product: MENU_ITEMS.find((m) => m.id === 3),
      suggestedQuestions: [
        "1 Mutton Karahi cart mein add karo",
        "1 Chicken Biryani cart mein add karo",
        "Mera bill batao",
      ],
    };
  }

  // 23. General Menu inquiry: "What is on your menu?" / "What food do you serve?"
  if (
    clean.includes("what is on your menu") ||
    clean.includes("what food do you serve") ||
    clean.includes("kya milta hai") ||
    clean.includes("kya khana hai") ||
    clean.includes("tamam khane") ||
    clean.includes("show me your menu") ||
    clean.includes("menu dikhao") ||
    clean.includes("menu kya hai")
  ) {
    return {
      text: `👑 **Al Madina Restaurant Karachi — Official Shahi Menu & Rates:**\n\n👑 **VIP Feasts:**\n• VIP Shahi Dawat Platter — Rs 2,400\n• VIP Royal Handi Mutton Feast — Rs 2,200\n\n🍗 **Starters & BBQ:**\n• Shahi Malai Boti (Charcoal) — Rs 780\n• Chicken Seekh Kebab (4 Pcs) — Rs 650\n• Vegetable Samosa (2 Pcs) — Rs 250\n\n🍛 **Mains:**\n• Mutton Karahi (1 KG Handi) — Rs 1,450\n• Dum Pukht Chicken Biryani — Rs 850\n• Dal Makhani (Butter Tadka) — Rs 600\n\n🍧 **Desserts & Drinks:**\n• Shahi Gulab Jamun (2 Pcs) — Rs 300\n• Kashmiri Pink Chai — Rs 200\n• Fresh Lime Soda — Rs 180\n\nAap inmein se jo bhi dish mangwana chahein, mujhe batayein foran cart mein add kar ke bill calculate kar doonga!`,
      product: MENU_ITEMS.find((m) => m.id === 101),
      suggestedQuestions: [
        "2 Chicken Biryani cart mein add karo",
        "1 Mutton Karahi add karo",
        "Mera bill calculate karo",
        "Table book karein",
      ],
    };
  }

  return null;
}
