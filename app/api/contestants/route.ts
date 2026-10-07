import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET is public (voting page needs it). POST is admin-only, enforced by middleware.

export async function GET() {
  try {
    const contestants = await prisma.contestant.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(contestants);
  } catch {
    return NextResponse.json({ error: "Failed to fetch contestants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, act, photoUrl } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const count = await prisma.contestant.count();

    const contestant = await prisma.contestant.create({
      data: {
        name: name.trim(),
        act: typeof act === "string" && act.trim() ? act.trim() : null,
        photoUrl: typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : null,
        order: count,
        code: "ADY-" + String(count + 1).padStart(3, "0"),
      },
    });

    return NextResponse.json(contestant, { status: 201 });
  } catch (err: any) {
    // Handle duplicate code (race condition)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A contestant with that code already exists. Please try again." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create contestant" }, { status: 500 });
  }
}
