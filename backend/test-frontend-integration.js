const axios = require('axios');

// Test frontend integration with working amount
const BASE_URL = 'http://localhost:5000';

async function testFrontendIntegration() {
  try {
    console.log('🧪 Testing Frontend Integration with Working Amount...\n');
    
    // Test payment with $10 (should work)
    const paymentData = {
      bookingId: 'test-booking-' + Date.now(),
      amount: 10, // Reduced amount
      currency: 'USD',
      payment_type: 'card',
      customer: {
        name: 'Test User',
        email: 'test@ndarehe.com',
        phonenumber: '+250788000000'
      }
    };

    console.log('💳 Testing payment with $10...');
    console.log('📊 Payment data:', JSON.stringify(paymentData, null, 2));

    try {
      const paymentResponse = await axios.post(`${BASE_URL}/api/payments/pesapal`, paymentData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log('✅ Payment endpoint responded');
      console.log('📊 Status:', paymentResponse.status);
      console.log('📊 Success:', paymentResponse.data.success);
      
      if (paymentResponse.data.success) {
        console.log('\n🎉 Payment initialization successful!');
        console.log('🔗 Payment URL:', paymentResponse.data.link);
        console.log('📋 Transaction Reference:', paymentResponse.data.tx_ref);
        console.log('\n💡 You can now test the complete payment flow!');
      } else {
        console.log('⚠️  Payment failed:', paymentResponse.data.message);
      }

    } catch (error) {
      console.log('❌ Payment error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFrontendIntegration().catch(console.error);