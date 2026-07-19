// ============================================================
// AL MADINA RESTAURANT — Shared "fly to cart" animation
// Animates a small copy of a dish image flying from wherever the
// "Add" button was clicked toward the cart icon in the navbar —
// like a file flying into a download tray. Used by Menu and Offers.
// Looks for #am-navbar-cart-btn (desktop) or #am-navbar-cart-btn-mobile (mobile).
// ============================================================
export function flyToCart(imageSrc, sourceEl) {
  const cartEl =
    document.getElementById("am-navbar-cart-btn") ||
    document.getElementById("am-navbar-cart-btn-mobile");
  if (!cartEl || !sourceEl) return;

  const startRect = sourceEl.getBoundingClientRect();
  const endRect = cartEl.getBoundingClientRect();

  const flyer = document.createElement("img");
  flyer.src = imageSrc;
  Object.assign(flyer.style, {
    position: "fixed",
    left: `${startRect.left}px`,
    top: `${startRect.top}px`,
    width: "42px",
    height: "42px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid #D4AF37",
    zIndex: 9999,
    pointerEvents: "none",
    transition: "transform 0.7s cubic-bezier(0.55,0,0.85,0.35), opacity 0.7s ease, width 0.7s ease, height 0.7s ease",
  });
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    const dx = endRect.left + endRect.width / 2 - (startRect.left + 21);
    const dy = endRect.top + endRect.height / 2 - (startRect.top + 21);
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.15)`;
    flyer.style.opacity = "0.3";
    flyer.style.width = "20px";
    flyer.style.height = "20px";
  });

  setTimeout(() => {
    flyer.remove();
    cartEl.style.transition = "transform 0.2s ease";
    cartEl.style.transform = "scale(1.25)";
    setTimeout(() => {
      cartEl.style.transform = "scale(1)";
    }, 200);
  }, 700);
}