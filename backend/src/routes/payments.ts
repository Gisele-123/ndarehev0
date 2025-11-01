import { Router } from "express";
import { initializePesapalPayment, verifyPesapalPayment, verifyPesapalPaymentByReference } from "@/utils/pesapal";
import { prisma } from "../config/database";
import { sendEmail, emailTemplates } from "../utils/email";

const router = Router();


router.post("/pesapal", async (req, res) => {
  const { bookingId, amount, currency, customer, payment_type } = req.body;

  if (!bookingId || !amount || !currency || !customer) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  const tx_ref = `BOOK-${bookingId}-${Date.now()}`;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking || !booking.user) {
      return res.status(404).json({ success: false, message: "Booking or user not found" });
    }

    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const redirect_url = `${baseUrl}/api/payments/pesapal/callback`;

    const payload = {
      tx_ref,
      amount,
      currency,
      payment_type: payment_type || "card",
      redirect_url,
      customer: {
        email: customer.email,
        name: customer.name,
        phonenumber: customer.phonenumber,
      },
      meta: { bookingId },
    };

    const pesapalRes = await initializePesapalPayment(payload);

    if (!pesapalRes?.success || !pesapalRes?.data?.redirect_url) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Pesapal payment link",
        error: pesapalRes?.error || "Unknown error",
      });
    }

    await prisma.payment.create({
      data: {
        booking: { connect: { id: bookingId } },
        user: { connect: { id: booking.user.id } },
        method: payment_type === "mobilemoney" ? "MOBILE_MONEY" : "CARD",
        transactionId: pesapalRes.data.merchant_reference,
        amount,
        currency,
        status: "PENDING",
        gatewayResponse: {
          set: { 
            provider: "pesapal", 
            tx_ref: pesapalRes.data.merchant_reference, 
            order_tracking_id: pesapalRes.data.order_tracking_id 
          },
        },
      },
    });

    return res.json({
      success: true,
      link: pesapalRes.data.redirect_url,
      tx_ref: pesapalRes.data.merchant_reference,
    });
  } catch (error: any) {
    console.error("Pesapal create session error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.message || "Unknown error",
    });
  }
});


router.get("/pesapal/callback", async (req, res) => {
  const { pesapal_merchant_reference, pesapal_transaction_tracking_id } = req.query as { 
    pesapal_merchant_reference?: string; 
    pesapal_transaction_tracking_id?: string; 
  };

  console.log("[Payment Verify] Pesapal callback:", { pesapal_merchant_reference, pesapal_transaction_tracking_id });

  try {
    let verificationData;

    if (pesapal_transaction_tracking_id) {
      verificationData = await verifyPesapalPayment(pesapal_transaction_tracking_id);
    } else if (pesapal_merchant_reference) {
      verificationData = await verifyPesapalPaymentByReference(pesapal_merchant_reference);
    } else {
      return res.status(400).send("Missing pesapal_merchant_reference or pesapal_transaction_tracking_id");
    }

    const paymentStatus = verificationData?.success ? verificationData.data?.payment_status : null;
    const bookingId = pesapal_merchant_reference ? pesapal_merchant_reference.split('-')[1] : null;

    if (paymentStatus === "COMPLETED" && bookingId) {
      await prisma.payment.update({
        where: { transactionId: String(pesapal_merchant_reference) },
        data: { status: "COMPLETED" },
      });

      const updated = await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          status: "CONFIRMED",
          isConfirmed: true,
          confirmedAt: new Date(),
        },
        include: { user: true, accommodation: true, transportation: true, tour: true },
      });

      if (updated.user) {
        const serviceName =
          updated.accommodation?.name ||
          updated.transportation?.name ||
          updated.tour?.name ||
          "Service";

        const { subject, html } = emailTemplates.bookingConfirmation(
          updated.user.firstName,
          {
            id: updated.id,
            serviceName,
            startDate: updated.startDate,
            totalAmount: updated.totalAmount,
            currency: updated.currency,
          }
        );

        sendEmail(updated.user.email, subject, html).catch(() => {});
      }

      const redirectUrl =
        process.env.NODE_ENV === "production"
          ? `${process.env.BASE_URL}/booking/success?bookingId=${bookingId}`
          : `https://ndarehe.com/booking/success?bookingId=${bookingId}`;

      return res.redirect(redirectUrl);
    }

    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.BASE_URL}/booking/failed`
        : `https://ndarehe.com/booking/failed`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Pesapal verify error:", error);
    return res.status(500).send("Verification failed");
  }
});


router.get("/pesapal/verify-json", async (req, res) => {
  const { tx_ref } = req.query as { tx_ref?: string };

  if (!tx_ref)
    return res.status(400).json({ success: false, message: "tx_ref is required", paid: false });

  try {
    const payment = await prisma.payment.findFirst({
      where: { transactionId: String(tx_ref) },
    });

    if (!payment) {
      return res.json({ success: true, paid: false, message: "No payment yet" });
    }

    const pesapalRes = await verifyPesapalPaymentByReference(String(tx_ref));
    const paymentStatus = pesapalRes?.success ? pesapalRes.data?.payment_status : null;
    const bookingId = tx_ref ? tx_ref.split('-')[1] : null;

    if (paymentStatus === "COMPLETED" && bookingId) {
      await prisma.payment.update({
        where: { transactionId: String(tx_ref) },
        data: { status: "COMPLETED" },
      });

      const updated = await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          status: "CONFIRMED",
          isConfirmed: true,
          confirmedAt: new Date(),
        },
        include: { user: true, accommodation: true, transportation: true, tour: true },
      });

      if (updated.user) {
        const serviceName =
          updated.accommodation?.name ||
          updated.transportation?.name ||
          updated.tour?.name ||
          "Service";

        const { subject, html } = emailTemplates.bookingConfirmation(
          updated.user.firstName,
          {
            id: updated.id,
            serviceName,
            startDate: updated.startDate,
            totalAmount: updated.totalAmount,
            currency: updated.currency,
          }
        );

        sendEmail(updated.user.email, subject, html).catch(() => {});
      }

      return res.json({ success: true, paid: true, bookingId });
    }

    return res.json({ success: true, paid: false, bookingId });
  } catch (error) {
    console.error("Pesapal verify-json error:", error);
    return res.json({ success: true, paid: false, message: "Verification failed" });
  }
});

export default router;