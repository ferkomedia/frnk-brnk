# GA4 E-commerce Tracking pre index.astro

Pridaj tieto 3 bloky do svojho **existujúceho** index.astro:

---

## 1️⃣ view_item (na začiatok DOMContentLoaded)

Nájdi:
```javascript
document.addEventListener('DOMContentLoaded',()=>{
```

Hneď za `{` pridaj:
```javascript
// GA4 view_item
if(typeof gtag !== 'undefined') {
  gtag('event', 'view_item', {
    currency: 'EUR',
    value: 11.99,
    items: [{
      item_id: 'frnk-brnk-kniha',
      item_name: 'Frnk brnk do sveta',
      item_brand: 'FerkoMedia',
      item_category: 'Detské knihy',
      price: 11.99,
      quantity: 1
    }]
  });
}
```

---

## 2️⃣ add_to_cart (pri zmene množstva)

Nájdi kde máš event listenery pre qty-minus, qty-plus a quantity input.

Pridaj túto funkciu niekde v JavaScript sekcii:
```javascript
// GA4 add_to_cart
function trackAddToCart() {
  if(typeof gtag === 'undefined') return;
  const qty = parseInt(document.getElementById('quantity').value) || 1;
  const discount = getDiscount(qty);
  const unitPrice = UNIT_PRICE * (1 - discount/100);
  gtag('event', 'add_to_cart', {
    currency: 'EUR',
    value: unitPrice * qty,
    items: [{
      item_id: 'frnk-brnk-kniha',
      item_name: 'Frnk brnk do sveta',
      price: unitPrice,
      quantity: qty
    }]
  });
}
```

A potom pridaj `trackAddToCart();` do event listenerov pre množstvo:
```javascript
// Existujúci kód - pridaj trackAddToCart() na koniec
document.getElementById('qty-minus')?.addEventListener('click',()=>{
  // ... existujúci kód ...
  trackAddToCart();
});
document.getElementById('qty-plus')?.addEventListener('click',()=>{
  // ... existujúci kód ...
  trackAddToCart();
});
qtyInput?.addEventListener('change',()=>{
  // ... existujúci kód ...
  trackAddToCart();
});
```

---

## 3️⃣ begin_checkout (pri odoslaní formulára)

Nájdi submit handler:
```javascript
document.getElementById('order-form')?.addEventListener('submit',async(e)=>{
```

Hneď za `e.preventDefault();` pridaj:
```javascript
// GA4 begin_checkout
if(typeof gtag !== 'undefined') {
  const qty = parseInt(document.getElementById('quantity').value) || 1;
  const totalValue = parseFloat(document.getElementById('total-final').textContent.replace(' €','').replace(',','.'));
  gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: totalValue,
    items: [{
      item_id: 'frnk-brnk-kniha',
      item_name: 'Frnk brnk do sveta',
      price: 11.99,
      quantity: qty
    }]
  });
}
```

---

## ✅ Hotovo!

Po týchto zmenách budeš v GA4 vidieť:
- **view_item** - koľko ľudí si pozrelo produkt
- **add_to_cart** - koľko ľudí zmenilo množstvo
- **begin_checkout** - koľko ľudí kliklo na "Dokončiť objednávku"

Tieto eventy sú kompatibilné s tvojím Consent Mode v2.
