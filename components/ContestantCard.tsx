"use client";
import { useState } from "react";
import Image from "next/image";

type Contestant = {
  id: string;
  name: string;
  code?: string | null;
  act: string | null;
  photoUrl: string | null;
  votes: number;
};

const PAYSTACK_PUBLIC_KEY = "pk_test_9fbc71ffef8a91b27d9ea23af5bb234c8a278175";

export default function ContestantCard({ contestant }: { contestant: Contestant }) {
  const [status, setStatus] = useState<"idle" | "picker" | "paying" | "voted" | "error">("idle");
  const [quantity, setQuantity] = useState(1);
  const [votes, setVotes] = useState(contestant.votes);
  const [errorMsg, setErrorMsg] = useState("");
  const initial = contestant.name.charAt(0).toUpperCase();
  const total = quantity;

  function handleVoteClick() { if (status !== "idle") return; setQuantity(1); setErrorMsg(""); setStatus("picker"); }
  function decrement() { setQuantity((q) => Math.max(1, q - 1)); }
  function increment() { setQuantity((q) => Math.min(50, q + 1)); }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setStatus("paying");
    setErrorMsg("");
    try {
      const initRes = await fetch("/api/payment/initialize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId: contestant.id, quantity }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Could not start payment");
      await loadPaystackScript();
      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: "votes@churchtalentshow.com",
        amount: quantity * 100,
        currency: "GHS",
        ref: initData.reference,
        channels: ["mobile_money"],
        label: quantity + " vote(s) for " + contestant.name,
        onClose: function () { setStatus("picker"); },
        callback: function (response: { reference: string }) {
          fetch("/api/payment/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.ok) { setVotes(data.votes); setStatus("voted"); setTimeout(() => setStatus("idle"), 4000); }
              else { setErrorMsg(data.error || "Vote failed."); setStatus("error"); setTimeout(() => setStatus("picker"), 3000); }
            })
            .catch(() => { setErrorMsg("Vote failed. Contact admin."); setStatus("error"); setTimeout(() => setStatus("picker"), 3000); });
        },
      });
      handler.openIframe();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
      setTimeout(() => setStatus("picker"), 3000);
    }
  }

  return (
    <div className={`card flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl ${status === "voted" ? "ring-2 ring-green-400" : "hover:ring-1 hover:ring-yellow-400/50"}`}>
      <div className="aspect-square bg-gradient-to-br from-green-900 to-green-950 flex items-center justify-center overflow-hidden relative">
        {contestant.photoUrl ? (
          <Image src={contestant.photoUrl} alt={contestant.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
        ) : (
          <span className="text-5xl font-extrabold text-yellow-400 select-none">{initial}</span>
        )}
        {status === "voted" && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
            <span className="text-white text-3xl font-extrabold">Voted!</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{contestant.name}</h3>
        {contestant.code && <p className="text-xs font-bold text-yellow-400 tracking-widest">{contestant.code}</p>}
        <p className="text-xs text-white/40">{votes} {votes === 1 ? "vote" : "votes"}</p>
        {status === "picker" && (
          <form onSubmit={handlePay} className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between bg-black/30 rounded-xl px-2 py-1.5">
              <button type="button" onClick={decrement} className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-lg flex items-center justify-center hover:bg-yellow-400/20 transition active:scale-95">-</button>
              <div className="text-center">
                <p className="text-lg font-extrabold text-yellow-400">{quantity}</p>
                <p className="text-xs text-white/40">vote{quantity > 1 ? "s" : ""}</p>
              </div>
              <button type="button" onClick={increment} className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-lg flex items-center justify-center hover:bg-yellow-400/20 transition active:scale-95">+</button>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-white/50">Total cost</span>
              <span className="text-sm font-extrabold text-yellow-400">GHS {total}.00</span>
            </div>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <div className="flex gap-1.5">
              <button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xs font-bold rounded-xl py-2 transition active:scale-95">Pay GHS {total}.00</button>
              <button type="button" onClick={() => setStatus("idle")} className="px-2 text-xs text-white/40 hover:text-white border border-white/20 rounded-xl">X</button>
            </div>
          </form>
        )}
        {status !== "picker" && (
          <button onClick={handleVoteClick} disabled={status === "paying" || status === "voted"}
            className={`mt-2 rounded-xl py-2 text-sm font-semibold transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${status === "voted" ? "bg-green-500 text-white" : status === "error" ? "bg-red-500 text-white" : status === "paying" ? "bg-yellow-400/50 text-gray-900" : "bg-yellow-400 hover:bg-yellow-300 text-gray-900"}`}>
            {status === "voted" ? "Voted!" : status === "paying" ? "Opening payment..." : status === "error" ? "Try again" : "Vote - GHS 1"}
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
