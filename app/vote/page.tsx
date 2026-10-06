import { prisma } from "@/lib/prisma";
import ContestantCard from "@/components/ContestantCard";
import Link from "next/link";
import Image from "next/image";
export const dynamic = "force-dynamic";
export default async function VotePage() {
  const contestants = await prisma.contestant.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-0"><Image src="/logo.png" alt="ADYOTs Logo" width={220} height={110} className="object-contain drop-shadow-lg" /></div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">Adventist Youth Talented Show</h1>
        <p className="text-yellow-300/70 text-sm mt-1 tracking-widest uppercase">Yeretete Daakye Akandifo</p>
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
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-white/20">Built by <span className="text-yellow-400/50 font-semibold">Pascal Consult</span></p>
          <p className="text-xs text-white/15 mt-0.5">Call: 0534406881 | WhatsApp: 0553324655</p>
        </div>
      </div>
    </main>
  );
}



