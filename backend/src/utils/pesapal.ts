import axios from "axios";
import crypto from "crypto";

// Load environment variables
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_ENVIRONMENT = process.env.PESAPAL_ENVIRONMENT || "live";

console.log("[Pesapal] ✅ Environment loaded");
console.log("[Pesapal] Consumer Key:", PESAPAL_CONSUMER_KEY?.substring(0, 10) + "...");
console.log("[Pesapal] Consumer Secret:", PESAPAL_CONSUMER_SECRET?.substring(0, 10) + "...");
console.log("[Pesapal] Environment:", PESAPAL_ENVIRONMENT);

const PESAPAL_BASE_URL = PESAPAL_ENVIRONMENT === "live" 
  ? "https://pay.pesapal.com" 
  : "https://cybqa.pesapal.com";

console.log("[Pesapal] Using base URL:", PESAPAL_BASE_URL);

export interface PesapalPaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_type?: "card" | "mobilemoney" | "bank";
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

// Get access token for API 3.0
const getAccessToken = async (): Promise<string> => {
  try {
    console.log("[Pesapal] 🔑 Getting access token...");
    
    const tokenParams = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    };

    const response = await axios.post(`${PESAPAL_BASE_URL}/v3/api/Auth/RequestToken`, tokenParams, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    if (response.data.error) {
      throw new Error(`Token error: ${response.data.error.message || 'Unknown error'}`);
    }

    console.log("[Pesapal] ✅ Access token received");
    return response.data.token;
    
  } catch (error: any) {
    console.error("[Pesapal] ❌ Token error:", error.response?.data || error.message);
    throw new Error(`Failed to get access token: ${error.response?.data?.error?.message || error.message}`);
  }
};

export const initializePesapalPayment = async (payload: PesapalPaymentPayload) => {
  try {
    console.log("\n[Pesapal] 🚀 Initializing payment...");
    console.log("[Pesapal] Payload:", JSON.stringify(payload, null, 2));

    // Basic validation
    if (!payload.tx_ref || !payload.amount || !payload.currency || !payload.customer) {
      throw new Error("Invalid payload: missing required fields.");
    }
    if (payload.amount <= 0) {
      throw new Error("Invalid amount: must be greater than 0.");
    }

    // Get access token
    const token = await getAccessToken();

    // Prepare order data for API 3.0
    const orderData = {
      id: payload.tx_ref,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.customizations?.description || "Ndarehe Booking Payment",
      callback_url: payload.redirect_url || `${process.env.BACKEND_URL}/api/payments/pesapal/callback`,
      notification_id: "dd06a8db-d529-4dc0-9fc5-db2ea4ed6a39", // Your registered IPN URL
      billing_address: {
        phone_number: payload.customer.phonenumber || "+250788000000",
        email_address: payload.customer.email,
        country_code: "RW",
        first_name: payload.customer.name.split(' ')[0] || 'Guest',
        middle_name: "",
        last_name: payload.customer.name.split(' ').slice(1).join(' ') || '',
        line_1: "Travel Booking",
        line_2: "",
        city: "Kigali",
        state: "Kigali",
        postal_code: "00000",
        zip_code: "00000"
      }
    };

    console.log("[Pesapal] 📝 Order data:", JSON.stringify(orderData, null, 2));

    // Submit order request
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

    console.log("[Pesapal] ✅ Payment initialized successfully");
    console.log("[Pesapal] Response:", response.data);

    return {
      success: true,
      data: {
        order_tracking_id: response.data.order_tracking_id,
        merchant_reference: response.data.merchant_reference,
        redirect_url: response.data.redirect_url,
        status: response.data.status
      }
    };

  } catch (error: any) {
    console.error("[Pesapal] ❌ Payment initialization error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyPesapalPayment = async (orderTrackingId: string) => {
  try {
    console.log(`\n[Pesapal] 🔍 Verifying payment: ${orderTrackingId}`);

    // Get access token
    const token = await getAccessToken();

    // Query payment status
    const response = await axios.get(`${PESAPAL_BASE_URL}/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 20000,
    });

    if (response.data.error) {
      throw new Error(`Verification error: ${response.data.error.message || 'Unknown error'}`);
    }

    console.log("[Pesapal] ✅ Payment verification successful");
    console.log("[Pesapal] Status:", response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error: any) {
    console.error("[Pesapal] ❌ Payment verification error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyPesapalPaymentByReference = async (tx_ref: string) => {
  try {
    console.log(`\n[Pesapal] 🔍 Verifying payment by reference: ${tx_ref}`);

    // Get access token
    const token = await getAccessToken();

    // Query payment status by merchant reference
    const response = await axios.get(`${PESAPAL_BASE_URL}/v3/api/Transactions/GetTransactionStatus?merchantReference=${tx_ref}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 20000,
    });

    if (response.data.error) {
      throw new Error(`Verification error: ${response.data.error.message || 'Unknown error'}`);
    }

    console.log("[Pesapal] ✅ Payment verification by reference successful");
    console.log("[Pesapal] Status:", response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error: any) {
    console.error("[Pesapal] ❌ Payment verification by reference error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Register IPN URL (required for production)
export const registerIPNUrl = async (ipnUrl: string) => {
  try {
    console.log(`\n[Pesapal] 📝 Registering IPN URL: ${ipnUrl}`);

    // Get access token
    const token = await getAccessToken();

    const ipnData = {
      url: ipnUrl,
      ipn_notification_type: "GET"
    };

    const response = await axios.post(`${PESAPAL_BASE_URL}/v3/api/URLSetup/RegisterIPN`, ipnData, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 20000,
    });

    if (response.data.error) {
      throw new Error(`IPN registration error: ${response.data.error.message || 'Unknown error'}`);
    }

    console.log("[Pesapal] ✅ IPN URL registered successfully");
    console.log("[Pesapal] Notification ID:", response.data.ipn_id);

    return {
      success: true,
      data: response.data
    };

  } catch (error: any) {
    console.error("[Pesapal] ❌ IPN registration error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};