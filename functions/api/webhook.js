export async function onRequestPost(context) {
  const { request, env } = context;
  
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const FROM_EMAIL = 'objednavky@ferkomedia.sk';
  const NOTIFY_EMAIL = 'info@ferkomedia.sk';
  
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
      const packetaPoint = metadata.packeta_point_name;
      const packetaId = metadata.packeta_point_id;
      
      // 1. Email zákazníkovi
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Frnk brnk do sveta <${FROM_EMAIL}>`,
          to: customerEmail,
          subject: 'Potvrdenie objednávky - Frnk brnk do sveta',
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4a7c59;">Ďakujeme za objednávku!</h1>
              <p>Dobrý deň ${customerName},</p>
              <p>Vaša objednávka bola úspešne prijatá a platba prebehla v poriadku.</p>
              <div style="background: #f9f6ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e2d;">Detaily objednávky</h3>
                <p><strong>Kniha:</strong> Frnk brnk do sveta</p>
                <p><strong>Počet kusov:</strong> ${quantity}</p>
                <p><strong>Celková suma:</strong> ${amount} €</p>
              </div>
              <div style="background: #f9f6ef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e2d;">Doručenie</h3>
                <p><strong>Výdajné miesto Packeta:</strong><br>${packetaPoint}</p>
                <p>O odoslaní balíka vás budeme informovať emailom. Po doručení na výdajné miesto dostanete SMS s kódom na vyzdvihnutie.</p>
              </div>
              <p>Ak máte akékoľvek otázky, neváhajte nás kontaktovať na tento email.</p>
              <p>S pozdravom,<br><strong>Tím Frnk brnk do sveta</strong></p>
              <hr style="border: none; border-top: 1px solid #d4d9d5; margin: 30px 0;">
              <p style="font-size: 12px; color: #5a6b5c;">FerkoMedia Video marketing | frnk-brnk.sk</p>
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
          subject: `🎉 Nová objednávka - ${quantity}x kniha - ${amount} €`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4a7c59;">Nová objednávka!</h1>
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
