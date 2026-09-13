import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return handleRelease(req);
}

export async function POST(req: NextRequest) {
  return handleRelease(req);
}

async function handleRelease(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "cinebook_cron_secure_token_98374";

    // Allow execution via CRON_SECRET bearer token, x-cron-secret header, or logged-in ADMIN
    const isCronAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      req.headers.get("x-cron-secret") === cronSecret;

    let isAdmin = false;
    if (!isCronAuthorized) {
      const user = await getCurrentUser();
      if (user && user.role === "ADMIN") {
        isAdmin = true;
      }
    }

    if (!isCronAuthorized && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid CRON_SECRET or missing admin session." },
        { status: 401 }
      );
    }

    const result = await repository.releaseExpiredHolds();

    return NextResponse.json({
      success: true,
      ...result,
      message: `Released ${result.releasedCount} expired seat hold(s). Operation idempotent.`,
    });
  } catch (err: any) {
    console.error("Cron release holds error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
