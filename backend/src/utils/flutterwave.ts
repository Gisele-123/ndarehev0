import axios from "axios";

// Validate environment variables
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_ENCRYPTION_KEY = process.env.FLW_ENCRYPTION_KEY;

if (!FLW_PUBLIC_KEY || !FLW_SECRET_KEY || !FLW_ENCRYPTION_KEY) {
  console.error('[Flutterwave] ❌ Missing environment variables:');
  console.error('[Flutterwave] FLW_PUBLIC_KEY:', FLW_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
  console.error('[Flutterwave] FLW_SECRET_KEY:', FLW_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.error('[Flutterwave] FLW_ENCRYPTION_KEY:', FLW_ENCRYPTION_KEY ? '✅ Set' : '❌ Missing');
  throw new Error('Flutterwave environment variables are not configured. Please set FLW_PUBLIC_KEY, FLW_SECRET_KEY, and FLW_ENCRYPTION_KEY in your .env file.');
}

console.log('[Flutterwave] ✅ Environment variables loaded successfully');
console.log('[Flutterwave] Public Key:', FLW_PUBLIC_KEY.substring(0, 10) + '...');
console.log('[Flutterwave] Secret Key:', FLW_SECRET_KEY.substring(0, 10) + '...');
console.log('[Flutterwave] Encryption Key:', FLW_ENCRYPTION_KEY.substring(0, 10) + '...');

// V4 API Base URL
const FLW_API_BASE = 'https://api.flutterwave.com/v3';

export interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  redirect_url?: string;
  customer: {
    email: string;
    phonenumber?: string;
    name: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, any>;
}

export const initializePayment = async (payload: FlutterwavePaymentPayload) => {
  try {
    console.log('[Flutterwave v4] 🚀 Initializing payment...');
    console.log('[Flutterwave v4] Payload:', {
      tx_ref: payload.tx_ref,
      amount: payload.amount,
      currency: payload.currency,
      customer_email: payload.customer.email,
      customer_name: payload.customer.name,
      payment_options: payload.payment_options,
      redirect_url: payload.redirect_url
    });

    // Validate payload
    if (!payload.tx_ref || !payload.amount || !payload.currency || !payload.customer) {
      throw new Error('Invalid payload: missing required fields');
    }
    if (payload.amount <= 0) {
      throw new Error('Invalid amount: must be greater than 0');
    }

    // Determine payment options for v4
    const payment_options = payload.payment_options || 'card,mobilemoneyrwanda';

    const requestPayload = {
      tx_ref: payload.tx_ref,
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: payload.redirect_url,
      payment_options,
      customer: payload.customer,
      meta: payload.meta || {},
      customizations: payload.customizations || {
        title: 'Ndarehe Booking Payment',
        description: 'Secure checkout powered by Flutterwave',
      },
    };

    // Call Flutterwave V4 REST API
    const { data } = await axios.post(
      `${FLW_API_BASE}/payments`,
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    console.log('[Flutterwave v4] Initialize response:', JSON.stringify(data, null, 2));

    if (data.status === 'success' && data.data?.link) {
      console.log(`[Flutterwave v4] ✅ Payment link generated successfully: ${data.data.link}`);
      console.log(`[Flutterwave v4] Transaction reference: ${payload.tx_ref}`);
      return data;
    } else {
      console.error('[Flutterwave v4] ❌ Payment initialization failed:', data.message);
      throw new Error(data.message || 'Failed to initialize payment');
    }
  } catch (error) {
    console.error("[Flutterwave v4] ❌ Initialize payment error:", error);

    if (axios.isAxiosError(error)) {
      console.error('[Flutterwave v4] Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Payment initialization failed');
      }
    }

    throw error;
  }
};

export const verifyPayment = async (transactionId: string) => {
  try {
    console.log(`[Flutterwave v4] Verifying payment for transaction: ${transactionId}`);

    // Verify by transaction ID (v4 uses transaction ID instead of tx_ref for verification)
    const { data } = await axios.get(
      `${FLW_API_BASE}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('[Flutterwave v4] Verification response:', JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      return data;
    } else {
      throw new Error(data.message || 'Verification failed');
    }
  } catch (error) {
    console.error("[Flutterwave v4] ❌ Verify payment error:", error);
    
    if (axios.isAxiosError(error)) {
      console.error('[Flutterwave v4] Axios verification error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    throw error;
  }
};

// New v4 function to verify by transaction reference
export const verifyPaymentByReference = async (tx_ref: string) => {
  try {
    console.log(`[Flutterwave v4] Verifying payment by reference: ${tx_ref}`);

    const { data } = await axios.get(
      `${FLW_API_BASE}/transactions/verify_by_reference`,
      {
        params: { tx_ref },
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('[Flutterwave v4] Verification by reference response:', JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      return data;
    } else {
      throw new Error(data.message || 'Verification failed');
    }
  } catch (error) {
    console.error("[Flutterwave v4] ❌ Verify payment by reference error:", error);
    
    if (axios.isAxiosError(error)) {
      console.error('[Flutterwave v4] Axios verification error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    throw error;
  }
};