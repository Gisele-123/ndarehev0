const axios = require('axios');

// Test payment with correct notification ID
const PESAPAL_CONSUMER_KEY = 'PDCo+aBZTanvNb2fm+HaUbeHEc71jQTx';
const PESAPAL_CONSUMER_SECRET = 'l0eOoKNJfstIpy9gGorOOxTc/zg=';
const PESAPAL_BASE_URL = 'https://pay.pesapal.com';

async function testPaymentWithCorrectIPN() {
  try {
    console.log('🧪 Testing Payment with Correct IPN ID...\n');
    
    // Step 1: Get access token
    console.log('🔑 Getting access token...');
    const tokenResponse = await axios.post(`${PESAPAL_BASE_URL}/v3/api/Auth/RequestToken`, {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const token = tokenResponse.data.token;
    console.log('✅ Access token received');

    // Step 2: Test payment with correct IPN ID
    console.log('\n💳 Testing payment initialization...');
    
    const orderData = {
      id: "TEST-" + Date.now(),
      currency: "USD",
      amount: 2,
      description: "Test Payment for Ndarehe",
      callback_url: "https://ndarehe.com/api/payments/pesapal/callback",
      notification_id: "dd06a8db-d529-4dc0-9fc5-db2ea4ed6a39", // Your correct IPN ID
      billing_address: {
        phone_number: "+250788000000",
        email_address: "sangwaassia@gmail.com",
        country_code: "RW",
        first_name: "Sangwa",
        middle_name: "",
        last_name: "Assia",
        line_1: "Travel Booking",
        line_2: "",
        city: "Kigali",
        state: "Kigali",
        postal_code: "00000",
        zip_code: "00000"
      }
    };

    console.log('📝 Order data:', JSON.stringify(orderData, null, 2));

    const response = await axios.post(`${PESAPAL_BASE_URL}/v3/api/Transactions/SubmitOrderRequest`, orderData, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 20000,
    });

    if (response.data.error) {
      throw new Error(`Payment error: ${response.data.error.message || 'Unknown error'}`);
    }

    console.log('\n🎉 Payment initialization successful!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.redirect_url) {
      console.log('\n🔗 Payment URL:', response.data.redirect_url);
      console.log('📋 Order Tracking ID:', response.data.order_tracking_id);
      console.log('📋 Merchant Reference:', response.data.merchant_reference);
      console.log('\n💡 You can now test the payment flow by opening the URL above!');
    }

  } catch (error) {
    console.error('❌ Payment test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentWithCorrectIPN().catch(console.error);