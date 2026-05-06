const Stripe = require('stripe');
const stripe = new Stripe('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');

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
