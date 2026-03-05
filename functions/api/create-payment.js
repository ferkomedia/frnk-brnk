export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { name, email, phone, quantity, packeta_point_id, packeta_point_name, shipping_price, total } = data;
    
    if (!name || !email || !phone || !packeta_point_id) {
      return new Response(JSON.stringify({ error: 'Vyplňte všetky povinné údaje' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
    
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'payment',
        'success_url': 'https://frnk-brnk.sk/dakujeme?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url': 'https://frnk-brnk.sk/#objednat',
        'customer_email': email,
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': 'Frnk brnk do sveta',
        'line_items[0][price_data][product_data][description]': `Detská kniha - ${quantity}ks`,
        'line_items[0][price_data][unit_amount]': Math.round((total - shipping_price) / quantity * 100).toString(),
        'line_items[0][quantity]': quantity.toString(),
        'line_items[1][price_data][currency]': 'eur',
        'line_items[1][price_data][product_data][name]': 'Doručenie Packeta',
        'line_items[1][price_data][product_data][description]': packeta_point_name,
        'line_items[1][price_data][unit_amount]': Math.round(shipping_price * 100).toString(),
        'line_items[1][quantity]': '1',
        'metadata[customer_name]': name,
        'metadata[customer_phone]': phone,
        'metadata[packeta_point_id]': packeta_point_id,
        'metadata[packeta_point_name]': packeta_point_name,
        'metadata[quantity]': quantity.toString()
      })
    });
    
    const session = await stripeResponse.json();
    
    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Interná chyba servera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
