export async function onRequestPost(context) {
  const { request, env } = context;
  
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const FROM_EMAIL = 'objednavky@ferkomedia.sk';
  const NOTIFY_EMAIL = 'objednavky@ferkomedia.sk';
  
  const COMPANY = {
    name: 'FerkoMedia Video marketing',
    ico: '40090779',
    dic: '1029409579',
    address: 'Červenej armády 1',
    city: '036 01 Martin',
    country: 'Slovensko'
  };
  
  // Farby zo stránky
  const colors = {
    forest: '#4a7c59',
    forestDark: '#3d6649',
    sun: '#f5c842',
    cream: '#fefcf6',
    paper: '#f9f6ef',
    text: '#2c3e2d',
    textLight: '#5a6b5c',
    border: '#d4d9d5'
  };
  
  try {
    const payload = await request.json();
    
    if (payload.type === 'payment_intent.succeeded') {
      const paymentIntent = payload.data.object;
      const metadata = paymentIntent.metadata;
      const amount = (paymentIntent.amount / 100).toFixed(2);
      
      const customerName = metadata.customer_name || 'Zákazník';
      const customerEmail = metadata.customer_email;
      const customerPhone = metadata.customer_phone || '';
      const quantity = metadata.quantity || '1';
      const shippingPrice = parseFloat(metadata.shipping_price || 0);
      const packetaPoint = metadata.packeta_point_name || '';
      const packetaId = metadata.packeta_point_id || '';
      
      const booksTotal = (paymentIntent.amount / 100) - shippingPrice;
      const unitPrice = (booksTotal / parseInt(quantity)).toFixed(2);
      
      const now = new Date();
      const invoiceNumber = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      const invoiceDate = now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear();
      
      // ========== EMAIL PRE ZÁKAZNÍKA ==========
      const customerEmailHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background-color:' + colors.cream + ';"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:' + colors.cream + ';padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(44,62,45,0.12);">' +
        
        // Header
        '<tr><td style="background-color:' + colors.forest + ';padding:30px;text-align:center;"><h1 style="margin:0;color:white;font-family:Andika,Georgia,serif;font-size:28px;">Frnk brnk do sveta</h1></td></tr>' +
        
        // Ďakujeme
        '<tr><td style="padding:40px 40px 20px;"><h2 style="margin:0 0 10px;color:' + colors.forest + ';font-family:Andika,Georgia,serif;font-size:24px;">Ďakujeme za objednávku!</h2><p style="margin:0;color:' + colors.textLight + ';font-family:Andika,Georgia,serif;font-size:16px;line-height:1.6;">Dobrý deň ' + customerName + ', vaša objednávka bola úspešne prijatá a platba prebehla v poriadku.</p></td></tr>' +
        
        // Detaily objednávky
        '<tr><td style="padding:20px 40px;"><div style="background-color:' + colors.paper + ';border-radius:12px;padding:24px;border:1px solid ' + colors.border + ';"><h3 style="margin:0 0 16px;color:' + colors.text + ';font-family:Andika,Georgia,serif;font-size:18px;">📦 Detaily objednávky</h3><table width="100%" style="font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.text + ';"><tr><td style="padding:8px 0;border-bottom:1px solid ' + colors.border + ';">Číslo faktúry</td><td style="padding:8px 0;border-bottom:1px solid ' + colors.border + ';text-align:right;font-weight:bold;">' + invoiceNumber + '</td></tr><tr><td style="padding:8px 0;border-bottom:1px solid ' + colors.border + ';">Kniha</td><td style="padding:8px 0;border-bottom:1px solid ' + colors.border + ';text-align:right;">Frnk brnk do sveta</td></tr><tr><td style="padding:8px 0;border-bottom:1px solid ' + colors.border + ';">Počet kusov</td><td style="padding:8px 0;border-bottom:1px solid ' + colors.border + ';text-align:right;">' + quantity + ' ks</td></tr><tr><td style="padding:8px 0;"><strong>Celková suma</strong></td><td style="padding:8px 0;text-align:right;font-size:20px;font-weight:bold;color:' + colors.forest + ';">' + amount + ' €</td></tr></table></div></td></tr>' +
        
        // Doručenie
        '<tr><td style="padding:20px 40px;"><div style="background-color:' + colors.paper + ';border-radius:12px;padding:24px;border:1px solid ' + colors.border + ';"><h3 style="margin:0 0 16px;color:' + colors.text + ';font-family:Andika,Georgia,serif;font-size:18px;">🚚 Doručenie cez Packeta</h3><p style="margin:0 0 8px;font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.text + ';"><strong>Výdajné miesto:</strong></p><p style="margin:0 0 16px;font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.textLight + ';">' + packetaPoint + '</p><p style="margin:0;font-family:Andika,Georgia,serif;font-size:14px;color:' + colors.textLight + ';">O odoslaní balíka vás budeme informovať. Po doručení dostanete SMS s kódom na vyzdvihnutie.</p></div></td></tr>' +
        
        // Faktúra header
        '<tr><td style="padding:30px 40px 20px;"><div style="border-top:2px solid ' + colors.forest + ';padding-top:30px;"><h2 style="margin:0;color:' + colors.forest + ';font-family:Andika,Georgia,serif;font-size:22px;">FAKTÚRA č. ' + invoiceNumber + '</h2></div></td></tr>' +
        
        // Faktúra údaje
        '<tr><td style="padding:0 40px 20px;"><table width="100%" style="font-family:Andika,Georgia,serif;font-size:14px;color:' + colors.text + ';"><tr><td style="vertical-align:top;width:50%;padding-right:20px;"><p style="margin:0 0 4px;font-weight:bold;color:' + colors.textLight + ';font-size:12px;text-transform:uppercase;">Dodávateľ</p><p style="margin:0;line-height:1.6;">' + COMPANY.name + '<br>' + COMPANY.address + '<br>' + COMPANY.city + '<br>IČO: ' + COMPANY.ico + '<br>DIČ: ' + COMPANY.dic + '</p></td><td style="vertical-align:top;width:50%;"><p style="margin:0 0 4px;font-weight:bold;color:' + colors.textLight + ';font-size:12px;text-transform:uppercase;">Odberateľ</p><p style="margin:0;line-height:1.6;">' + customerName + '<br>' + customerEmail + '<br>' + customerPhone + '</p></td></tr></table></td></tr>' +
        
        // Faktúra dátumy
        '<tr><td style="padding:0 40px 20px;"><p style="margin:0;font-family:Andika,Georgia,serif;font-size:14px;color:' + colors.text + ';"><strong>Dátum vystavenia:</strong> ' + invoiceDate + ' · <strong>Spôsob úhrady:</strong> Platba kartou</p></td></tr>' +
        
        // Faktúra tabuľka
        '<tr><td style="padding:0 40px 20px;"><table width="100%" cellpadding="0" cellspacing="0" style="font-family:Andika,Georgia,serif;font-size:14px;"><tr style="background-color:' + colors.forest + ';color:white;"><th style="padding:12px;text-align:left;border-radius:8px 0 0 0;">Položka</th><th style="padding:12px;text-align:center;">Ks</th><th style="padding:12px;text-align:right;white-space:nowrap;">Cena/ks</th><th style="padding:12px;text-align:right;white-space:nowrap;border-radius:0 8px 0 0;">Spolu</th></tr><tr style="background-color:' + colors.paper + ';"><td style="padding:12px;color:' + colors.text + ';">Frnk brnk do sveta</td><td style="padding:12px;text-align:center;color:' + colors.text + ';">' + quantity + '</td><td style="padding:12px;text-align:right;color:' + colors.text + ';white-space:nowrap;">' + unitPrice + ' €</td><td style="padding:12px;text-align:right;color:' + colors.text + ';white-space:nowrap;">' + booksTotal.toFixed(2) + ' €</td></tr><tr style="background-color:white;"><td style="padding:12px;color:' + colors.text + ';border-bottom:1px solid ' + colors.border + ';">Doručenie Packeta</td><td style="padding:12px;text-align:center;color:' + colors.text + ';border-bottom:1px solid ' + colors.border + ';">1</td><td style="padding:12px;text-align:right;color:' + colors.text + ';border-bottom:1px solid ' + colors.border + ';white-space:nowrap;">' + shippingPrice.toFixed(2) + ' €</td><td style="padding:12px;text-align:right;color:' + colors.text + ';border-bottom:1px solid ' + colors.border + ';white-space:nowrap;">' + shippingPrice.toFixed(2) + ' €</td></tr><tr><td colspan="3" style="padding:16px 12px;text-align:right;font-weight:bold;font-size:16px;color:' + colors.text + ';">Celkom k úhrade:</td><td style="padding:16px 12px;text-align:right;font-weight:bold;font-size:20px;color:' + colors.forest + ';white-space:nowrap;">' + amount + ' €</td></tr></table></td></tr>' +
        
        // Uhradené badge
        '<tr><td style="padding:0 40px 30px;text-align:center;"><span style="display:inline-block;background-color:' + colors.forest + ';color:white;padding:12px 32px;border-radius:50px;font-family:Andika,Georgia,serif;font-size:16px;font-weight:bold;">✓ UHRADENÉ</span></td></tr>' +
        
        // Nie sme platcom DPH
        '<tr><td style="padding:0 40px 30px;"><p style="margin:0;font-family:Andika,Georgia,serif;font-size:13px;color:' + colors.textLight + ';text-align:center;">Nie sme platcom DPH.</p></td></tr>' +
        
        // Footer
        '<tr><td style="background-color:' + colors.paper + ';padding:24px 40px;border-top:1px solid ' + colors.border + ';"><p style="margin:0;font-family:Andika,Georgia,serif;font-size:13px;color:' + colors.textLight + ';text-align:center;">' + COMPANY.name + ' · ' + COMPANY.address + ', ' + COMPANY.city + '<br><a href="https://frnk-brnk.sk" style="color:' + colors.forest + ';">frnk-brnk.sk</a></p></td></tr>' +
        
        '</table></td></tr></table></body></html>';

      // ========== EMAIL PRE VÁS (NOTIFIKÁCIA) ==========
      const notifyEmailHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background-color:' + colors.cream + ';"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:' + colors.cream + ';padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(44,62,45,0.12);">' +
        
        // Header so sumou
        '<tr><td style="background-color:' + colors.forest + ';padding:30px;text-align:center;"><h1 style="margin:0 0 8px;color:white;font-family:Andika,Georgia,serif;font-size:24px;">🎉 Nová objednávka!</h1><p style="margin:0;color:rgba(255,255,255,0.9);font-family:Andika,Georgia,serif;font-size:32px;font-weight:bold;">' + amount + ' €</p></td></tr>' +
        
        // Faktúra číslo
        '<tr><td style="padding:30px 40px 20px;text-align:center;"><p style="margin:0;font-family:Andika,Georgia,serif;font-size:14px;color:' + colors.textLight + ';">Faktúra č.</p><p style="margin:4px 0 0;font-family:Andika,Georgia,serif;font-size:20px;font-weight:bold;color:' + colors.text + ';">' + invoiceNumber + '</p></td></tr>' +
        
        // Zákazník box
        '<tr><td style="padding:0 40px 20px;"><div style="background-color:' + colors.paper + ';border-radius:12px;padding:24px;border:1px solid ' + colors.border + ';"><h3 style="margin:0 0 16px;color:' + colors.forest + ';font-family:Andika,Georgia,serif;font-size:16px;">👤 Zákazník</h3><table width="100%" style="font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.text + ';"><tr><td style="padding:6px 0;width:100px;color:' + colors.textLight + ';">Meno</td><td style="padding:6px 0;font-weight:bold;">' + customerName + '</td></tr><tr><td style="padding:6px 0;color:' + colors.textLight + ';">Email</td><td style="padding:6px 0;"><a href="mailto:' + customerEmail + '" style="color:' + colors.forest + ';">' + customerEmail + '</a></td></tr><tr><td style="padding:6px 0;color:' + colors.textLight + ';">Telefón</td><td style="padding:6px 0;"><a href="tel:' + customerPhone + '" style="color:' + colors.forest + ';">' + customerPhone + '</a></td></tr></table></div></td></tr>' +
        
        // Objednávka box
        '<tr><td style="padding:0 40px 20px;"><div style="background-color:' + colors.paper + ';border-radius:12px;padding:24px;border:1px solid ' + colors.border + ';"><h3 style="margin:0 0 16px;color:' + colors.forest + ';font-family:Andika,Georgia,serif;font-size:16px;">📦 Objednávka</h3><table width="100%" style="font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.text + ';"><tr><td style="padding:6px 0;width:100px;color:' + colors.textLight + ';">Produkt</td><td style="padding:6px 0;">Frnk brnk do sveta</td></tr><tr><td style="padding:6px 0;color:' + colors.textLight + ';">Počet</td><td style="padding:6px 0;font-weight:bold;">' + quantity + ' ks</td></tr><tr><td style="padding:6px 0;color:' + colors.textLight + ';">Suma</td><td style="padding:6px 0;font-weight:bold;color:' + colors.forest + ';">' + amount + ' €</td></tr></table></div></td></tr>' +
        
        // Packeta box (žltý)
        '<tr><td style="padding:0 40px 20px;"><div style="background-color:' + colors.sun + ';border-radius:12px;padding:24px;"><h3 style="margin:0 0 16px;color:' + colors.text + ';font-family:Andika,Georgia,serif;font-size:16px;">🚚 Packeta</h3><p style="margin:0 0 8px;font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.text + ';"><strong>Výdajné miesto:</strong></p><p style="margin:0 0 8px;font-family:Andika,Georgia,serif;font-size:15px;color:' + colors.text + ';">' + packetaPoint + '</p><p style="margin:0;font-family:Andika,Georgia,serif;font-size:14px;color:' + colors.text + ';">ID: ' + packetaId + '</p></div></td></tr>' +
        
        // Stripe link
        '<tr><td style="padding:0 40px 30px;text-align:center;"><a href="https://dashboard.stripe.com/test/payments/' + paymentIntent.id + '" style="display:inline-block;background-color:' + colors.forest + ';color:white;padding:14px 28px;border-radius:8px;font-family:Andika,Georgia,serif;font-size:15px;font-weight:bold;text-decoration:none;">Zobraziť v Stripe →</a></td></tr>' +
        
        // Email status
        '<tr><td style="padding:0 40px 30px;text-align:center;"><p style="margin:0;font-family:Andika,Georgia,serif;font-size:13px;color:' + colors.textLight + ';">Email zákazníkovi: <span style="color:' + colors.forest + ';font-weight:bold;">✓ Odoslaný</span></p></td></tr>' +
        
        '</table></td></tr></table></body></html>';

      // Poslať email zákazníkovi
      const customerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Frnk brnk do sveta <' + FROM_EMAIL + '>',
          to: customerEmail,
          subject: 'Potvrdenie objednávky a faktúra č. ' + invoiceNumber,
          html: customerEmailHtml
        })
      });
      
      const customerResult = await customerResponse.json();
      
      // Poslať notifikáciu
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Frnk brnk <' + FROM_EMAIL + '>',
          to: NOTIFY_EMAIL,
          subject: '🎉 Nová objednávka #' + invoiceNumber + ' - ' + quantity + 'x kniha - ' + amount + ' €',
          html: notifyEmailHtml.replace('✓ Odoslaný', customerResult.id ? '✓ Odoslaný' : '❌ Chyba: ' + JSON.stringify(customerResult))
        })
      });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
