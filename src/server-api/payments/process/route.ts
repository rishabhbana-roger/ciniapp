import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to complete payment" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, idempotencyKey, paymentMethod } = body;

    if (!bookingId || !idempotencyKey) {
      return NextResponse.json(
        { error: "bookingId and idempotencyKey are required" },
        { status: 400 }
      );
    }

    // Optional test card validation
    if (paymentMethod?.cardNumber) {
      const sanitizedCard = paymentMethod.cardNumber.replace(/\s+/g, "");
      if (sanitizedCard.length < 13 || sanitizedCard.length > 19) {
        return NextResponse.json(
          { error: "Invalid test card number format" },
          { status: 400 }
        );
      }
    }

    const result = await repository.processPaymentAndConfirm(
      bookingId,
      idempotencyKey,
      user.id,
      "SYSTEM_TEST"
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Payment processing error:", err);
    return NextResponse.json(
      { error: err.message || "Payment processing failed" },
      { status: 400 }
    );
  }
}
