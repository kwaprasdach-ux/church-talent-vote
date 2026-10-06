"use client";
import { useState } from "react";
import Image from "next/image";

type Contestant = { id: string; name: string; code?: string | null; act: string | null; photoUrl: string | null; votes: number; };
const PAYSTACK_PUBLIC_KEY = "pk_test_93fc71e9bd92de0dcf036d185484eb7090dadc22";

type Props = {
  contestant: Contestant;
  onVoted?: (name: string, qty: number, photo: string | null) => void;
};

export default function ContestantCard({ contestant, onVoted }: Props) {
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const initial = contestant.name.charAt(0).toUpperCase();

  async function handleVote() {
    if (paying) return;
    setPaying(true);
    setErrorMsg("");
    try {
      const initRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId: contestant.id, quantity: 1 }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Could not start payment");

      await loadPaystackScript();

      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: "votes@churchtalentshow.com",
        amount: 100,
        currency: "GHS",
        ref: initData.reference,
        channels: ["mobile_money"],
        label: "1 vote for " + contestant.name,
        onClose: function () {
          setPaying(false);
        },
        callback: function (response: { reference: string }) {
          fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          })
            .then((r) => r.json())
            .then((data) => {
              setPaying(false);
              if (data.ok) {
                onVoted?.(contestant.name, 1, contestant.photoUrl ?? null);
              } else {
                setErrorMsg(data.error || "Vote failed. Try again.");
              }
            })
            .catch(() => {
              setPaying(false);
              setErrorMsg("Vote failed. Contact admin.");
            });
        },
      });
      handler.openIframe();
    } catch (err: any) {
      setPaying(false);
      setErrorMsg(err.message || "Something went wrong.");
    }
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:ring-1 hover:ring-yellow-400/40 hover:shadow-lg"
      style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
    >
      {/* Photo */}
      <div className="relative" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 to-black flex items-center justify-center overflow-hidden">
          {contestant.photoUrl ? (
            <Image src={contestant.photoUrl} alt={contestant.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover object-top" />
          ) : (
            <span className="text-6xl font-extrabold text-yellow-400/60 select-none">{initial}</span>
          )}
          {contestant.code && (
            <div className="absolute top-2 left-2 rounded-lg px-2 py-0.5 text-xs font-extrabold text-gray-900"
              style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)" }}>
              {contestant.code}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-white text-sm leading-tight">{contestant.name}</h3>
        {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
        <button
          onClick={handleVote}
          disabled={paying}
          className="mt-auto py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)", color: "#111", boxShadow: "0 2px 12px rgba(250,204,21,0.25)" }}
        >
          {paying ? "Opening…" : "Vote - GHS 1"}
        </button>
      </div>
    </div>
  );
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) return resolve();
    const existing = document.getElementById("paystack-script");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}
