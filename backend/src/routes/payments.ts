import { Router } from "express";
import { initializePayment, verifyPayment } from "@/utils/flutterwave";
// import { createCheckoutSession, retrieveSession } from "@/utils/stripe";
import { prisma } from "../config/database";
import { sendEmail, emailTemplates } from "../utils/email";

const router = Router();

// Flutterwave: create Payment Session (cards and mobile money)
router.post("/flutterwave", async (req, res) => {
  const { bookingId, amount, currency, customer, payment_type } = req.body;

  if (!bookingId || !amount || !currency || !customer) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  const tx_ref = `BOOK-${bookingId}-${Date.now()}`;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { user: true } });
    if (!booking || !booking.user) {
      return res.status(404).json({ success: false, message: "Booking or user not found" });
    }

    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const redirect_url = `${baseUrl}/api/payments/flutterwave/verify`;

    const payload = {
      tx_ref,
      amount,
      currency,
      payment_type: payment_type || "card",
      redirect_url,
      customer: { email: customer.email, name: customer.name, phonenumber: customer.phonenumber },
      meta: { bookingId },
    };

    const fwRes = await initializePayment(payload);
    const link = fwRes?.data?.link || fwRes?.link;

    // Create payment record as PENDING (store fwRes id in gatewayResponse)
    await prisma.payment.create({
      data: {
        booking: { connect: { id: bookingId } },
        user: { connect: { id: booking.user.id } },
        method: payment_type === "mobilemoney" ? "MOBILE_MONEY" : "CARD",
        transactionId: tx_ref,
        amount,
        currency,
        status: "PENDING",
        gatewayResponse: {
          set: { provider: "flutterwave", fwId: fwRes?.data?.id }
        },
      },
    });

    if (!link) {
      return res.status(500).json({ success: false, message: "Failed to create Flutterwave payment link" });
    }

    return res.json({ success: true, link, tx_ref });
  } catch (error) {
    console.error("Flutterwave create session error:", error);
    return res.status(500).json({ success: false, message: "Payment initialization failed", error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Flutterwave verify redirect handler
router.get("/flutterwave/verify", async (req, res) => {
  const { tx_ref, status } = req.query as { tx_ref?: string; status?: string };
  if (!tx_ref) {
    return res.status(400).send("tx_ref is required");
  }
  try {
    const fwRes = await verifyPayment(String(tx_ref));
    const paymentStatus = fwRes?.data?.status;
    const bookingId = fwRes?.data?.meta?.bookingId;
    if (paymentStatus === "successful" && bookingId) {
      await prisma.payment.update({ where: { transactionId: String(tx_ref) }, data: { status: "COMPLETED" } });
      const updated = await prisma.booking.update({
        where: { id: String(bookingId) },
        data: { status: "CONFIRMED", isConfirmed: true, confirmedAt: new Date() },
        include: { user: true, accommodation: true, transportation: true, tour: true },
      });
      if (updated.user) {
        const serviceName = updated.accommodation?.name || updated.transportation?.name || updated.tour?.name || "Service";
        const { subject, html } = emailTemplates.bookingConfirmation(updated.user.firstName, {
          id: updated.id,
          serviceName,
          startDate: updated.startDate,
          totalAmount: updated.totalAmount,
          currency: updated.currency,
        });
        sendEmail(updated.user.email, subject, html).catch(() => {});
      }
      const redirectUrl = process.env.NODE_ENV === "production"
        ? `${process.env.BASE_URL}/booking/success?bookingId=${bookingId}`
        : `http://localhost:5173/booking/success?bookingId=${bookingId}`;
      return res.redirect(redirectUrl);
    }
    const redirectUrl = process.env.NODE_ENV === "production"
      ? `${process.env.BASE_URL}/booking/failed`
      : `http://localhost:5173/booking/failed`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Flutterwave verify error:", error);
    return res.status(500).send("Verification failed");
  }
});

// Flutterwave JSON polling verification
router.get("/flutterwave/verify-json", async (req, res) => {
  const { tx_ref } = req.query as { tx_ref?: string };
  if (!tx_ref) {
    return res.status(400).json({ success: false, message: "tx_ref is required", paid: false });
  }
  try {
    const payment = await prisma.payment.findFirst({ where: { transactionId: String(tx_ref) } });
    if (!payment) {
      return res.json({ success: true, paid: false, message: "No payment yet" });
    }
    const fwRes = await verifyPayment(String(tx_ref));
    const paymentStatus = fwRes?.data?.status;
    const bookingId = fwRes?.data?.meta?.bookingId || null;
    if (paymentStatus === "successful" && bookingId) {
      await prisma.payment.update({ where: { transactionId: String(tx_ref) }, data: { status: "COMPLETED" } });
      const updated = await prisma.booking.update({
        where: { id: String(bookingId) },
        data: { status: "CONFIRMED", isConfirmed: true, confirmedAt: new Date() },
        include: { user: true, accommodation: true, transportation: true, tour: true },
      });
      if (updated.user) {
        const serviceName = updated.accommodation?.name || updated.transportation?.name || updated.tour?.name || "Service";
        const { subject, html } = emailTemplates.bookingConfirmation(updated.user.firstName, {
          id: updated.id,
          serviceName,
          startDate: updated.startDate,
          totalAmount: updated.totalAmount,
          currency: updated.currency,
        });
        sendEmail(updated.user.email, subject, html).catch(() => {});
      }
      return res.json({ success: true, paid: true, bookingId });
    }
    return res.json({ success: true, paid: false, bookingId });
  } catch (error) {
    console.error("Flutterwave verify-json error:", error);
    return res.json({ success: true, paid: false, message: "Verification failed" });
  }
});


export default router;
