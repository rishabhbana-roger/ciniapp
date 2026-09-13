import { NextResponse } from "next/server";
import { repository } from "@/db/repository";

export async function GET() {
  try {
    const cinemas = await repository.getCinemas();
    return NextResponse.json({ success: true, cinemas });
  } catch (err: any) {
    console.error("Get cinemas error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
