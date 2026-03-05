export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const {
      name, email, phone, quantity,
      delivery_type, delivery_country,
      packeta_point_id, packeta_point_name,
      address_street, address_zip, address_city,
      shipping_price, total
    } = data;

    if (!name || !email || !phone) {
      return Response.json({ error: 'Vyplňte všetky povinné údaje' }, { status: 400 });
    }

    // Validácia doručenia
    if (delivery_type === 'pickup' && !packeta_point_id) {
      return Response.json({ error: 'Vyberte výdajné miesto' }, { status: 400 });
    }
    if (delivery_type === 'address' && (!address_street || !address_zip || !address_city)) {
      return Response.json({ error: 'Vyplňte adresu doručenia' }, { status: 400 });
    }

    if (!total || total <= 0) {
      return Response.json({ error: 'Neplatná suma' }, { status: 400 });
    }

    const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

    // Vytvorenie PaymentIntent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'amount': Math.round(total * 100).toString(),
        'currency': 'eur',
        'description': `Frnk brnk do sveta - ${quantity}ks`,
        'receipt_email': email,
        'metadata[customer_name]': name,
        'metadata[customer_email]': email,
        'metadata[customer_phone]': phone,
        'metadata[quantity]': quantity.toString(),
        'metadata[shipping_price]': shipping_price.toString(),
        'metadata[delivery_type]': delivery_type || 'pickup',
        'metadata[delivery_country]': delivery_country || '',
        'metadata[packeta_point_id]': packeta_point_id || '',
        'metadata[packeta_point_name]': packeta_point_name || '',
        'metadata[address_street]': address_street || '',
        'metadata[address_zip]': address_zip || '',
        'metadata[address_city]': address_city || ''
      })
    });

    const paymentIntent = await stripeResponse.json();

    if (paymentIntent.error) {
      return Response.json({ error: paymentIntent.error.message }, { status: 400 });
    }

    return Response.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    return Response.json({ error: 'Interná chyba servera' }, { status: 500 });
  }
}
