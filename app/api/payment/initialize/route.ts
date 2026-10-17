import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contestantId, quantity = 1 } = body;
    if (!contestantId) return NextResponse.json({ error: "contestantId is required" }, { status: 400 });
    const qty = Math.max(1, Math.min(50, Number(quantity) || 1));
    const contestant = await prisma.contestant.findUnique({ where: { id: contestantId } });
    if (!contestant) return NextResponse.json({ error: "Contestant not found" }, { status: 404 });
    if (!process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: "Payment not configured" }, { status: 500 });

    const ts = Date.now();
    const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const reference = "adyots_" + ts + "_" + uid;
    const email = "voter" + ts + "@adyots.com";

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: qty * 100,
        currency: "GHS",
        reference,
        channels: ["mobile_money"],
        metadata: {
          contestantId,
          contestantName: contestant.name,
          quantity: qty,
          custom_fields: [
            { display_name: "Voting for", variable_name: "voting_for", value: contestant.name },
            { display_name: "Votes", variable_name: "quantity", value: String(qty) },
          ],
        },
      }),
    });

    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 500 });

    return NextResponse.json({
      reference: data.data.reference,
      accessCode: data.data.access_code,
      email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to start payment" }, { status: 500 });
  }
}


