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

export default function ContestantCard({ contestant }: { contestant: Contestant }) {
  const [status, setStatus] = useState<"idle" | "prompt" | "paying" | "voted" | "error">("idle");
  const [email, setEmail] = useState("");
  const [votes, setVotes] = useState(contestant.votes);
  const [errorMsg, setErrorMsg] = useState("");

  const initial = contestant.name.charAt(0).toUpperCase();

  // Step 1: user clicks Vote — show email prompt
  function handleVoteClick() {
    if (status !== "idle") return;
    setStatus("prompt");
    setErrorMsg("");
  }

  // Step 2: user submits email — initialize Paystack payment
  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("paying");
    setErrorMsg("");

    try {
      // Initialize transaction
      const initRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId: contestant.id, email }),
      });
      const initData = await initRes.json();

      if (!initRes.ok || !initData.authorization_url) {
        throw new Error(initData.error || "Could not start payment");
      }

      // Load Paystack inline script dynamically
      await loadPaystackScript();

      // Open Paystack popup
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: 100, // GHS 1.00 in pesewas
        currency: "GHS",
        ref: initData.reference,
        label: `Vote for ${contestant.name}`,
        onClose: () => {
          setStatus("idle");
        },
        callback: async (response: { reference: string }) => {
          // Verify payment and cast vote
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
            setErrorMsg(verifyData.error || "Payment verified but vote failed.");
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
          }
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
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

        {/* Email prompt */}
        {status === "prompt" && (
          <form onSubmit={handlePay} className="mt-2 flex flex-col gap-1.5">
            <p className="text-xs text-gray-500">Enter email to pay GHS 1.00</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-xs py-1.5"
              autoFocus
              required
            />
            {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
            <div className="flex gap-1.5">
              <button
                type="submit"
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg py-1.5 transition"
              >
                Pay GHS 1
              </button>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="px-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg"
              >
                ✕
              </button>
            </div>
          </form>
        )}

        {/* Vote button (idle / paying / voted / error) */}
        {status !== "prompt" && (
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

        {errorMsg && status === "error" && (
          <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}

// Loads Paystack inline JS once
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}
