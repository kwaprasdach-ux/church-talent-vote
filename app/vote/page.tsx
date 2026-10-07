"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ContestantCard from "@/components/ContestantCard";

type Contestant = { id: string; name: string; code: string; act: string | null; photoUrl: string | null; votes: number; };

function VotePageInner() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justVotedId, setJustVotedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) setContestants(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Handle redirect back from Paystack mobile money (?voted=ID&qty=N)
  useEffect(() => {
    const votedId = searchParams.get("voted");
    if (!votedId || contestants.length === 0) return;
    setJustVotedId(votedId);
    window.history.replaceState({}, "", "/vote");
    load();
    setTimeout(() => setJustVotedId(null), 6000);
  }, [searchParams, contestants.length, load]);

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleVoted() {
    load(); // refresh vote counts in background
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-0">
          <Image src="/logo.png" alt="ADYOTs Logo" width={220} height={110} className="object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">Adventist Youth Talented Show</h1>
        <p className="text-yellow-300/70 text-sm mt-1 tracking-widest uppercase">Yeretete Daakye Akandifo</p>
      </div>

      <div className="border-t border-yellow-400/20 mx-4" />

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
                startVoted={justVotedId === c.id}
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
