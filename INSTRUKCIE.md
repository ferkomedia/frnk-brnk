# 🚀 SEO Aktualizácia pre frnk-brnk.sk

## Čo obsahuje tento balík

```
seo-update/
├── src/
│   └── layouts/
│       └── Layout.astro      ← SEO meta tagy + Schema markup
├── public/
│   ├── robots.txt            ← Nový súbor
│   └── sitemap.xml           ← Nový súbor
├── GA4-TRACKING.md           ← Snippet na manuálne pridanie do index.astro
└── INSTRUKCIE.md             ← Tento súbor
```

⚠️ **index.astro NIE JE ZAHRNUTÝ** - aby som ti nepokazil tvoju správnu verziu s 27 krajinami (4 pickup + 23 address).

---

## 🔧 Nasadenie

### Krok 1: Nahraď Layout.astro
```bash
cp seo-update/src/layouts/Layout.astro src/layouts/Layout.astro
```

### Krok 2: Pridaj nové súbory do /public
```bash
cp seo-update/public/robots.txt public/
cp seo-update/public/sitemap.xml public/
```

### Krok 3: Manuálne pridaj GA4 tracking
Otvor `GA4-TRACKING.md` a podľa inštrukcií pridaj 3 bloky kódu do svojho existujúceho `index.astro`.

### Krok 4: Vytvor OG Image
Potrebuješ vytvoriť `/public/og-image.jpg` (1200x630px) pre social sharing.

### Krok 5: Nasaď
```bash
git add .
git commit -m "SEO: Schema markup, meta tags, GA4 e-commerce"
git push origin main
```

---

## ✅ Čo pridáva

### 1. SEO Meta Tags
- ✅ `<link rel="canonical">` - kanonická URL
- ✅ `<meta name="robots">` - povolenie indexovania
- ✅ Kompletné Open Graph tagy
- ✅ Twitter Cards

### 2. Core Web Vitals Optimalizácie
- ✅ `<link rel="preload">` pre hlavný obrázok (LCP)
- ✅ `<link rel="preconnect">` pre externé domény
- ✅ `display=swap` pre fonty (CLS)
- ✅ `defer` na Packeta script

### 3. Schema Markup (JSON-LD)
- ✅ **Product Schema** - produkt s cenou, dostupnosťou, doručením
- ✅ **Organization Schema** - informácie o firme
- ✅ **Breadcrumb Schema** - navigácia
- ✅ **FAQ Schema** - otázky a odpovede (dôležité pre AI vyhľadávače!)

### 4. Google Analytics 4
- ✅ E-commerce eventy (view_item, add_to_cart, begin_checkout)
- ✅ Kompatibilné s tvojím Consent Mode v2

---

## 🔧 Inštrukcie na nasadenie

### Krok 1: Nahraď Layout.astro
```bash
cp seo-update/src/layouts/Layout.astro src/layouts/Layout.astro
```

### Krok 2: Nahraď index.astro (pridá e-commerce tracking)
```bash
cp seo-update/src/pages/index.astro src/pages/index.astro
```

### Krok 3: Pridaj nové súbory do /public
```bash
cp seo-update/public/robots.txt public/robots.txt
cp seo-update/public/sitemap.xml public/sitemap.xml
```

### Krok 4: Vytvor OG Image
Potrebuješ vytvoriť súbor `/public/og-image.jpg` (1200x630px) pre zdieľanie na sociálnych sieťach.

### Krok 5: Nasaď
```bash
git add .
git commit -m "SEO: Add schema markup, meta tags, e-commerce tracking"
git push origin main
```

---

## ✅ Checklist po nasadení

1. [ ] Otestuj na [PageSpeed Insights](https://pagespeed.web.dev)
2. [ ] Otestuj Schema na [Rich Results Test](https://search.google.com/test/rich-results)
3. [ ] Zaregistruj sa v [Google Search Console](https://search.google.com/search-console)
4. [ ] Odošli sitemap v Search Console
5. [ ] Zaregistruj sa v [Bing Webmaster Tools](https://www.bing.com/webmasters)
6. [ ] Over GA4 tracking cez [Tag Assistant](https://tagassistant.google.com/)

---

## 📈 Očakávané výsledky

| Časový rámec | Čo očakávať |
|--------------|-------------|
| 1-2 týždne | Zlepšenie Core Web Vitals |
| 2-4 týždne | Indexovanie schema, rich snippets v Google |
| 1-3 mesiace | Zlepšenie pozícií v Google |
| 3-6 mesiacov | Citácie v AI vyhľadávačoch (ChatGPT, Perplexity) |

---

**Pripravené pre**: frnk-brnk.sk  
**Verzia**: SEO 2026 | Marec 2026
