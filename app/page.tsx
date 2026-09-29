"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
export default function SplashPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 500); return () => clearTimeout(t); }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <p className="text-white/5 font-extrabold text-[18vw] whitespace-nowrap uppercase tracking-widest">ADYOTs</p>
      </div>
      <div className="z-10 flex flex-col items-center text-center gap-3">
        <Image src="/logo.png" alt="ADYOTs Logo" width={160} height={80} className="object-contain drop-shadow-lg" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">Adventist Youth<br/>Talented Show</h1>
        <p className="text-yellow-400 font-semibold text-base tracking-wide">Yeretete Daakye Akandifo</p>
        <p className="text-white/50 text-sm max-w-xs">Support your favourite performer by casting your vote today</p>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{background:"linear-gradient(180deg,#0a1a0a 0%,#0d230d 100%)",border:"1px solid rgba(250,204,21,0.25)"}}>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <div className="px-6 py-8 flex flex-col items-center gap-5">
              <Image src="/logo.png" alt="ADYOTs Logo" width={120} height={60} className="object-contain" />
              <div className="text-center space-y-1">
                <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Welcome to</p>
                <h2 className="text-2xl font-extrabold text-white">Adventist Youth Talented Show</h2>
                <p className="text-yellow-400 text-sm font-bold">ADYOTs — Yeretete Daakye Akandifo</p>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="w-full space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5">
                  <span className="text-white/60">Vote price</span>
                  <span className="text-yellow-400 font-extrabold text-base">GHS 1.00 per vote</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5">
                  <span className="text-white/60">Payment method</span>
                  <span className="text-white font-medium">Mobile Money</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5">
                  <span className="text-white/60">Networks</span>
                  <span className="text-white font-medium">MTN · Vodafone · AirtelTigo</span>
                </div>
              </div>
              <Link href="/vote" className="w-full py-4 rounded-2xl font-extrabold text-gray-900 text-base text-center active:scale-95 transition-transform" style={{background:"linear-gradient(90deg,#facc15,#f59e0b)",boxShadow:"0 4px 24px rgba(250,204,21,0.35)"}}>Start Voting Now →</Link>
              <div className="flex items-center gap-6 text-xs text-white/30">
                <Link href="/results" className="hover:text-yellow-400 transition">📊 Live Leaderboard</Link>
                <span>|</span>
                <span>GHS 1 = 1 Vote</span>
              </div>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
          </div>
        </div>
      )}
    </main>
  );
}
