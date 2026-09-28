import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT and DELETE are admin-only, enforced by middleware.

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, act, photoUrl, order } = body;

  const contestant = await prisma.contestant.update({
    where: { id: params.id },
    data: {
      ...(typeof name === "string" ? { name: name.trim() } : {}),
      ...(typeof act === "string" ? { act: act.trim() } : {}),
      ...(typeof photoUrl === "string" ? { photoUrl: photoUrl.trim() || null } : {}),
      ...(typeof order === "number" ? { order } : {}),
    },
  });

  return NextResponse.json(contestant);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.contestant.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
