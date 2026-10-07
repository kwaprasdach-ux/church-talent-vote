"use client";
import { useState } from "react";
import Image from "next/image";

type Contestant = { id: string; name: string; code?: string | null; act: string | null; photoUrl: string | null; votes: number; };

type Props = {
  contestant: Contestant;
  isOpen: boolean;
  onSelect: () => void;
  onVoted?: (name: string, qty: number, photo: string | null) => void;
};

export default function ContestantCard({ contestant, isOpen, onSelect, onVoted }: Props) {
  const [paying, setPaying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const initial = contestant.name.charAt(0).toUpperCase();

  function handleVoteClick() { setQuantity(1); setErrorMsg(""); onSelect(); }
  function decrement() { setQuantity((q) => Math.max(1, q - 1)); }
  function increment() { setQuantity((q) => Math.min(50, q + 1)); }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (paying) return;
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

      // callback_url: where Paystack redirects after mobile money payment
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
        onClose: function () {
          setPaying(false);
        },
        callback: function (response: { reference: string }) {
          // fires on desktop/browser — verify inline and show overlay
          fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          })
            .then((r) => r.json())
            .then((data) => {
              setPaying(false);
              if (data.ok) {
                onVoted?.(contestant.name, quantity, contestant.photoUrl ?? null);
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
        isOpen ? "ring-2 ring-yellow-400 shadow-yellow-400/20 shadow-lg" : "hover:-translate-y-1 hover:ring-1 hover:ring-yellow-400/40 hover:shadow-lg"
      }`}
      style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
    >
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

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-white text-sm leading-tight">{contestant.name}</h3>

        {isOpen && (
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

        {!isOpen && (
          <button onClick={handleVoteClick}
            className="mt-auto py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)", color: "#111", boxShadow: "0 2px 12px rgba(250,204,21,0.25)" }}>
            Vote - GHS 1
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
