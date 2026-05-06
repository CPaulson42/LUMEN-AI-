require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

async function main() {
  const product = await stripe.products.create({ name: 'Partner' });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 99900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log('Partner Price ID: ' + price.id);
  fs.appendFileSync('.env.local', 'NEXT_PUBLIC_STRIPE_PRICE_ID_PARTNER="' + price.id + '"\n');
  console.log('Appended to .env.local');
}

main().catch(console.error);
