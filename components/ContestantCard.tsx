"use client";

import { useState } from "react";
import Image from "next/image";

type Contestant = {
  id: string;
  name: string;
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
  const total = quantity * 1; // GHS 1 per vote

  function handleVoteClick() {
    if (status !== "idle") return;
    setQuantity(1);
    setErrorMsg("");
    setStatus("picker");
  }

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQuantity((q) => Math.min(50, q + 1));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setStatus("paying");
    setErrorMsg("");

    try {
      const initRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestantId: contestant.id,
          email: "votes@churchtalentshow.com",
          quantity,
        }),
      });
      const initData = await initRes.json();

      if (!initRes.ok || !initData.authorization_url) {
        console.error("Init failed:", initData);
        throw new Error(initData.error || "Could not start payment");
      }

      await loadPaystackScript();

      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: "votes@churchtalentshow.com",
        amount: quantity * 100, // pesewas
        currency: "GHS",
        ref: initData.reference,
        label: `${quantity} vote${quantity > 1 ? "s" : ""} for ${contestant.name}`,
        onClose: () => {
          setStatus("picker");
        },
        callback: async (response: { reference: string }) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.ok) {
            setVotes(verifyData.votes);
            setStatus("voted");
            setTimeout(() => setStatus("idle"), 4000);
          } else {
            setErrorMsg(verifyData.error || "Payment went through but vote failed.");
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
          }
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
      setTimeout(() => setStatus("picker"), 3000);
    }
  }

  return (
    <div
      className={`card flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-md ${
        status === "voted" ? "ring-2 ring-green-400" : ""
      }`}
    >
      {/* Photo */}
      <div className="aspect-square bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center overflow-hidden relative">
        {contestant.photoUrl ? (
          <Image
            src={contestant.photoUrl}
            alt={contestant.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <span className="text-5xl font-extrabold text-brand-400 select-none">
            {initial}
          </span>
        )}
        {status === "voted" && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">
          {contestant.name}
        </h3>
        {contestant.act && (
          <p className="text-xs text-brand-600 font-medium truncate">{contestant.act}</p>
        )}
        <p className="text-xs text-gray-400">
          {votes} {votes === 1 ? "vote" : "votes"}
        </p>

        {/* Quantity picker + payment form */}
        {status === "picker" && (
          <form onSubmit={handlePay} className="mt-2 flex flex-col gap-2">
            {/* Quantity row */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-2 py-1.5">
              <button
                type="button"
                onClick={decrement}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition active:scale-95"
              >
                −
              </button>
              <div className="text-center">
                <p className="text-lg font-extrabold text-brand-700">{quantity}</p>
                <p className="text-xs text-gray-400">vote{quantity > 1 ? "s" : ""}</p>
              </div>
              <button
                type="button"
                onClick={increment}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition active:scale-95"
              >
                +
              </button>
            </div>

            {/* Total cost */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-gray-500">Total cost</span>
              <span className="text-sm font-extrabold text-brand-700">
                GHS {total}.00
              </span>
            </div>

            {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

            {/* Action buttons */}
            <div className="flex gap-1.5">
              <button
                type="submit"
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl py-2 transition active:scale-95"
              >
                Pay GHS {total}.00
              </button>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="px-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl"
              >
                ✕
              </button>
            </div>
          </form>
        )}

        {/* Main vote button */}
        {status !== "picker" && (
          <button
            onClick={handleVoteClick}
            disabled={status === "paying" || status === "voted"}
            className={`mt-2 rounded-xl py-2 text-sm font-semibold text-white transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              status === "voted"
                ? "bg-green-500"
                : status === "error"
                ? "bg-red-500"
                : status === "paying"
                ? "bg-brand-400"
                : "bg-brand-600 hover:bg-brand-700"
            }`}
          >
            {status === "voted"
              ? "✓ Voted!"
              : status === "paying"
              ? "Processing…"
              : status === "error"
              ? "Try again"
              : "Vote — GHS 1"}
          </button>
        )}
      </div>
    </div>
  );
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}
