import { Router } from "express";
import { initializePayment, verifyPayment } from "@/utils/flutterwave";
import { createCheckoutSession, retrieveSession } from "@/utils/stripe";
import { prisma } from "../config/database";
import { sendEmail, emailTemplates } from "../utils/email";

const router = Router();

// Stripe: create Checkout Session (cards only)
router.post("/stripe", async (req, res) => {
  const { bookingId, amount, currency, customer } = req.body;

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
    const successUrl = `${baseUrl}/api/payments/stripe/verify`;
    const cancelUrl = `${baseUrl}/api/payments/stripe/cancel`;

    const session = await createCheckoutSession({
      txRef: tx_ref,
      amount,
      currency,
      customer: { email: customer.email, name: customer.name },
      bookingId,
      successUrl,
      cancelUrl,
    });

    // Create payment record as PENDING (store session id in gatewayResponse)
    await prisma.payment.create({
      data: {
        booking: { connect: { id: bookingId } },
        user: { connect: { id: booking.user.id } },
        method: "CARD",
        transactionId: tx_ref,
        amount,
        currency,
        status: "PENDING",
        gatewayResponse: {
          set: { provider: "stripe", sessionId: session.id }
        },
      },
    });

    if (!session.url) {
      return res.status(500).json({ success: false, message: "Failed to create checkout session" });
    }

    return res.json({ success: true, link: session.url, tx_ref });
  } catch (error) {
    console.error("Stripe create session error:", error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    // Check if it's a Stripe-specific error
    if ((error as any)?.type) {
      console.error("Stripe error type:", (error as any).type);
      console.error("Stripe error code:", (error as any).code);
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Payment initialization failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Stripe cancel handler
router.get("/stripe/cancel", async (req, res) => {
  const { tx_ref } = req.query as { tx_ref?: string };
  
  if (!tx_ref) {
    return res.status(400).send("Transaction reference is required");
  }
  
  try {
    // Update payment status to cancelled
    await prisma.payment.update({
      where: { transactionId: String(tx_ref) },
      data: { status: "CANCELLED" }
    });
    
    const redirectUrl = process.env.NODE_ENV === "production"
      ? `${process.env.BASE_URL}/booking/failed`
      : `http://localhost:5173/booking/failed`;
    
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Stripe cancel error:", error);
    return res.status(500).send("Cancellation failed");
  }
});

// Stripe verify redirect handler
router.get("/stripe/verify", async (req, res) => {
  const { session_id, tx_ref } = req.query as { session_id?: string; tx_ref?: string };
  if (!session_id || !tx_ref) {
    return res.status(400).send("session_id and tx_ref are required");
  }
  try {
    const session = await retrieveSession(String(session_id));
    const paid = session.payment_status === "paid" || session.status === "complete";
    const bookingId = (session.metadata as any)?.bookingId;

    if (paid && bookingId) {
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
    console.error("Stripe verify error:", error);
    return res.status(500).send("Verification failed");
  }
});

// Stripe JSON polling verification
router.get("/stripe/verify-json", async (req, res) => {
  const { tx_ref } = req.query as { tx_ref?: string };
  if (!tx_ref) {
    return res.status(400).json({ success: false, message: "tx_ref is required", paid: false });
  }
  try {
    // Find session id by our tx_ref
    const payment = await prisma.payment.findFirst({ where: { transactionId: String(tx_ref) } });
    const sessionId = (payment as any)?.gatewayResponse?.sessionId;
    if (!payment || !sessionId) {
      return res.json({ success: true, paid: false, message: "No session yet" });
    }
    const session = await retrieveSession(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    const bookingId = (session.metadata as any)?.bookingId || null;

    if (paid && bookingId) {
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
    console.error("Stripe verify-json error:", error);
    return res.json({ success: true, paid: false, message: "Verification failed" });
  }
});


export default router;
