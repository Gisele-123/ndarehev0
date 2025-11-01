const axios = require('axios');

// Test with production URL
const BASE_URL = 'https://ndarehe.com'; // Use your production URL

async function testProductionPayment() {
  console.log('🧪 Testing Pesapal with Production URL...\n');
  
  try {
    // Test payment initialization with production URL
    const paymentData = {
      bookingId: 'test-booking-' + Date.now(),
      amount: 100,
      currency: 'RWF',
      payment_type: 'card',
      customer: {
        name: 'Test User',
        email: 'test@ndarehe.com',
        phonenumber: '+250788000000'
      }
    };

    console.log('💳 Testing payment initialization...');
    const response = await axios.post(`${BASE_URL}/api/payments/pesapal`, paymentData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    console.log('✅ Payment response:', response.data);
    
    if (response.data.success && response.data.link) {
      console.log('🎉 Payment URL generated successfully!');
      console.log('🔗 Payment URL:', response.data.link);
      console.log('📋 Transaction Reference:', response.data.tx_ref);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProductionPayment().catch(console.error);