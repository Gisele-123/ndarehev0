import axios from "axios";

const DPO_PUBLIC_KEY = process.env.DPO_PUBLIC_KEY;
const DPO_PRIVATE_KEY = process.env.DPO_PRIVATE_KEY;
const DPO_SERVICE = process.env.DPO_SERVICE || "ndarehe";

if (!DPO_PUBLIC_KEY || !DPO_PRIVATE_KEY) {
  console.error("[DPO] ❌ Missing environment variables:");
  console.error("  DPO_PUBLIC_KEY:", DPO_PUBLIC_KEY ? "✅ Set" : "❌ Missing");
  console.error("  DPO_PRIVATE_KEY:", DPO_PRIVATE_KEY ? "✅ Set" : "❌ Missing");
  throw new Error(
    "DPO keys are missing! Set DPO_PUBLIC_KEY and DPO_PRIVATE_KEY in your .env file."
  );
}

console.log("[DPO] ✅ Environment loaded");
console.log("[DPO] Public Key:", DPO_PUBLIC_KEY.substring(0, 10) + "...");
console.log("[DPO] Private Key:", DPO_PRIVATE_KEY.substring(0, 10) + "...");

const DPO_API_BASE = "https://secure.3gdirectpay.com";

export interface DPOPaymentPayload {
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

export const initializeDPOPayment = async (payload: DPOPaymentPayload) => {
  try {
    console.log("\n[DPO] 🚀 Initializing payment...");
    console.log("[DPO] Payload:", JSON.stringify(payload, null, 2));

    // Basic validation
    if (!payload.tx_ref || !payload.amount || !payload.currency || !payload.customer) {
      throw new Error("Invalid payload: missing required fields.");
    }
    if (payload.amount <= 0) {
      throw new Error("Invalid amount: must be greater than 0.");
    }

    // DPO API payload structure
    const requestPayload = {
      company_token: DPO_PRIVATE_KEY,
      service: DPO_SERVICE,
      service_type: payload.payment_type === "mobilemoney" ? "mobilemoney" : "card",
      service_description: payload.customizations?.description || "Ndarehe Booking Payment",
      service_date: new Date().toISOString().split('T')[0],
      currency: payload.currency,
      amount: payload.amount,
      reference: payload.tx_ref,
      customer_phone: payload.customer.phonenumber || "+250788000000",
      customer_email: payload.customer.email,
      customer_first_name: payload.customer.name.split(' ')[0] || 'Guest',
      customer_last_name: payload.customer.name.split(' ').slice(1).join(' ') || '',
      redirect_url: payload.redirect_url,
      back_url: payload.redirect_url,
      transaction_fee: 0, // DPO handles fees
      test_mode: process.env.NODE_ENV !== "production" ? "1" : "0"
    };

    console.log("[DPO] Sending payload to DPO:", JSON.stringify(requestPayload, null, 2));

    const { data } = await axios.post(`${DPO_API_BASE}/API/v6/`, requestPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    console.log("[DPO] ✅ API Response:", JSON.stringify(data, null, 2));

    // DPO response structure
    const link = data?.TransToken ? `${DPO_API_BASE}/payv2.php?ID=${data.TransToken}` : null;
    if (!link) {
      console.error("[DPO] ❌ Payment link missing in response:", data);
      throw new Error("Failed to generate payment link.");
    }

    console.log(`[DPO] ✅ Payment link created: ${link}`);
    console.log(`[DPO] 💳 Transaction reference: ${payload.tx_ref}`);

    return {
      status: true,
      link,
      reference: payload.tx_ref,
      trans_token: data.TransToken,
      raw: data,
    };
  } catch (error: any) {
    console.error("\n[DPO] ❌ Payment initialization failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", JSON.stringify(error.response.data, null, 2));
      console.error("→ Status:", error.response.status);
      console.error("→ Headers:", error.response.headers);
    }
    throw error;
  }
};

export const verifyDPOPayment = async (transactionId: string) => {
  try {
    console.log(`\n[DPO] 🔍 Verifying payment for transaction: ${transactionId}`);

    const { data } = await axios.get(`${DPO_API_BASE}/API/v6/`, {
      params: {
        company_token: DPO_PRIVATE_KEY,
        transaction_token: transactionId
      },
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("[DPO] ✅ Verification result:", {
      status: data?.Result,
      amount: data?.Amount,
      currency: data?.Currency,
      reference: data?.Reference,
    });

    return data;
  } catch (error: any) {
    console.error("\n[DPO] ❌ Verification failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", error.response.data);
      console.error("→ Status:", error.response.status);
    }
    throw error;
  }
};

// Additional function to verify by reference if needed
export const verifyDPOPaymentByReference = async (tx_ref: string) => {
  try {
    console.log(`\n[DPO] 🔍 Verifying payment by reference: ${tx_ref}`);

    const { data } = await axios.get(`${DPO_API_BASE}/API/v6/`, {
      params: {
        company_token: DPO_PRIVATE_KEY,
        reference: tx_ref
      },
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("[DPO] ✅ Verification by reference result:", {
      status: data?.Result,
      amount: data?.Amount,
      currency: data?.Currency,
    });

    return data;
  } catch (error: any) {
    console.error("\n[DPO] ❌ Verification by reference failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", error.response.data);
      console.error("→ Status:", error.response.status);
    }
    throw error;
  }
};