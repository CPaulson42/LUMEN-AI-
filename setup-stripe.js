require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

async function main() {
  const products = [
    { name: 'Starter', price: 9900 },
    { name: 'Professional', price: 19900 },
    { name: 'Enterprise', price: 49900 },
  ];

  let envAdditions = `\n`;
  for (const prod of products) {
    const product = await stripe.products.create({ name: prod.name });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: prod.price,
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    envAdditions += `NEXT_PUBLIC_STRIPE_PRICE_ID_${prod.name.toUpperCase()}="${price.id}"\n`;
    console.log(`Created ${prod.name} Price ID: ${price.id}`);
  }

  fs.appendFileSync('.env.local', envAdditions);
  console.log('Appended price IDs to .env.local');
}

main().catch(console.error);
