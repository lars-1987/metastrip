import { NextRequest, NextResponse } from "next/server";
import { stripe, BATCH_PRODUCTS, type BatchPassType } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passType } = body as { passType: BatchPassType };

    const product = BATCH_PRODUCTS[passType];
    if (!product) {
      return NextResponse.json(
        { error: "Invalid pass type" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        passType: product.passType,
        maxFiles: String(product.maxFiles),
        maxFileSizeMB: String(product.maxFileSizeMB),
      },
      success_url: `${baseUrl}/batch?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
