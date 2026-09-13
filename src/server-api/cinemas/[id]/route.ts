import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cinema = await repository.getCinemaById(params.id);
    if (!cinema) {
      return NextResponse.json({ error: "Cinema not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, cinema });
  } catch (err: any) {
    console.error("Get cinema by ID error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
