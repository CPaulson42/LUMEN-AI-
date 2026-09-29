// NOTE: Never hardcode API keys in the repository
// Use environment variables instead

require('dotenv').config({ path: '.env.local' });

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listPrices() {
  try {
    const prices = await stripe.prices.list({
      limit: 10,
      active: true,
      expand: ['data.product']
    });

    console.log("Found " + prices.data.length + " active prices:");
    prices.data.forEach(price => {
      console.log(`Product: ${price.product.name} | Price ID: ${price.id} | Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
    });
  } catch (e) {
    console.error("Error fetching prices:", e.message);
  }
}

listPrices();
