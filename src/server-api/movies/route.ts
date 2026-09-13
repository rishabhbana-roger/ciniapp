import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const genre = searchParams.get("genre") || undefined;
    const language = searchParams.get("language") || undefined;
    const date = searchParams.get("date") || undefined;

    const movies = await repository.getMovies({ query, genre, language, date });
    const genres = await repository.getGenres();

    return NextResponse.json({
      success: true,
      movies,
      genres,
    });
  } catch (err: any) {
    console.error("Get movies API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    if (!body.title || !body.synopsis) {
      return NextResponse.json({ error: "Title and synopsis are required" }, { status: 400 });
    }

    const movie = await repository.createMovie(body);
    return NextResponse.json({ success: true, movie }, { status: 201 });
  } catch (err: any) {
    console.error("Create movie API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
