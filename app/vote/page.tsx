"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import ContestantCard from "@/components/ContestantCard";

type Contestant = { id: string; name: string; code: string; act: string | null; photoUrl: string | null; votes: number; };
type VotedInfo = { name: string; qty: number; photo: string | null };

export default function VotePage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<VotedInfo | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) { setContestants(await res.json()); setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSelect(id: string) {
    // If tapping the already-open card, close it; otherwise open the new one
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleVoted(name: string, qty: number, photo: string | null) {
    setSelectedId(null);
    setVoted({ name, qty, photo });
    setTimeout(() => { setVoted(null); load(); }, 5000);
  }

  return (
    <main className="min-h-screen">

      {/* Full-screen voted overlay */}
      {voted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col items-center gap-5 max-w-sm w-full">
            {/* Green checkmark */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 0 50px rgba(34,197,94,0.5)" }}>
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest">Vote Confirmed!</p>
              <h2 className="text-2xl font-extrabold text-white">Thank you for voting!</h2>
              <p className="text-white/60 text-sm mt-2">
                You cast <span className="text-yellow-400 font-bold">{voted.qty} {voted.qty === 1 ? "vote" : "votes"}</span> for
              </p>
              <p className="text-yellow-400 font-extrabold text-xl">{voted.name}</p>
            </div>
            {/* Photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden relative bg-green-900 flex items-center justify-center"
              style={{ border: "3px solid rgba(34,197,94,0.6)" }}>
              {voted.photo
                ? <Image src={voted.photo} alt={voted.name} fill sizes="96px" className="object-cover object-top" />
                : <span className="text-yellow-400 font-extrabold text-3xl">{voted.name.charAt(0).toUpperCase()}</span>}
            </div>
            <p className="text-white/30 text-xs">Returning to voting page in a moment…</p>
            {/* Countdown bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full animate-shrink" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-0">
          <Image src="/logo.png" alt="ADYOTs Logo" width={220} height={110} className="object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">Adventist Youth Talented Show</h1>
        <p className="text-yellow-300/70 text-sm mt-1 tracking-widest uppercase">Yeretete Daakye Akandifo</p>
        {/* v2 */}
      </div>

      <div className="border-t border-yellow-400/20 mx-4" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-24 text-white/30">Loading contestants…</div>
        ) : contestants.length === 0 ? (
          <div className="text-center py-24"><div className="text-6xl mb-4">🎤</div><h2 className="text-xl font-semibold text-white">No contestants yet</h2></div>
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
        <div className="mt-12 text-center flex items-center justify-center gap-6 text-sm text-white/40">
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
