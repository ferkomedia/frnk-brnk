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
      
      const customerEmailHtml = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;"><h1 style="color: #4a7c59;">Ďakujeme za objednávku!</h1><p>Dobrý deň ' + customerName + ',</p><p>Vaša objednávka bola úspešne prijatá a platba prebehla v poriadku.</p><div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin-top: 0;">Detaily objednávky</h3><p><strong>Číslo faktúry:</strong> ' + invoiceNumber + '</p><p><strong>Kniha:</strong> Frnk brnk do sveta</p><p><strong>Počet kusov:</strong> ' + quantity + '</p><p><strong>Celková suma:</strong> ' + amount + ' €</p></div><div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin-top: 0;">Doručenie cez Packeta</h3><p><strong>Výdajné miesto:</strong> ' + packetaPoint + '</p><p>O odoslaní balíka vás budeme informovať. Po doručení dostanete SMS s kódom.</p></div><hr style="border: none; border-top: 2px solid #4a7c59; margin: 30px 0;"><h2 style="color: #4a7c59;">FAKTÚRA č. ' + invoiceNumber + '</h2><table style="width: 100%; margin-bottom: 20px;"><tr><td style="vertical-align: top; width: 50%;"><strong>Dodávateľ:</strong><br>' + COMPANY.name + '<br>' + COMPANY.address + '<br>' + COMPANY.city + '<br>IČO: ' + COMPANY.ico + '<br>DIČ: ' + COMPANY.dic + '</td><td style="vertical-align: top; width: 50%;"><strong>Odberateľ:</strong><br>' + customerName + '<br>' + customerEmail + '<br>' + customerPhone + '</td></tr></table><p><strong>Dátum vystavenia:</strong> ' + invoiceDate + '<br><strong>Spôsob úhrady:</strong> Platba kartou (uhradené)</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr style="background: #4a7c59; color: white;"><th style="padding: 10px; text-align: left;">Položka</th><th style="padding: 10px; text-align: right;">Ks</th><th style="padding: 10px; text-align: right;">Cena/ks</th><th style="padding: 10px; text-align: right;">Spolu</th></tr><tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">Frnk brnk do sveta</td><td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">' + quantity + '</td><td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">' + unitPrice + ' €</td><td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">' + booksTotal.toFixed(2) + ' €</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">Doručenie Packeta</td><td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">1</td><td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">' + shippingPrice.toFixed(2) + ' €</td><td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">' + shippingPrice.toFixed(2) + ' €</td></tr><tr style="font-weight: bold; font-size: 18px;"><td colspan="3" style="padding: 10px; text-align: right;">Celkom:</td><td style="padding: 10px; text-align: right;">' + amount + ' €</td></tr></table><p style="text-align: center; color: #4a7c59; font-size: 20px; font-weight: bold; border: 2px solid #4a7c59; padding: 10px; display: inline-block;">✓ UHRADENÉ</p><p style="font-size: 12px; color: #666; margin-top: 20px;">Nie sme platcom DPH.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;"><p style="font-size: 12px; color: #666;">' + COMPANY.name + ' | ' + COMPANY.address + ', ' + COMPANY.city + ' | frnk-brnk.sk</p></div>';

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
          html: '<div style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="color: #4a7c59;">Nová objednávka!</h1><p><strong>Faktúra:</strong> ' + invoiceNumber + '</p><p><strong>Zákazník:</strong> ' + customerName + '</p><p><strong>Email:</strong> ' + customerEmail + '</p><p><strong>Telefón:</strong> ' + customerPhone + '</p><p><strong>Počet:</strong> ' + quantity + 'x kniha</p><p><strong>Suma:</strong> ' + amount + ' €</p><p><strong>Packeta:</strong> ' + packetaPoint + ' (ID: ' + packetaId + ')</p><p><strong>Email zákazníkovi:</strong> ' + (customerResult.id ? 'Odoslaný ✓' : 'CHYBA: ' + JSON.stringify(customerResult)) + '</p><p><a href="https://dashboard.stripe.com/payments/' + paymentIntent.id + '">Zobraziť v Stripe →</a></p></div>'
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
