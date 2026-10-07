"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type Contestant = { id: string; name: string; code?: string | null; act: string | null; photoUrl: string | null; votes: number; };

type Props = {
  contestant: Contestant;
  isOpen: boolean;
  onSelect: () => void;
  onVoted?: () => void;
  startVoted?: boolean; // true when Paystack redirected back after mobile money
};

export default function ContestantCard({ contestant, isOpen, onSelect, onVoted, startVoted = false }: Props) {
  const [paying, setPaying] = useState(false);
  const [voted, setVoted] = useState(startVoted);
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  // If startVoted changes to true (redirect flow), show voted state
  useEffect(() => {
    if (startVoted) {
      setVoted(true);
      setTimeout(() => setVoted(false), 6000);
    }
  }, [startVoted]);
  const initial = contestant.name.charAt(0).toUpperCase();

  function handleVoteClick() { setQuantity(1); setErrorMsg(""); onSelect(); }
  function decrement() { setQuantity((q) => Math.max(1, q - 1)); }
  function increment() { setQuantity((q) => Math.min(50, q + 1)); }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (paying) return; // hard guard against double-tap
    setPaying(true);
    setErrorMsg("");
    try {
      const initRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId: contestant.id, quantity }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Could not start payment");

      await loadPaystackScript();

      const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_452dfb5370fd3c017bee297667d05aad90e59726";
      const callbackUrl = `${window.location.origin}/api/payment/verify`;

      const handler = (window as any).PaystackPop.setup({
        key,
        email: "votes@adyots.com",
        amount: quantity * 100,
        currency: "GHS",
        ref: initData.reference,
        channels: ["mobile_money"],
        label: `${quantity} vote(s) for ${contestant.name}`,
        callback_url: callbackUrl,
        onClose: function () { setPaying(false); },
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
                setVoted(true);
                onSelect(); // close the picker
                onVoted?.();
                // Reset voted badge after 6 seconds
                setTimeout(() => setVoted(false), 6000);
              } else {
                setErrorMsg(data.error || "Vote failed. Try again.");
              }
            })
            .catch(() => { setPaying(false); setErrorMsg("Vote failed. Contact admin."); });
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
      className={`flex flex-col overflow-hidden rounded-2xl transition-all duration-200 ${
        voted ? "ring-2 ring-green-400 shadow-green-400/20 shadow-lg" :
        isOpen ? "ring-2 ring-yellow-400 shadow-yellow-400/20 shadow-lg" :
        "hover:-translate-y-1 hover:ring-1 hover:ring-yellow-400/40 hover:shadow-lg"
      }`}
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
          {/* Code badge */}
          {contestant.code && (
            <div className="absolute top-2 left-2 rounded-lg px-2 py-0.5 text-xs font-extrabold text-gray-900"
              style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)" }}>
              {contestant.code}
            </div>
          )}
          {/* Green voted overlay on photo */}
          {voted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(34,197,94,0.75)" }}>
              <svg className="w-12 h-12 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-extrabold text-base tracking-wide">VOTED!</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-white text-sm leading-tight">{contestant.name}</h3>

        {/* Quantity picker */}
        {isOpen && !voted && (
          <form onSubmit={handlePay} className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-xl px-2 py-1.5"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={decrement} className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-yellow-400/20 transition active:scale-90">−</button>
              <div className="text-center">
                <p className="text-lg font-extrabold text-yellow-400">{quantity}</p>
                <p className="text-xs text-white/30">vote{quantity > 1 ? "s" : ""}</p>
              </div>
              <button type="button" onClick={increment} className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-yellow-400/20 transition active:scale-90">+</button>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-white/40">Total</span>
              <span className="text-sm font-extrabold text-yellow-400">GHS {quantity}.00</span>
            </div>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <div className="flex gap-1.5">
              <button type="submit" disabled={paying}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-900 active:scale-95 transition disabled:opacity-60"
                style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)" }}>
                {paying ? "Opening…" : `Pay GHS ${quantity}.00`}
              </button>
              <button type="button" onClick={onSelect} className="w-10 text-white/30 hover:text-white border border-white/10 rounded-xl text-sm font-bold transition">✕</button>
            </div>
          </form>
        )}

        {/* Vote / Voted button */}
        {!isOpen && (
          <button
            onClick={voted ? undefined : handleVoteClick}
            disabled={voted}
            className="mt-auto py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:cursor-default"
            style={voted
              ? { background: "#22c55e", color: "white" }
              : { background: "linear-gradient(90deg,#facc15,#f59e0b)", color: "#111", boxShadow: "0 2px 12px rgba(250,204,21,0.25)" }
            }>
            {voted ? "✓ Voted!" : "Vote - GHS 1"}
          </button>
        )}
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
