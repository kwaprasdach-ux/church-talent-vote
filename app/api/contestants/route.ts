import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET is public (voting page needs it). POST is admin-only, enforced by middleware.

export async function GET() {
  const contestants = await prisma.contestant.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(contestants);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, act, photoUrl } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const count = await prisma.contestant.count();

  const contestant = await prisma.contestant.create({
    data: {
      name: name.trim(),
      act: typeof act === "string" ? act.trim() : null,
      photoUrl: typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : null,
      order: count, code: "ADY-" + String(count + 1).padStart(3, "0"),
    },
  });

  return NextResponse.json(contestant, { status: 201 });
}

