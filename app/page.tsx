import { prisma } from "@/lib/prisma";
import ContestantCard from "@/components/ContestantCard";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const contestants = await prisma.contestant.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

  return (
    <main className="min-h-screen">
      {/* Hero header */}
      <div className="relative">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="ADYOTs Logo"
              width={120}
              height={120}
              className="rounded-full shadow-2xl border-4 border-brand-400"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-400 leading-tight drop-shadow-lg">
            Adventist Youth Talented Show
          </h1>
          <p className="text-brand-300 text-lg font-semibold mt-1">
            ADYOTs — Yeretete Daakye Akandifo
          </p>
          <p className="text-white/70 text-sm mt-3 max-w-md mx-auto">
            Vote for your favourite performer — GHS 1 per vote
          </p>

          {/* Live vote counter */}
          <div className="mt-5 inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-brand-400/30 rounded-full px-5 py-2 text-sm font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"} cast so far
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-400/20 mx-4" />

      {/* Contestant grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {contestants.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-xl font-semibold text-white">No contestants yet</h2>
            <p className="text-white/50 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {contestants.map((c) => (
              <ContestantCard
                key={c.id}
                contestant={{
                  id: c.id,
                  name: c.name,
                  act: c.act,
                  photoUrl: c.photoUrl,
                  votes: c.votes,
                }}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center flex items-center justify-center gap-6 text-sm text-white/40">
          <Link href="/results" className="hover:text-brand-400 transition font-medium">
            📊 Live Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
