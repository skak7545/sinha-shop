const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = JSON.parse(event.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Missing fields' })
      };
    }

    // Verify signature using HMAC-SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Payment verified!' })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Signature mismatch' })
      };
    }
  } catch (err) {
    console.error('Verify error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Verification failed' })
    };
  }
};
