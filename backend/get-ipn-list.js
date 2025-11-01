const axios = require('axios');

// Get the list of registered IPN URLs and their IDs
const PESAPAL_CONSUMER_KEY = 'PDCo+aBZTanvNb2fm+HaUbeHEc71jQTx';
const PESAPAL_CONSUMER_SECRET = 'l0eOoKNJfstIpy9gGorOOxTc/zg=';
const PESAPAL_BASE_URL = 'https://pay.pesapal.com';

async function getIPNList() {
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

    // Step 2: Get IPN list
    console.log('📋 Getting IPN list...');
    
    const ipnResponse = await axios.get(`${PESAPAL_BASE_URL}/v3/api/URLSetup/GetIPNList`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ IPN list retrieved successfully!');
    console.log('📊 IPN URLs:', JSON.stringify(ipnResponse.data, null, 2));
    
    // Find the notification ID for your domain
    const ipnUrls = ipnResponse.data;
    if (ipnUrls && ipnUrls.length > 0) {
      const yourIPN = ipnUrls.find(ipn => 
        ipn.url && ipn.url.includes('ndarehe.com')
      );
      
      if (yourIPN) {
        console.log('\n🎯 Found your IPN URL:');
        console.log('📋 Notification ID:', yourIPN.ipn_id);
        console.log('🔗 URL:', yourIPN.url);
        console.log('✅ Status:', yourIPN.status);
      } else {
        console.log('❌ No IPN URL found for ndarehe.com');
      }
    }

    return ipnUrls;

  } catch (error) {
    console.error('❌ Failed to get IPN list:', error.response?.data || error.message);
    return null;
  }
}

// Run the function
getIPNList().catch(console.error);