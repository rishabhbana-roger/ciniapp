import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const result = await repository.getShowtimeSeatMap(params.id, user?.id);

    if (!result) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...result,
      currentUser: user ? { id: user.id, email: user.email } : null,
    });
  } catch (err: any) {
    console.error("Get showtime seat map error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
