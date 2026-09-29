"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) { router.push("/admin"); router.refresh(); }
    else { setError("Incorrect password. Please try again."); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="ADYOTs Logo" width={140} height={70} className="object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
          <p className="text-white/50 text-sm mt-1">Adventist Youth Talented Show</p>
        </div>
        <div className="rounded-2xl p-6 shadow-2xl" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(250,204,21,0.25)"}}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Admin Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" autoFocus autoComplete="current-password" />
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400 flex items-center gap-2">
                <span>!</span> {error}
              </div>
            )}
            <button type="submit" disabled={loading || !password} className="w-full py-3 rounded-xl font-bold text-gray-900 transition active:scale-95 disabled:opacity-50" style={{background:"linear-gradient(90deg,#facc15,#f59e0b)"}}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-white/30 mt-4">Admin access only. Contact your event coordinator for the password.</p>
      </div>
    </main>
  );
}
