"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminContestantForm from "@/components/AdminContestantForm";
import Image from "next/image";

type Contestant = {
  id: string;
  name: string;
  act: string | null;
  photoUrl: string | null;
  votes: number;
  order: number;
};

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ name: "", act: "", photoUrl: "" });
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/contestants", { cache: "no-store" });
    if (res.ok) {
      setContestants(await res.json());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  async function remove(id: string, name: string) {
    if (!confirm(`Remove "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/contestants/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(c: Contestant) {
    setEditingId(c.id);
    setEditFields({ name: c.name, act: c.act ?? "", photoUrl: c.photoUrl ?? "" });
  }

  async function saveEdit(id: string) {
    await fetch(`/api/contestants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFields),
    });
    setEditingId(null);
    load();
  }

  async function resetAllVotes() {
    if (
      !confirm(
        "Reset ALL votes to zero? This cannot be undone."
      )
    )
      return;
    setResetting(true);
    await fetch("/api/admin/reset", { method: "POST" });
    setResetting(false);
    load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
  const sorted = [...contestants].sort((a, b) => b.votes - a.votes);
  const top = sorted[0];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-600 text-xl">✝️</span>
            <span className="font-bold text-gray-900">Talent Show Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:underline hidden sm:block"
            >
              View voting page ↗
            </a>
            <a
              href="/results"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:underline hidden sm:block"
            >
              Leaderboard ↗
            </a>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Votes</p>
            <p className="text-3xl font-extrabold text-brand-700 mt-1">{totalVotes}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Contestants</p>
            <p className="text-3xl font-extrabold text-brand-700 mt-1">{contestants.length}</p>
          </div>
          {top && (
            <div className="card p-4 col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Leading</p>
              <p className="text-lg font-extrabold text-brand-700 mt-1 truncate">{top.name}</p>
              <p className="text-xs text-gray-400">{top.votes} votes</p>
            </div>
          )}
        </div>

        {/* Add contestant */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Add Contestant</h2>
          <AdminContestantForm onAdded={load} />
        </section>

        {/* Live Results */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">
              Live Results
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </h2>
            <button
              onClick={resetAllVotes}
              disabled={resetting || totalVotes === 0}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition disabled:opacity-40"
            >
              {resetting ? "Resetting…" : "Reset all votes"}
            </button>
          </div>

          <div className="card overflow-hidden divide-y divide-gray-100">
            {loading && (
              <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
            )}
            {!loading && sorted.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">
                No contestants yet. Add one above.
              </div>
            )}

            {sorted.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
              const isEditing = editingId === c.id;
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

              return (
                <div key={c.id} className="p-4">
                  {isEditing ? (
                    /* Edit row */
                    <div className="flex flex-col gap-2">
                      <input
                        className="input text-sm"
                        value={editFields.name}
                        onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                        placeholder="Name"
                      />
                      <input
                        className="input text-sm"
                        value={editFields.act}
                        onChange={(e) => setEditFields({ ...editFields, act: e.target.value })}
                        placeholder="Act"
                      />
                      <input
                        className="input text-sm"
                        value={editFields.photoUrl}
                        onChange={(e) => setEditFields({ ...editFields, photoUrl: e.target.value })}
                        placeholder="Photo URL"
                        type="url"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="btn-primary text-sm py-1.5 px-4"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary text-sm py-1.5 px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display row */
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <span className="w-7 text-center shrink-0">
                        {medal ?? (
                          <span className="text-sm text-gray-400 font-medium">#{i + 1}</span>
                        )}
                      </span>

                      {/* Photo */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-brand-100 flex items-center justify-center relative">
                        {c.photoUrl ? (
                          <Image
                            src={c.photoUrl}
                            alt={c.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-brand-500 font-bold text-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Name + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold text-gray-900 truncate text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500 shrink-0">
                            {c.votes} · {pct}%
                          </p>
                        </div>
                        {c.act && (
                          <p className="text-xs text-brand-600 font-medium">{c.act}</p>
                        )}
                        <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs text-gray-400 hover:text-brand-600 transition px-2 py-1 rounded-lg hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(c.id, c.name)}
                          className="text-xs text-red-400 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          Remove
                        </button>
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
