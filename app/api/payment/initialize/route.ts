import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/payment/initialize
// Body: { contestantId, email }
// Returns: { authorization_url, reference }

export async function POST(req: NextRequest) {
  const { contestantId, email } = await req.json();

  if (!contestantId || typeof contestantId !== "string") {
    return NextResponse.json({ error: "contestantId is required" }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  // Confirm contestant exists
  const contestant = await prisma.contestant.findUnique({ where: { id: contestantId } });
  if (!contestant) {
    return NextResponse.json({ error: "Contestant not found" }, { status: 404 });
  }

  const reference = `vote_${contestantId}_${Date.now()}`;

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: 100, // GHS 1.00 = 100 pesewas
      currency: "GHS",
      reference,
      metadata: {
        contestantId,
        contestantName: contestant.name,
        custom_fields: [
          {
            display_name: "Voting for",
            variable_name: "voting_for",
            value: contestant.name,
          },
        ],
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/payment/verify`,
    }),
  });

  const data = await paystackRes.json();

  if (!data.status) {
    return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 500 });
  }

  return NextResponse.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  });
}
