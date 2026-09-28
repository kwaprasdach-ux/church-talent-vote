import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — voting is open, no per-voter restriction by design
// (any phone/device can vote as many times as they like).

export async function POST(req: NextRequest) {
  const { contestantId } = await req.json();

  if (typeof contestantId !== "string" || !contestantId) {
    return NextResponse.json({ error: "contestantId is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.contestant.update({
      where: { id: contestantId },
      data: { votes: { increment: 1 } },
    });
    return NextResponse.json({ ok: true, votes: updated.votes });
  } catch {
    return NextResponse.json({ error: "Contestant not found" }, { status: 404 });
  }
}
