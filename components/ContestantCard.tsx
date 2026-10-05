"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Contestant = { id: string; name: string; code?: string | null; act: string | null; photoUrl: string | null; votes: number; };
const PAYSTACK_PUBLIC_KEY = "pk_test_93fc71e9bd92de0dcf036d185484eb7090dadc22";

export default function ContestantCard({ contestant, position }: { contestant: Contestant; position?: number }) {
  const [status, setStatus] = useState<"idle" | "picker" | "paying" | "voted" | "error">("idle");
  const [quantity, setQuantity] = useState(1);
  const [votedQty, setVotedQty] = useState(1);
  const [votes, setVotes] = useState(contestant.votes);
  const [errorMsg, setErrorMsg] = useState("");
  const initial = contestant.name.charAt(0).toUpperCase();
  const router = useRouter();

  function handleVoteClick() { if (status !== "idle") return; setQuantity(1); setErrorMsg(""); setStatus("picker"); }
  function decrement() { setQuantity((q) => Math.max(1, q - 1)); }
  function increment() { setQuantity((q) => Math.min(50, q + 1)); }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault(); setStatus("paying"); setErrorMsg("");
    try {
      const initRes = await fetch("/api/payment/initialize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contestantId: contestant.id, quantity }) });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Could not start payment");
      await loadPaystackScript();
      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY, email: "votes@churchtalentshow.com", amount: quantity * 100, currency: "GHS",
        ref: initData.reference, channels: ["mobile_money"], label: quantity + " vote(s) for " + contestant.name,
        onClose: function () { setStatus("picker"); },
        callback: function (response: { reference: string }) {
          fetch("/api/payment/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: response.reference }) })
            .then((r) => r.json())
            .then((data) => {
              if (data.ok) {
                setVotes(data.votes);
                setVotedQty(quantity);
                setStatus("voted");
                setTimeout(() => { router.refresh(); setStatus("idle"); }, 4000);
              } else {
                setErrorMsg(data.error || "Vote failed.");
                setStatus("error");
                setTimeout(() => setStatus("picker"), 3000);
              }
            })
            .catch(() => { setErrorMsg("Vote failed. Contact admin."); setStatus("error"); setTimeout(() => setStatus("picker"), 3000); });
        },
      });
      handler.openIframe();
    } catch (err: any) { setErrorMsg(err.message || "Something went wrong."); setStatus("error"); setTimeout(() => setStatus("picker"), 3000); }
  }

  return (
    <>
      {/* Full-screen voted overlay */}
      {status === "voted" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)" }}>
          <div className="flex flex-col items-center gap-5 max-w-sm w-full">
            {/* Checkmark circle */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 0 40px rgba(34,197,94,0.4)" }}>
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest">Vote Confirmed!</p>
              <h2 className="text-2xl font-extrabold text-white">Thank you for voting!</h2>
              <p className="text-white/60 text-sm mt-1">
                You cast <span className="text-yellow-400 font-bold">{votedQty} {votedQty === 1 ? "vote" : "votes"}</span> for
              </p>
              <p className="text-yellow-400 font-extrabold text-lg">{contestant.name}</p>
            </div>
            {/* Photo */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden relative bg-green-900 flex items-center justify-center"
              style={{ border: "2px solid rgba(34,197,94,0.5)" }}>
              {contestant.photoUrl
                ? <Image src={contestant.photoUrl} alt={contestant.name} fill sizes="80px" className="object-cover object-top" />
                : <span className="text-yellow-400 font-extrabold text-2xl">{initial}</span>}
            </div>
            <p className="text-white/30 text-xs">Returning to voting page in a moment…</p>
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full animate-shrink" />
            </div>
          </div>
        </div>
      )}

      {/* Contestant card */}
      <div
        className={`flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 rounded-2xl ${status === "voted" ? "ring-2 ring-green-400 shadow-green-400/20 shadow-lg" : "hover:ring-1 hover:ring-yellow-400/40 hover:shadow-lg"}`}
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
            {/* Number badge */}
            {contestant.code && (
              <div className="absolute top-2 left-2 rounded-lg px-2 py-0.5 text-xs font-extrabold text-gray-900"
                style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)" }}>
                {contestant.code}
              </div>
            )}
            {/* Voted overlay on photo */}
            {status === "voted" && (
              <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                <div className="bg-green-500 rounded-full px-4 py-2">
                  <span className="text-white font-extrabold text-sm">Voted!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <h3 className="font-bold text-white text-sm leading-tight">{contestant.name}</h3>
          <p className="text-xs text-white/30">{votes} {votes === 1 ? "vote" : "votes"}</p>

          {/* Quantity picker */}
          {status === "picker" && (
            <form onSubmit={handlePay} className="mt-1 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl px-2 py-1.5"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <button type="button" onClick={decrement} className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-base flex items-center justify-center hover:bg-yellow-400/20 transition active:scale-90">-</button>
                <div className="text-center">
                  <p className="text-base font-extrabold text-yellow-400">{quantity}</p>
                  <p className="text-xs text-white/30">vote{quantity > 1 ? "s" : ""}</p>
                </div>
                <button type="button" onClick={increment} className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-base flex items-center justify-center hover:bg-yellow-400/20 transition active:scale-90">+</button>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-white/40">Total</span>
                <span className="text-sm font-extrabold text-yellow-400">GHS {quantity}.00</span>
              </div>
              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
              <div className="flex gap-1.5">
                <button type="submit" className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-900 active:scale-95 transition"
                  style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)" }}>Pay GHS {quantity}.00</button>
                <button type="button" onClick={() => setStatus("idle")} className="px-2 text-xs text-white/30 hover:text-white border border-white/10 rounded-xl">X</button>
              </div>
            </form>
          )}

          {/* Vote button */}
          {status !== "picker" && (
            <button
              onClick={handleVoteClick}
              disabled={status === "paying" || status === "voted"}
              className="mt-auto py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                status === "voted" ? { background: "#22c55e", color: "white" } :
                status === "error" ? { background: "#ef4444", color: "white" } :
                status === "paying" ? { background: "rgba(250,204,21,0.4)", color: "#111" } :
                { background: "linear-gradient(90deg,#facc15,#f59e0b)", color: "#111", boxShadow: "0 2px 12px rgba(250,204,21,0.25)" }
              }>
              {status === "voted" ? "Voted!" : status === "paying" ? "Opening..." : status === "error" ? "Try again" : "Vote - GHS 1"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) return resolve();
    const existing = document.getElementById("paystack-script");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.id = "paystack-script"; script.src = "https://js.paystack.co/v1/inline.js"; script.async = true;
    script.onload = () => resolve(); script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}
