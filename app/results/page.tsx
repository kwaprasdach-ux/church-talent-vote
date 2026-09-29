"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Contestant = { id: string; name: string; act: string | null; photoUrl: string | null; votes: number; };

export default function ResultsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) { setContestants((await res.json()).sort((a: Contestant, b: Contestant) => b.votes - a.votes)); setLastUpdated(new Date()); setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, [load]);

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">Adventist Youth Talented Show</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Live Leaderboard</h1>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-5 py-2 text-sm font-medium text-white">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {totalVotes} total {totalVotes === 1 ? "vote" : "votes"} - updates every 4s
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl skeleton" /><div className="flex-1 space-y-2"><div className="h-3.5 rounded skeleton w-1/3" /><div className="h-2.5 rounded skeleton w-full" /></div></div>))}</div>
        ) : contestants.length === 0 ? (
          <div className="text-center py-20"><p className="text-white/50">No contestants yet - check back soon!</p></div>
        ) : (
          <div className="space-y-3">
            {contestants.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
              const rankColor = i === 0 ? "ring-2 ring-yellow-400 shadow-md" : i === 1 ? "ring-1 ring-gray-400" : i === 2 ? "ring-1 ring-amber-500" : "";
              const barColor = i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-500" : "bg-green-500";
              return (
                <div key={c.id} className={`card p-4 flex items-center gap-3 transition-all ${rankColor}`}>
                  <div className="w-8 text-center shrink-0">
                    {i === 0 ? <span className="text-xl">1st</span> : i === 1 ? <span className="text-lg text-gray-300">2nd</span> : i === 2 ? <span className="text-lg text-amber-400">3rd</span> : <span className="text-sm text-white/50 font-bold">{i + 1}</span>}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-green-900 flex items-center justify-center relative">
                    {c.photoUrl ? (<Image src={c.photoUrl} alt={c.name} fill sizes="48px" className="object-cover" />) : (<span className="text-yellow-400 font-bold text-lg">{c.name.charAt(0).toUpperCase()}</span>)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-bold text-white truncate">{c.name}</p>
                      <p className="text-sm font-semibold text-yellow-400 shrink-0">{c.votes} {c.votes === 1 ? "vote" : "votes"}</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1.5">
                      <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">{pct}% of votes</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-10 text-center flex items-center justify-center gap-6 text-sm text-white/30">
          <Link href="/vote" className="hover:text-yellow-400 transition font-medium">Back to voting</Link>
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>
    </main>
  );
}
