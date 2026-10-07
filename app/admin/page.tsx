"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminContestantForm from "@/components/AdminContestantForm";

type Contestant = { id: string; name: string; act: string | null; photoUrl: string | null; votes: number; order: number; };

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ name: "", act: "", photoUrl: "" });
  const [editUploading, setEditUploading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) { setContestants(await res.json()); setLoading(false); }
    else { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [load]);

  async function remove(id: string, name: string) {
    if (!confirm("Remove " + name + "? This cannot be undone.")) return;
    await fetch("/api/contestants/" + id, { method: "DELETE" }); load();
  }

  async function saveEdit(id: string) {
    await fetch("/api/contestants/" + id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editFields) });
    setEditingId(null); load();
  }

  async function handleEditPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setEditUploading(false);
    if (res.ok) { const d = await res.json(); setEditFields((f) => ({ ...f, photoUrl: d.url })); }
  }

  async function resetAllVotes() {
    if (!confirm("Reset ALL votes to zero? This cannot be undone.")) return;
    setResetting(true); await fetch("/api/admin/reset", { method: "POST" }); setResetting(false); load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" }); router.push("/admin/login"); router.refresh();
  }

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
  const sorted = [...contestants].sort((a, b) => b.votes - a.votes);

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-yellow-400/20" style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)"}}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="ADYOTs" width={80} height={40} className="object-contain" />
            <span className="font-bold text-white text-sm hidden sm:block">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/vote" target="_blank" className="text-xs text-yellow-400 hover:underline hidden sm:block">Voting page</a>
            <button onClick={logout} className="text-xs text-white/40 hover:text-white transition">Log out</button>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[{label:"Total Votes",value:totalVotes},{label:"Contestants",value:contestants.length}].map((s) => (
            <div key={s.label} className="rounded-2xl p-4" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(250,204,21,0.2)"}}>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-extrabold text-yellow-400 mt-1">{s.value}</p>
            </div>
          ))}
          {sorted[0] && (
            <div className="rounded-2xl p-4 col-span-2 sm:col-span-1" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(250,204,21,0.2)"}}>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Leading</p>
              <p className="text-base font-extrabold text-yellow-400 mt-1 truncate">{sorted[0].name}</p>
              <p className="text-xs text-white/30">{sorted[0].votes} votes</p>
            </div>
          )}
        </div>
        <section>
          <h2 className="text-base font-bold text-white mb-3">Add Contestant</h2>
          <AdminContestantForm onAdded={load} />
        </section>
        {/* Full leaderboard — admin only */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Live Leaderboard
              <span className="inline-flex items-center gap-1 text-xs font-normal text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
              </span>
            </h2>
            <button onClick={resetAllVotes} disabled={resetting || totalVotes === 0} className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg px-3 py-1.5 transition disabled:opacity-40">
              {resetting ? "Resetting..." : "Reset all votes"}
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden divide-y divide-white/5" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(250,204,21,0.15)"}}>
            {loading && <div className="p-6 text-center text-white/30 text-sm">Loading...</div>}
            {!loading && sorted.length === 0 && <div className="p-6 text-center text-white/30 text-sm">No contestants yet.</div>}
            {sorted.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
              const isEditing = editingId === c.id;
              const rankLabel = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
              const barColor = i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-500" : "bg-green-500";
              const ringClass = i === 0 ? "ring-1 ring-yellow-400/40" : "";
              return (
                <div key={c.id} className={`p-4 ${ringClass}`}>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input className="input text-sm" value={editFields.name} onChange={(e) => setEditFields({...editFields, name: e.target.value})} placeholder="Name" />
                      <input className="input text-sm" value={editFields.act} onChange={(e) => setEditFields({...editFields, act: e.target.value})} placeholder="Act / talent" />
                      {/* Photo upload */}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => editFileRef.current?.click()}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-900 transition active:scale-95 disabled:opacity-60"
                          style={{background:"linear-gradient(90deg,#facc15,#f59e0b)"}}
                          disabled={editUploading}>
                          {editUploading ? "Uploading…" : "Upload Photo"}
                        </button>
                        {editFields.photoUrl && (
                          <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-yellow-400/30 shrink-0">
                            <Image src={editFields.photoUrl} alt="preview" fill sizes="40px" className="object-cover" />
                          </div>
                        )}
                        {editFields.photoUrl && (
                          <button type="button" onClick={() => setEditFields((f) => ({...f, photoUrl: ""}))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                        )}
                      </div>
                      <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditPhoto} className="hidden" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(c.id)} className="flex-1 bg-yellow-400 text-gray-900 font-bold text-sm py-2 rounded-xl">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-white/10 text-white text-sm py-2 rounded-xl">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center shrink-0 text-sm font-bold">{rankLabel}</span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-green-900 flex items-center justify-center relative">
                        {c.photoUrl ? (<Image src={c.photoUrl} alt={c.name} fill sizes="40px" className="object-cover" />) : (<span className="text-yellow-400 font-bold text-sm">{c.name.charAt(0).toUpperCase()}</span>)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold text-white truncate text-sm">{c.name}</p>
                          <p className="text-xs text-white/40 shrink-0">{c.votes} ({pct}%)</p>
                        </div>
                        <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{width: pct + "%"}} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setEditingId(c.id); setEditFields({name:c.name,act:c.act??'',photoUrl:c.photoUrl??''}); }} className="text-xs text-white/40 hover:text-yellow-400 transition px-2 py-1 rounded-lg">Edit</button>
                        <button onClick={() => remove(c.id, c.name)} className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded-lg">Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}


