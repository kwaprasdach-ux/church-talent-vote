"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
export default function SplashPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t); }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {[...Array(20)].map((_,i) => (<div key={i} className="absolute w-1 h-1 rounded-full bg-yellow-300 animate-pulse pointer-events-none" style={{top:`${(i*37+11)%100}%`,left:`${(i*61+7)%100}%`,animationDelay:`${(i*0.4)%3}s`,opacity:0.3+(i%5)*0.12}} />))}
      <div className="z-10 flex flex-col items-center text-center px-4">
        <div className="relative mb-5"><div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-3xl scale-150" /><Image src="/logo.png" alt="ADYOTs Logo" width={130} height={130} className="relative rounded-full border-4 border-yellow-400 shadow-2xl" /></div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-400 drop-shadow-lg">ADYOTs</h1>
        <p className="text-white text-lg sm:text-xl font-bold mt-1">Adventist Youth Talented Show</p>
        <p className="text-yellow-300/70 text-sm mt-1 tracking-widest uppercase">Yeretete Daakye Akandifo</p>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{background:"linear-gradient(160deg,rgba(2,18,8,0.98),rgba(4,38,16,0.98),rgba(6,50,20,0.98))",border:"1px solid rgba(250,204,21,0.3)",boxShadow:"0 0 60px rgba(250,204,21,0.15),0 25px 50px rgba(0,0,0,0.8)"}}>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <div className="px-6 py-7 flex flex-col items-center gap-5 text-center">
              <div className="relative"><div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl" /><Image src="/logo.png" alt="ADYOTs Logo" width={88} height={88} className="relative rounded-full border-2 border-yellow-400/80 shadow-xl" /></div>
              <div className="space-y-1"><p className="text-yellow-400/80 text-xs font-semibold uppercase tracking-widest">Welcome to</p><h2 className="text-2xl font-extrabold text-white leading-tight">Adventist Youth<br />Talented Show</h2><p className="text-yellow-400 text-sm font-bold">ADYOTs - Yeretete Daakye Akandifo</p></div>
              <div className="w-full rounded-2xl p-4 space-y-2 text-sm" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(250,204,21,0.15)"}}>
                <p className="text-white/80 leading-relaxed">Cast your vote for your favourite performer and help them win!</p>
                <div className="flex items-center justify-center gap-2 pt-1"><span className="text-yellow-400 font-extrabold text-base">GHS 1.00</span><span className="text-white/40 text-xs">per vote</span></div>
                <p className="text-white/40 text-xs">Pay via MTN, Vodafone or AirtelTigo Mobile Money</p>
              </div>
              <Link href="/vote" className="w-full py-4 rounded-2xl font-extrabold text-gray-900 text-base text-center transition active:scale-95" style={{background:"linear-gradient(90deg,#facc15,#fbbf24,#facc15)",boxShadow:"0 4px 20px rgba(250,204,21,0.4)"}}>Start Voting Now</Link>
              <div className="flex items-center gap-4 text-xs text-white/30"><Link href="/results" className="hover:text-yellow-400 transition">Live Leaderboard</Link><span>GHS 1 = 1 vote</span></div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
          </div>
        </div>
      )}
    </main>
  );
}
