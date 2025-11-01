const axios = require('axios');

// Register IPN URL with Pesapal
const PESAPAL_CONSUMER_KEY = 'PDCo+aBZTanvNb2fm+HaUbeHEc71jQTx';
const PESAPAL_CONSUMER_SECRET = 'l0eOoKNJfstIpy9gGorOOxTc/zg=';
const PESAPAL_BASE_URL = 'https://pay.pesapal.com';

async function registerIPN() {
  try {
    console.log('🔑 Getting access token...');
    
    // Step 1: Get access token
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

    // Step 2: Register IPN URL
    console.log('📝 Registering IPN URL...');
    
    const ipnData = {
      url: 'https://ndarehe.com/api/payments/pesapal/ipn', // Your production IPN URL
      ipn_notification_type: 'GET'
    };

    const ipnResponse = await axios.post(`${PESAPAL_BASE_URL}/v3/api/URLSetup/RegisterIPN`, ipnData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ IPN URL registered successfully!');
    console.log('📋 Notification ID:', ipnResponse.data.ipn_id);
    console.log('🔗 IPN URL:', ipnResponse.data.url);
    
    return ipnResponse.data.ipn_id;

  } catch (error) {
    console.error('❌ IPN registration failed:', error.response?.data || error.message);
    return null;
  }
}

// Run the registration
registerIPN().catch(console.error);