import Flutterwave from "flutterwave-node-v3";
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


const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);
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
  meta?: Record<string, any>;
}


export const initializePayment = async (payload: FlutterwavePaymentPayload) => {
  try {
    console.log("\n[Flutterwave] 🚀 Initializing payment...");
    console.log("[Flutterwave] Payload Summary:", {
      tx_ref: payload.tx_ref,
      amount: payload.amount,
      currency: payload.currency,
      email: payload.customer.email,
      name: payload.customer.name,
      phone: payload.customer.phonenumber,
      type: payload.payment_type,
    });

  
    if (!payload.tx_ref || !payload.amount || !payload.currency || !payload.customer) {
      throw new Error("Invalid payload: missing required fields.");
    }
    if (payload.amount <= 0) {
      throw new Error("Invalid amount: must be greater than 0.");
    }


    const wantsMoMo = payload.payment_type === "mobilemoney" || !!payload.customer.phonenumber;
    const payment_options = wantsMoMo ? "mobilemoneyrw" : "card";

    const requestPayload = {
      tx_ref: payload.tx_ref,
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: payload.redirect_url,
      customer: payload.customer,
      meta: payload.meta || {},
      payment_options,
      customizations: {
        title: "Ndarehe Booking Payment",
        description: "Secure checkout powered by Flutterwave",
      },
    };


    const { data } = await axios.post(`${FLW_API_BASE}/payments`, requestPayload, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });


    const link = data?.data?.link || data?.link;
    if (!link) {
      console.error("[Flutterwave] ❌ Payment link missing in response:", data);
      throw new Error("Failed to generate payment link.");
    }

    console.log(`[Flutterwave] ✅ Payment link created: ${link}`);
    console.log(`[Flutterwave] 💳 Transaction reference: ${payload.tx_ref}`);

    return {
      status: true,
      link,
      reference: payload.tx_ref,
      raw: data,
    };
  } catch (error: any) {
    console.error("\n[Flutterwave] ❌ Payment initialization failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", error.response.data);
      console.error("→ Status:", error.response.status);
    }
    throw error;
  }
};


export const verifyPayment = async (tx_ref: string) => {
  try {
    console.log(`\n[Flutterwave] 🔍 Verifying payment for tx_ref: ${tx_ref}`);

    const { data } = await axios.get(`${FLW_API_BASE}/transactions/verify_by_reference`, {
      params: { tx_ref },
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("[Flutterwave] ✅ Verification result:", {
      status: data?.status,
      chargecode: data?.data?.processor_response,
      amount: data?.data?.amount,
      currency: data?.data?.currency,
      reference: data?.data?.tx_ref,
    });

    return data;
  } catch (error: any) {
    console.error("\n[Flutterwave] ❌ Verification failed:");
    console.error("→ Message:", error.message || error);
    if (error.response) {
      console.error("→ Response data:", error.response.data);
      console.error("→ Status:", error.response.status);
    }
    throw error;
  }
};
