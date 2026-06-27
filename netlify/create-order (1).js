const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, currency, receipt } = JSON.parse(event.body);

    if (!amount || amount < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount must be at least 100 paise (₹1)' })
      };
    }

    const order = await razorpay.orders.create({
      amount,
      currency: currency || 'INR',
      receipt: receipt || 'order_' + Date.now(),
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    };
  } catch (err) {
    console.error('Create order error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create order' })
    };
  }
};
