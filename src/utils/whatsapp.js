// ============================================================
// AL MADINA RESTAURANT — WhatsApp Order Helper
// Generates formatted WhatsApp messages for direct order placement
// to the restaurant owner's number (+92 307 0769139)
// ============================================================

export const RESTAURANT_PHONE = "+92 307 0769139";
export const RESTAURANT_WHATSAPP_NUMBER = "923070769139";

export function generateWhatsAppOrderMessage(order) {
  if (!order) return "";

  const itemsList = (order.items || [])
    .map((item) => `• ${item.quantity}x ${item.name} (Rs ${item.price * item.quantity})`)
    .join("\n");

  const fulfillmentText =
    order.fulfillment === "delivery"
      ? `🛵 *Home Delivery*\n📍 *Address:* ${order.customer?.address || "Not specified"}`
      : `🏪 *Self Pickup at Restaurant*`;

  const paymentText =
    order.paymentMethod === "card" ? "💳 Card (Online)" : "💵 Cash on Delivery (COD)";

  const message = `✨ *AL MADINA RESTAURANT — NEW ORDER* ✨
━━━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* #${order.id}
👤 *Customer:* ${order.customer?.name || "Customer"}
📞 *Phone:* ${order.customer?.phone || "N/A"}
${fulfillmentText}

🍽️ *ITEMS ORDERED:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* Rs ${order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || order.total}
🛵 *Delivery Fee:* ${order.fulfillment === "delivery" ? "Rs 150" : "Free"}
💵 *TOTAL PAYABLE:* Rs ${order.total}
💳 *Payment Mode:* ${paymentText}
━━━━━━━━━━━━━━━━━━━━━
💬 *Status:* Awaiting Owner Confirmation
Assalam-o-Alaikum! Please confirm my order and let me know the preparation time. Thank you!`;

  return message;
}

export function getWhatsAppOrderUrl(order) {
  const text = generateWhatsAppOrderMessage(order);
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppOrder(order) {
  const url = getWhatsAppOrderUrl(order);
  window.open(url, "_blank", "noopener,noreferrer");
}
