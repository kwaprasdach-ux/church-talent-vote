import { prisma } from "@/lib/prisma";
import ContestantCard from "@/components/ContestantCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const contestants = await prisma.contestant.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

  return (
    <main className="min-h-screen">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-2">
            ✨ Church Talent Show ✨
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
            Vote for Your Favourite
          </h1>
          <p className="text-brand-200 text-base sm:text-lg max-w-md mx-auto">
            Support your favourite performer — every vote counts!
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-5 py-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"} cast so far
          </div>
        </div>
      </div>

      {/* Contestant grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {contestants.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-xl font-semibold text-gray-700">No contestants yet</h2>
            <p className="text-gray-400 mt-2">Check back soon — the show is coming!</p>
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

        {/* Footer links */}
        <div className="mt-12 text-center text-sm text-gray-400 flex items-center justify-center gap-4">
          <Link
            href="/results"
            className="hover:text-brand-600 font-medium transition-colors"
          >
            📊 View live leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
