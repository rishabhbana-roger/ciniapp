import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await repository.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Security check: users can only view their own bookings unless admin
    if (user.role !== "ADMIN" && booking.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You cannot access another user's booking." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Get booking by ID error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
