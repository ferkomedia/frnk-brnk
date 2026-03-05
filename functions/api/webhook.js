export async function onRequestPost(context) {
  const { request, env } = context;
  
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const FROM_EMAIL = 'objednavky@ferkomedia.sk';
  const NOTIFY_EMAIL = 'info@ferkomedia.sk';
  
  // Firemné údaje
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
      
      const customerName = metadata.customer_name;
      const customerEmail = metadata.customer_email;
      const customerPhone = metadata.customer_phone;
      const quantity = metadata.quantity;
      const shippingPrice = parseFloat(metadata.shipping_price || 0);
      const packetaPoint = metadata.packeta_point_name;
      const packetaId = metadata.packeta_point_id;
      
      // Cena za knihy (celkom - doprava)
      const booksTotal = (paymentIntent.amount / 100) - shippingPrice;
      const unitPrice = (booksTotal / quantity).toFixed(2);
      
      // Číslo faktúry - rok + timestamp
      const now = new Date();
      const invoiceNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const invoiceDate = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
      const dueDate = invoiceDate; // Zaplatené ihneď
      
      // HTML faktúra
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #4a7c59; }
            .invoice-title { font-size: 28px; color: #4a7c59; margin-bottom: 5px; }
            .invoice-number { color: #666; }
            .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .address-box { width: 45%; }
            .address-box h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 10px; }
            .address-box p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #4a7c59; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #ddd; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; }
            .totals td { padding: 8px 12px; }
            .totals .final { font-size: 18px; font-weight: bold; background: #f5f5f5; }
            .paid-stamp { color: #4a7c59; font-size: 24px; font-weight: bold; text-align: center; border: 3px solid #4a7c59; padding: 10px 30px; display: inline-block; transform: rotate(-5deg); margin-top: 20px; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">FerkoMedia</div>
            <div>
              <div class="invoice-title">FAKTÚRA</div>
              <div class="invoice-number">č. ${invoiceNumber}</div>
            </div>
          </div>
          
          <div class="addresses">
            <div class="address-box">
              <h3>Dodávateľ</h3>
              <p><strong>${COMPANY.name}</strong></p>
              <p>${COMPANY.address}</p>
              <p>${COMPANY.city}</p>
              <p>${COMPANY.country}</p>
              <p>IČO: ${COMPANY.ico}</p>
              <p>DIČ: ${COMPANY.dic}</p>
            </div>
            <div class="address-box">
              <h3>Odberateľ</h3>
              <p><strong>${customerName}</strong></p>
              <p>Email: ${customerEmail}</p>
              <p>Tel: ${customerPhone}</p>
            </div>
          </div>
          
          <p><strong>Dátum vystavenia:</strong> ${invoiceDate}</p>
          <p><strong>Dátum splatnosti:</strong> ${dueDate}</p>
          <p><strong>Spôsob úhrady:</strong> Platba kartou (uhradené)</p>
          
          <table>
            <thead>
              <tr>
                <th>Položka</th>
                <th class="text-right">Množstvo</th>
                <th class="text-right">Cena/ks</th>
                <th class="text-right">Spolu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Frnk brnk do sveta - detská kniha</td>
                <td class="text-right">${quantity} ks</td>
                <td class="text-right">${unitPrice} €</td>
                <td class="text-right">${booksTotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td>Doručenie Packeta - ${packetaPoint}</td>
                <td class="text-right">1</td>
                <td class="text-right">${shippingPrice.toFixed(2)} €</td>
                <td class="text-right">${shippingPrice.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
          
          <table class="totals">
            <tr class="final">
              <td>Celkom k úhrade:</td>
              <td class="text-right">${amount} €</td>
            </tr>
          </table>
          
          <p style="font-size: 12px; color: #666;">Nie sme platcom DPH.</p>
          
          <div style="text-align: center;">
            <div class="paid-stamp">UHRADENÉ</div>
          </div>
          
          <div class="footer">
            <p>${COMPANY.name} | ${COMPANY.address}, ${COMPANY.city} | IČO: ${COMPANY.ico} | DIČ: ${COMPANY.dic}</p>
          </div>
        </body>
        </html>
      `;
      
      // 1. Email zákazníkovi s faktúrou
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Frnk brnk do sveta <${FROM_EMAIL}>`,
          to: customerEmail,
          subject: `Potvrdenie objednávky a faktúra č. ${invoiceNumber}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4a7c59;">Ďakujeme za objednávku!</h1>
              <p>Dobrý deň ${customerName},</p>
              <p>Vaša objednávka bola úspešne prijatá a platba prebehla v poriadku.</p>
              <div style="background: #f9f6ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e2d;">Detaily objednávky</h3>
                <p><strong>Číslo faktúry:</strong> ${invoiceNumber}</p>
                <p><strong>Kniha:</strong> Frnk brnk do sveta</p>
                <p><strong>Počet kusov:</strong> ${quantity}</p>
                <p><strong>Celková suma:</strong> ${amount} €</p>
              </div>
              <div style="background: #f9f6ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e2d;">Doručenie</h3>
                <p><strong>Výdajné miesto Packeta:</strong><br>${packetaPoint}</p>
                <p>O odoslaní balíka vás budeme informovať emailom. Po doručení na výdajné miesto dostanete SMS s kódom na vyzdvihnutie.</p>
              </div>
              <p>Faktúra je priložená nižšie v tomto emaile.</p>
              <p>Ak máte akékoľvek otázky, neváhajte nás kontaktovať.</p>
              <p>S pozdravom,<br><strong>Tím Frnk brnk do sveta</strong></p>
              <hr style="border: none; border-top: 1px solid #d4d9d5; margin: 30px 0;">
              <p style="font-size: 12px; color: #5a6b5c;">FerkoMedia Video marketing | frnk-brnk.sk</p>
              <hr style="border: none; border-top: 1px solid #d4d9d5; margin: 30px 0;">
              <h2 style="color: #4a7c59;">Faktúra č. ${invoiceNumber}</h2>
              ${invoiceHtml}
            </div>
          `
        })
      });
      
      // 2. Notifikácia pre vás
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Frnk brnk objednávky <${FROM_EMAIL}>`,
          to: NOTIFY_EMAIL,
          subject: `🎉 Nová objednávka #${invoiceNumber} - ${quantity}x kniha - ${amount} €`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4a7c59;">Nová objednávka!</h1>
              <p><strong>Faktúra č.:</strong> ${invoiceNumber}</p>
              <div style="background: #f9f6ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Zákazník</h3>
                <p><strong>Meno:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Telefón:</strong> ${customerPhone}</p>
              </div>
              <div style="background: #f9f6ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Objednávka</h3>
                <p><strong>Počet kusov:</strong> ${quantity}</p>
                <p><strong>Suma:</strong> ${amount} €</p>
                <p><strong>Stripe Payment ID:</strong> ${paymentIntent.id}</p>
              </div>
              <div style="background: #fde68a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📦 Packeta</h3>
                <p><strong>Výdajné miesto:</strong> ${packetaPoint}</p>
                <p><strong>Packeta ID:</strong> ${packetaId}</p>
              </div>
              <p><a href="https://dashboard.stripe.com/payments/${paymentIntent.id}" style="color: #4a7c59;">Zobraziť v Stripe →</a></p>
            </div>
          `
        })
      });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Webhook failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
