import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to reserve seats. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { showtimeId, seatIds } = body;

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "showtimeId and non-empty seatIds array are required" },
        { status: 400 }
      );
    }

    // Maximum 8 tickets per booking for security
    if (seatIds.length > 8) {
      return NextResponse.json(
        { error: "You can select up to 8 seats per transaction" },
        { status: 400 }
      );
    }

    const holdResult = await repository.holdSeats(showtimeId, seatIds, user.id);

    return NextResponse.json({
      success: true,
      data: holdResult,
      message: `Held ${seatIds.length} seat(s) for 10 minutes. Complete checkout before timer expires.`,
    });
  } catch (err: any) {
    console.error("Seat hold error:", err);
    if (err.status === 409 || err.code === "SEAT_UNAVAILABLE") {
      return NextResponse.json(
        { error: err.message || "One or more seats are no longer available." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Failed to hold seats" },
      { status: 500 }
    );
  }
}
