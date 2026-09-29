import { prisma } from "@/lib/prisma";
import ContestantCard from "@/components/ContestantCard";
import Link from "next/link";
import Image from "next/image";
export const dynamic = "force-dynamic";
export default async function VotePage() {
  const contestants = await prisma.contestant.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-0"><Image src="/logo.png" alt="ADYOTs Logo" width={220} height={110} className="object-contain drop-shadow-lg" /></div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">Adventist Youth Talented Show</h1>
        <p className="text-yellow-300/70 text-sm mt-1 tracking-widest uppercase">Yeretete Daakye Akandifo</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-yellow-400/30 rounded-full px-5 py-2 text-sm font-medium text-white">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{totalVotes} {totalVotes === 1 ? "vote" : "votes"} cast so far
        </div>
      </div>
      <div className="border-t border-yellow-400/20 mx-4" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {contestants.length === 0 ? (
          <div className="text-center py-24"><div className="text-6xl mb-4">🎤</div><h2 className="text-xl font-semibold text-white">No contestants yet</h2></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {contestants.map((c) => (
              <ContestantCard key={c.id} contestant={{ id: c.id, name: c.name, code: c.code, act: c.act, photoUrl: c.photoUrl, votes: c.votes }} />
            ))}
          </div>
        )}
        <div className="mt-12 text-center flex items-center justify-center gap-6 text-sm text-white/40">
          <Link href="/" className="hover:text-yellow-400 transition">Back</Link>
          <Link href="/results" className="hover:text-yellow-400 transition font-medium">Live Leaderboard</Link>
        </div>
      </div>
    </main>
  );
}


