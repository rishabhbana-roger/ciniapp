import { NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const bookings = await repository.getUserBookings(user.id);
    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    console.error("Get user bookings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
