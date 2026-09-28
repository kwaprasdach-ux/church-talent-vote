import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/reset — resets all vote counts to zero (admin only, enforced by middleware)
export async function POST() {
  await prisma.contestant.updateMany({ data: { votes: 0 } });
  return NextResponse.json({ ok: true });
}
