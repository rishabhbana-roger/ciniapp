import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = user.role === "ADMIN";
    const result = await repository.cancelBooking(params.id, user.id, isAdmin);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}
