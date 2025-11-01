const axios = require('axios');

// Test with smaller amount to check limits
const PESAPAL_CONSUMER_KEY = 'PDCo+aBZTanvNb2fm+HaUbeHEc71jQTx';
const PESAPAL_CONSUMER_SECRET = 'l0eOoKNJfstIpy9gGorOOxTc/zg=';
const PESAPAL_BASE_URL = 'https://pay.pesapal.com';

async function testSmallAmount() {
  try {
    console.log('🧪 Testing with smaller amounts...\n');
    
    // Get access token
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

    // Test different amounts
    const testAmounts = [1, 5, 10, 25, 50];
    
    for (const amount of testAmounts) {
      console.log(`\n💳 Testing with $${amount}...`);
      
      try {
        const orderData = {
          id: "TEST-" + Date.now(),
          currency: "USD",
          amount: amount,
          description: `Test Payment $${amount}`,
          callback_url: "https://ndarehe.com/api/payments/pesapal/callback",
          notification_id: "dd06a8db-d529-4dc0-9fc5-db2ea4ed6a39",
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

        const response = await axios.post(`${PESAPAL_BASE_URL}/v3/api/Transactions/SubmitOrderRequest`, orderData, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          timeout: 10000,
        });

        if (response.data.error) {
          console.log(`❌ $${amount}: ${response.data.error.message}`);
        } else {
          console.log(`✅ $${amount}: SUCCESS!`);
          console.log(`🔗 Payment URL: ${response.data.redirect_url}`);
          break; // Stop at first successful amount
        }

      } catch (error) {
        console.log(`❌ $${amount}: ${error.response?.data?.error?.message || error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSmallAmount().catch(console.error);