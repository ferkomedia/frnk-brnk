// Cloudflare Pages Function pre Stripe Webhook
// Súbor: functions/api/webhook.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();
  
  // V produkcii by ste mali overiť webhook signature
  // Pre jednoduchosť tu len parsujeme event
  
  try {
    const event = JSON.parse(body);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Tu spracujete úspešnú platbu:
        // 1. Uložte objednávku do databázy
        // 2. Odošlite potvrdzovací email zákazníkovi
        // 3. Vytvorte Packeta zásielku
        // 4. Notifikujte administrátora
        
        console.log('Úspešná platba:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          customer_name: paymentIntent.metadata.customer_name,
          customer_email: paymentIntent.metadata.customer_email,
          packeta_point_id: paymentIntent.metadata.packeta_point_id,
        });
        
        // Príklad: Odoslanie emailu cez Resend alebo SendGrid
        // await sendOrderConfirmation(paymentIntent);
        
        // Príklad: Vytvorenie Packeta zásielky
        // await createPacketaShipment(paymentIntent);
        
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Neúspešná platba:', failedPayment.id);
        break;
        
      default:
        console.log(`Neznámy event typ: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Webhook error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Pomocná funkcia pre Packeta API (príklad)
async function createPacketaShipment(paymentIntent, env) {
  const packetaApiKey = env.PACKETA_API_KEY;
  const packetaApiPassword = env.PACKETA_API_PASSWORD;
  
  // Packeta API endpoint
  const url = 'https://www.zasilkovna.cz/api/rest';
  
  const shipmentData = {
    apiPassword: packetaApiPassword,
    packetAttributes: {
      number: paymentIntent.id,
      name: paymentIntent.metadata.customer_name.split(' ')[0],
      surname: paymentIntent.metadata.customer_name.split(' ').slice(1).join(' ') || '',
      email: paymentIntent.metadata.customer_email,
      phone: paymentIntent.metadata.customer_phone || '',
      addressId: paymentIntent.metadata.packeta_point_id,
      value: paymentIntent.amount / 100,
      weight: 0.3, // Váha knihy v kg
      eshop: 'frnk-brnk.sk',
    }
  };
  
  // Tu by išlo volanie Packeta API
  // const response = await fetch(url, { ... });
  
  return shipmentData;
}
