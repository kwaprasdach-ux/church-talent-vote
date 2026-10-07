import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment/verify?reference=xxx  — called by Paystack redirect after payment
// POST /api/payment/verify               — called by frontend to verify inline payment

async function verifyAndVote(reference: string) {
  // Verify with Paystack
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await paystackRes.json();

  if (!data.status || data.data.status !== "success") {
    return { ok: false, error: "Payment not successful" };
  }

  const contestantId = data.data.metadata?.contestantId;
  const quantity = Math.max(1, Number(data.data.metadata?.quantity) || 1);

  if (!contestantId) {
    return { ok: false, error: "Invalid payment metadata" };
  }

  // Cast the votes (quantity times)
  const updated = await prisma.contestant.update({
    where: { id: contestantId },
    data: { votes: { increment: quantity } },
  });

  return { ok: true, votes: updated.votes, contestantId };
}

// POST — frontend calls this after inline payment completes
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
  // Redirect back to vote page with success info so the overlay shows
  const url = new URL("/vote", req.nextUrl.origin);
  url.searchParams.set("voted", result.contestantId!);
  url.searchParams.set("qty", String(result.votes));
  return NextResponse.redirect(url);
}
