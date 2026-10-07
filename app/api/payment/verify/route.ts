import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyAndVote(reference: string) {
  if (!reference || typeof reference !== "string") {
    return { ok: false, error: "Invalid reference" };
  }

  // Replay attack prevention — if already processed, return success silently
  const existing = await prisma.vote.findUnique({ where: { reference } });
  if (existing) {
    const contestant = await prisma.contestant.findUnique({ where: { id: existing.contestantId } });
    return {
      ok: true,
      votes: contestant?.votes ?? 0,
      contestantId: existing.contestantId,
      quantity: existing.quantity,
      alreadyProcessed: true,
    };
  }

  // Verify with Paystack
  let data: any;
  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    data = await paystackRes.json();
  } catch (err) {
    console.error("Paystack verify network error:", err);
    return { ok: false, error: "Could not reach payment server. Try again." };
  }

  if (!data.status || data.data?.status !== "success") {
    const reason = data.data?.gateway_response || data.message || "Payment not successful";
    return { ok: false, error: reason };
  }

  const contestantId: string = data.data.metadata?.contestantId;
  const quantity = Math.max(1, Number(data.data.metadata?.quantity) || 1);
  const amountGhs = data.data.amount / 100;

  if (!contestantId) {
    return { ok: false, error: "Invalid payment metadata" };
  }

  // Atomically record vote and increment count
  try {
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
  } catch (err: any) {
    // If race condition hits unique constraint, treat as already processed
    if (err?.code === "P2002") {
      const contestant = await prisma.contestant.findUnique({ where: { id: contestantId } });
      return { ok: true, votes: contestant?.votes ?? 0, contestantId, quantity, alreadyProcessed: true };
    }
    console.error("DB vote error:", err);
    return { ok: false, error: "Failed to record vote" };
  }
}

// POST — inline Paystack callback (desktop/some mobile browsers)
export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json({ error: "reference is required" }, { status: 400 });
    }
    const result = await verifyAndVote(reference);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, votes: result.votes });
  } catch (err: any) {
    console.error("Verify POST error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// GET — Paystack redirect after mobile money payment
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/vote?status=failed", req.nextUrl.origin));
  }
  const result = await verifyAndVote(reference);
  if (!result.ok) {
    return NextResponse.redirect(new URL("/vote?status=failed", req.nextUrl.origin));
  }
  const url = new URL("/vote", req.nextUrl.origin);
  url.searchParams.set("voted", result.contestantId!);
  url.searchParams.set("qty", String(result.quantity));
  return NextResponse.redirect(url);
}
