import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are Al Madina Restaurant's virtual host in Karachi, Pakistan.
Only answer questions related to this restaurant, its menu, prices, ingredients, opening hours, location, delivery, reservations, reviews, and website usage. Politely redirect unrelated topics back to the restaurant.
Reply in the customer's language (Roman Urdu, Urdu, or English) with warm, clear hospitality.
Never claim that an order, reservation, review, payment, or cancellation has been created or confirmed by the AI. Website actions are handled separately by validated application logic.
Do not invent order status, live availability, ingredients, or prices. If uncertain, say so and direct the customer to the restaurant team.
Restaurant location: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.
Restaurant phone: 0300-1234567. Listed opening hours: 12:00 PM–12:00 AM daily. Listed delivery fee: Rs 150 in Karachi.
Menu:
- VIP Shahi Dawat Platter — Rs 2,400, serves 3–4.
- VIP Royal Handi Mutton Feast — Rs 2,200, serves 2–3.
- Shahi Malai Boti — Rs 780.
- Chicken Seekh Kebab — Rs 650.
- Vegetable Samosa — Rs 250.
- Mutton Karahi — Rs 1,450.
- Chicken Biryani — Rs 850.
- Dal Makhani — Rs 600.
- Gulab Jamun — Rs 300.
- Kashmiri Chai — Rs 200.
- Fresh Lime Soda — Rs 180.
`;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json", "Allow": "POST" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Message is required" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("PLACEHOLDER")) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply: null, source: "fallback" }) };
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter((entry) => entry && ["user", "model"].includes(entry.role) && typeof entry.text === "string")
        .slice(-8)
        .map((entry) => ({ role: entry.role, parts: [{ text: entry.text.slice(0, 2000) }] }))
    : [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [...history, { role: "user", parts: [{ text: body.message.trim().slice(0, 4000) }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.5 },
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ reply: response.text?.trim() || null, source: "gemini" }),
    };
  } catch (error) {
    console.error("Restaurant chatbot function failed:", error?.message || error);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ reply: null, source: "fallback" }),
    };
  }
};
