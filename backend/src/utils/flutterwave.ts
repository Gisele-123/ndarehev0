import axios from "axios";

const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

if (!FLW_PUBLIC_KEY || !FLW_SECRET_KEY) {
  console.error("[Flutterwave] ❌ Missing environment variables:");
  console.error("  FLW_PUBLIC_KEY:", FLW_PUBLIC_KEY ? "✅ Set" : "❌ Missing");
  console.error("  FLW_SECRET_KEY:", FLW_SECRET_KEY ? "✅ Set" : "❌ Missing");
  throw new Error(
    "Flutterwave keys are missing! Set FLW_PUBLIC_KEY and FLW_SECRET_KEY in your .env file."
  );
}

console.log("[Flutterwave] ✅ Environment loaded");
console.log("[Flutterwave] Public Key:", FLW_PUBLIC_KEY.substring(0, 10) + "...");
console.log("[Flutterwave] Secret Key:", FLW_SECRET_KEY.substring(0, 10) + "...");

const FLW_API_BASE = "https://api.flutterwave.com/v3";

export interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_type?: "card" | "mobilemoney" | "ussd";
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
    console.log("\n[Flutterwave v3] 🚀 Initializing payment...");
    console.log("[Flutterwave v3] Payload:", JSON.stringify(payload, null, 2));

    // Basic validation
    if (!payload.tx_ref || !payload.amount || !payload.currency || !payload.customer) {
      throw new Error("Invalid payload: missing required fields.");
    }
    if (payload.amount <= 0) {
      throw new Error("Invalid amount: must be greater than 0.");
    }

    // For v3, use payment_type instead of payment_options
    const payment_type = payload.payment_type || "card";

    const requestPayload = {
      tx_ref: payload.tx_ref,
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: payload.redirect_url,
      payment_type, // v3 uses payment_type
      customer: {
        email: payload.customer.email,
        name: payload.customer.name,
        phonenumber: payload.customer.phonenumber || "+250788000000", // Default Rwanda number
      },
      customizations: payload.customizations || {
        title: "Ndarehe Booking Payment",
        description: "Secure checkout powered by Flutterwave",
        logo: "https://ndarehe.com/logo.png", // Add your logo if available
      },
      meta: payload.meta || {},
    };

    console.log("[Flutterwave v3] Sending payload to Flutterwave:", JSON.stringify(requestPayload, null, 2));

    const { data } = await axios.post(`${FLW_API_BASE}/payments`, requestPayload, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    console.log("[Flutterwave v3] ✅ API Response:", JSON.stringify(data, null, 2));

    // v3 response structure
    const link = data?.data?.link;
    if (!link) {
      console.error("[Flutterwave v3] ❌ Payment link missing in response:", data);
      throw new Error("Failed to generate payment link.");
    }

    console.log(`[Flutterwave v3] ✅ Payment link created: ${link}`);
    console.log(`[Flutterwave v3] 💳 Transaction reference: ${payload.tx_ref}`);

    return {
      status: true,
      link,
      reference: payload.tx_ref,
      raw: data,
    };
  } catch (error: any) {
    console.error("\n[Flutterwave v3] ❌ Payment initialization failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", JSON.stringify(error.response.data, null, 2));
      console.error("→ Status:", error.response.status);
      console.error("→ Headers:", error.response.headers);
    }
    throw error;
  }
};

export const verifyPayment = async (transactionId: string) => {
  try {
    console.log(`\n[Flutterwave v3] 🔍 Verifying payment for transaction: ${transactionId}`);

    // v3 uses transaction ID for verification, not tx_ref
    const { data } = await axios.get(`${FLW_API_BASE}/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("[Flutterwave v3] ✅ Verification result:", {
      status: data?.status,
      amount: data?.data?.amount,
      currency: data?.data?.currency,
      reference: data?.data?.tx_ref,
    });

    return data;
  } catch (error: any) {
    console.error("\n[Flutterwave v3] ❌ Verification failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", error.response.data);
      console.error("→ Status:", error.response.status);
    }
    throw error;
  }
};

// Additional function to verify by reference if needed
export const verifyPaymentByReference = async (tx_ref: string) => {
  try {
    console.log(`\n[Flutterwave v3] 🔍 Verifying payment by reference: ${tx_ref}`);

    const { data } = await axios.get(`${FLW_API_BASE}/transactions/verify_by_reference`, {
      params: { tx_ref },
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("[Flutterwave v3] ✅ Verification by reference result:", {
      status: data?.status,
      amount: data?.data?.amount,
      currency: data?.data?.currency,
    });

    return data;
  } catch (error: any) {
    console.error("\n[Flutterwave v3] ❌ Verification by reference failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", error.response.data);
      console.error("→ Status:", error.response.status);
    }
    throw error;
  }
};