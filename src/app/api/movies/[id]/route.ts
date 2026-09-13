import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await repository.getMovieById(params.id);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      movie,
    });
  } catch (err: any) {
    console.error("Get movie by ID error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
