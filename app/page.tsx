"use client";
import Image from "next/image";
import Link from "next/link";
export default function SplashPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="h-1 w-full rounded-t-3xl" style={{background:"linear-gradient(90deg,#facc15,#f59e0b,#facc15)"}} />
        <div className="rounded-b-3xl px-6 py-8 flex flex-col items-center gap-5 text-center shadow-2xl" style={{background:"rgba(5,12,5,0.97)",border:"1px solid rgba(250,204,21,0.2)",borderTop:"none"}}>
          <Image src="/logo.png" alt="ADYOTs Logo" width={160} height={80} className="object-contain" />
          <div className="space-y-1">
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Welcome to</p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">Adventist Youth Talented Show</h1>
            <p className="text-yellow-400 text-sm font-bold">ADYOTs - Yeretete Daakye Akandifo</p>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="w-full space-y-2 text-sm">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <span className="text-white/50">Vote price</span>
              <span className="text-yellow-400 font-extrabold">GHS 1.00 per vote</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <span className="text-white/50">Payment</span>
              <span className="text-white font-medium">Mobile Money</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <span className="text-white/50">Networks</span>
              <span className="text-white font-medium">MTN - Vodafone - AirtelTigo</span>
            </div>
          </div>
          <Link href="/vote" className="w-full py-4 rounded-2xl font-extrabold text-gray-900 text-base text-center active:scale-95 transition-transform" style={{background:"linear-gradient(90deg,#facc15,#f59e0b)",boxShadow:"0 4px 20px rgba(250,204,21,0.3)"}}>Start Voting Now</Link>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/results" className="hover:text-yellow-400 transition">Live Leaderboard</Link>
            <span>|</span>
            <span>GHS 1 = 1 Vote</span>
          </div>
          <div className="pt-2 border-t border-white/5 text-center">
            <p className="text-xs text-white/20">Built by <span className="text-yellow-400/50 font-semibold">Pascal Consult</span></p>
            <p className="text-xs text-white/15">0534406881 | WhatsApp: 0553324655</p>
          </div>
        </div>
      </div>
    </main>
  );
}

