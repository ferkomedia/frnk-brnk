# Frnk brnk do sveta

E-shop pre predaj detskej knihy od Viliama Hriadela.

## Technológie

- Astro 4.x
- Cloudflare Pages + Functions
- Stripe Elements
- Packeta Widget

## Funkcie

- Automatické listovanie ukážok z knihy v hero sekcii
- Výber výdajného miesta Packeta v celej Európe
- Platba kartou cez Stripe

## Inštalácia

```bash
npm install
npm run dev
```

Lokálny server beží na `http://localhost:4321`

## Konfigurácia

### API kľúče

V súbore `src/pages/index.astro` nahraďte:

```javascript
const packetaApiKey = 'YOUR_PACKETA_API_KEY';
```

### Cloudflare Environment Variables

```
STRIPE_SECRET_KEY=sk_live_xxx
PACKETA_API_KEY=xxx
```

## Build

```bash
npm run build
```

## Deployment

1. Push na GitHub
2. Pripojte k Cloudflare Pages
3. Build command: `npm run build`
4. Output: `dist`

## Licencia

© 2025 FerkoMedia Video marketing
