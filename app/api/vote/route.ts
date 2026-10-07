import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This free-vote endpoint is intentionally disabled in production.
// All votes must go through the paid Paystack flow (/api/payment/verify).
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Direct voting is disabled. Please pay to vote." }, { status: 403 });
}
