import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyAndVote(reference: string) {
  // Check if this reference has already been processed (replay attack prevention)
  const existing = await prisma.vote.findUnique({ where: { reference } });
  if (existing) {
    // Already processed — return the contestant's current vote count silently
    const contestant = await prisma.contestant.findUnique({ where: { id: existing.contestantId } });
    return { ok: true, votes: contestant?.votes ?? 0, contestantId: existing.contestantId, quantity: existing.quantity, alreadyProcessed: true };
  }

  // Verify with Paystack
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );

  const data = await paystackRes.json();

  if (!data.status || data.data.status !== "success") {
    return { ok: false, error: "Payment not successful" };
  }

  const contestantId: string = data.data.metadata?.contestantId;
  const quantity = Math.max(1, Number(data.data.metadata?.quantity) || 1);
  // Verify amount matches what was initialized (pesewas → GHS)
  const amountGhs = data.data.amount / 100;

  if (!contestantId) {
    return { ok: false, error: "Invalid payment metadata" };
  }

  // Use a transaction: record the vote and increment the count atomically
  const [, updated] = await prisma.$transaction([
    prisma.vote.create({
      data: { reference, contestantId, quantity, amountGhs },
    }),
    prisma.contestant.update({
      where: { id: contestantId },
      data: { votes: { increment: quantity } },
    }),
  ]);

  return { ok: true, votes: updated.votes, contestantId, quantity, alreadyProcessed: false };
}

// POST — inline Paystack callback
export async function POST(req: NextRequest) {
  const { reference } = await req.json();
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }
  const result = await verifyAndVote(reference);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, votes: result.votes });
}

// GET — Paystack redirect callback
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/vote?payment=failed", req.nextUrl.origin));
  }
  const result = await verifyAndVote(reference);
  if (!result.ok) {
    return NextResponse.redirect(new URL("/vote?payment=failed", req.nextUrl.origin));
  }
  const url = new URL("/vote", req.nextUrl.origin);
  url.searchParams.set("voted", result.contestantId!);
  url.searchParams.set("qty", String(result.quantity)); // pass quantity, not total votes
  return NextResponse.redirect(url);
}
