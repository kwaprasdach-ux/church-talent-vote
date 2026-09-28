"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Contestant = {
  id: string;
  name: string;
  act: string | null;
  photoUrl: string | null;
  votes: number;
};

export default function ResultsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) {
      const data: Contestant[] = await res.json();
      setContestants(data.sort((a, b) => b.votes - a.votes));
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-purple-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-2">
            ✨ Church Talent Show ✨
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Live Leaderboard</h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-5 py-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {totalVotes} total {totalVotes === 1 ? "vote" : "votes"} · updates every 4s
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded skeleton w-1/3" />
                  <div className="h-2.5 rounded skeleton w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : contestants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🎤</div>
            <p className="text-gray-500">No contestants yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contestants.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
              const isTop3 = i < 3;

              return (
                <div
                  key={c.id}
                  className={`card p-4 flex items-center gap-4 transition-all ${
                    i === 0
                      ? "ring-2 ring-yellow-400 shadow-md"
                      : i === 1
                      ? "ring-1 ring-gray-300"
                      : i === 2
                      ? "ring-1 ring-amber-300"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <span className="w-8 text-center shrink-0 text-xl">
                    {isTop3 ? medals[i] : (
                      <span className="text-sm text-gray-400 font-semibold">#{i + 1}</span>
                    )}
                  </span>

                  {/* Photo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-brand-100 flex items-center justify-center relative">
                    {c.photoUrl ? (
                      <Image
                        src={c.photoUrl}
                        alt={c.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-brand-500 font-bold text-lg">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-bold text-gray-900 truncate">{c.name}</p>
                      <p className="text-sm font-semibold text-brand-700 shrink-0">
                        {c.votes} {c.votes === 1 ? "vote" : "votes"}
                      </p>
                    </div>
                    {c.act && (
                      <p className="text-xs text-brand-600 font-medium mb-1">{c.act}</p>
                    )}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          i === 0
                            ? "bg-yellow-400"
                            : i === 1
                            ? "bg-gray-400"
                            : i === 2
                            ? "bg-amber-500"
                            : "bg-brand-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{pct}% of votes</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center flex items-center justify-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-brand-600 transition font-medium">
            ← Back to voting
          </Link>
          {lastUpdated && (
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </main>
  );
}
