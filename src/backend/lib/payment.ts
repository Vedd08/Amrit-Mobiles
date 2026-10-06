import "server-only";

export type PaymentIntentResult =
  | { configured: true; message: string }
  | { configured: false; message: string };

/**
 * Creates a payment intent for an order. No gateway has been chosen yet, so
 * this always reports "not configured" and the checkout flow falls back to
 * asking the customer to complete the order via WhatsApp instead.
 *
 * Once a gateway (e.g. Razorpay) is chosen: set RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET, implement the order/intent creation call here, and
 * add a webhook route to mark orders PAID. No changes needed in the
 * checkout UI or the placeOrder action — both already branch on
 * `configured`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature documents the future Razorpay call shape
export async function createPaymentIntent(input: {
  orderId: string;
  amount: number;
}): Promise<PaymentIntentResult> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return {
      configured: false,
      message:
        "Online payment isn't set up yet. We've saved your order — please complete it via WhatsApp, or we'll contact you shortly.",
    };
  }

  return { configured: false, message: "Online payment is not yet implemented." };
}
