"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ContestantCard from "@/components/ContestantCard";

type Contestant = { id: string; name: string; code: string; act: string | null; photoUrl: string | null; votes: number; };
type VotedInfo = { name: string; qty: number; photo: string | null };

function VotePageInner() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState<VotedInfo | null>(null);
  const searchParams = useSearchParams();

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) setContestants(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Handle Paystack redirect back after mobile money payment
  // Paystack redirects to /api/payment/verify which redirects to /vote?voted=ID&qty=N
  useEffect(() => {
    const votedId = searchParams.get("voted");
    const qty = Math.max(1, parseInt(searchParams.get("qty") || "1", 10));
    if (!votedId) return;

    // If contestants haven't loaded yet, wait for them
    if (contestants.length === 0) return;

    const c = contestants.find((x) => x.id === votedId);
    if (c && !voted) {
      setVoted({ name: c.name, qty, photo: c.photoUrl });
      // Clean the URL so refreshing doesn't retrigger
      window.history.replaceState({}, "", "/vote");
      setTimeout(() => { setVoted(null); load(); }, 6000);
    }
  }, [searchParams, contestants, voted, load]);

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  // Called by inline Paystack callback (desktop/some browsers)
  function handleVoted(name: string, qty: number, photo: string | null) {
    setSelectedId(null);
    setVoted({ name, qty, photo });
    setTimeout(() => { setVoted(null); load(); }, 6000);
  }

  return (
    <main className="min-h-screen">

      {/* Full-screen voted overlay */}
      {voted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(24px)" }}>
          <div className="flex flex-col items-center gap-5 max-w-sm w-full">

            {/* Animated checkmark */}
            <div className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 0 80px rgba(34,197,94,0.8)" }}>
              <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Payment Successful</p>
              <h2 className="text-4xl font-extrabold text-white">Thank You!</h2>
              <p className="text-white/60 text-sm">
                You cast{" "}
                <span className="text-yellow-400 font-bold">{voted.qty} {voted.qty === 1 ? "vote" : "votes"}</span>{" "}
                for
              </p>
              <p className="text-yellow-400 font-extrabold text-2xl leading-tight">{voted.name}</p>
            </div>

            {/* Photo with VOTED badge */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden relative"
              style={{ border: "4px solid rgba(34,197,94,0.9)", boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}>
              {voted.photo ? (
                <Image src={voted.photo} alt={voted.name} fill sizes="128px" className="object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-green-900 flex items-center justify-center">
                  <span className="text-yellow-400 font-extrabold text-5xl">{voted.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 py-2" style={{ background: "rgba(34,197,94,0.95)" }}>
                <p className="text-white text-xs font-extrabold text-center tracking-widest">✓ VOTED</p>
              </div>
            </div>

            <p className="text-white/40 text-xs">Returning to voting page in a moment…</p>

            {/* Countdown bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full animate-shrink" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-0">
          <Image src="/logo.png" alt="ADYOTs Logo" width={220} height={110} className="object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">Adventist Youth Talented Show</h1>
        <p className="text-yellow-300/70 text-sm mt-1 tracking-widest uppercase">Yeretete Daakye Akandifo</p>
      </div>

      <div className="border-t border-yellow-400/20 mx-4" />

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-24 text-white/30">Loading contestants…</div>
        ) : contestants.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-xl font-semibold text-white">No contestants yet</h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {contestants.map((c) => (
              <ContestantCard
                key={c.id}
                contestant={c}
                isOpen={selectedId === c.id}
                onSelect={() => handleSelect(c.id)}
                onVoted={handleVoted}
              />
            ))}
          </div>
        )}
        <div className="mt-12 text-center text-sm text-white/40">
          <Link href="/" className="hover:text-yellow-400 transition">Back</Link>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-white/20">Built by <span className="text-yellow-400/50 font-semibold">Pascal Consult</span></p>
          <p className="text-xs text-white/15 mt-0.5">Call: 0534406881 | WhatsApp: 0553324655</p>
        </div>
      </div>
    </main>
  );
}

export default function VotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/30">Loading…</div>}>
      <VotePageInner />
    </Suspense>
  );
}
