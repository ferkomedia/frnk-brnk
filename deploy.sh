#!/bin/bash

# ============================================
# FRNK BRNK - Deployment na Cloudflare Pages
# ============================================

echo "🚀 Frnk brnk do sveta - Deployment"
echo "=================================="

# 1. Inicializácia Git (ak ešte nie je)
if [ ! -d ".git" ]; then
  echo "📁 Inicializujem Git repozitár..."
  git init
  git branch -M main
fi

# 2. Pridanie súborov
echo "📦 Pridávam súbory..."
git add .
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"

# 3. Kontrola remote
if ! git remote | grep -q "origin"; then
  echo ""
  echo "⚠️  Nemáte nastavený GitHub remote!"
  echo ""
  echo "Spustite tieto príkazy:"
  echo ""
  echo "  git remote add origin https://github.com/VASE_MENO/frnk-brnk.git"
  echo "  git push -u origin main"
  echo ""
  echo "Potom pokračujte v Cloudflare Dashboard."
  exit 1
fi

# 4. Push na GitHub
echo "☁️  Pushujem na GitHub..."
git push origin main

echo ""
echo "✅ Hotovo! Cloudflare Pages automaticky spustí nový build."
echo ""
echo "🔗 Skontrolujte: https://dash.cloudflare.com → Workers & Pages"
