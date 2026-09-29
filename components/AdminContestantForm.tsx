"use client";
import { useState, useRef } from "react";
import Image from "next/image";

export default function AdminContestantForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) { const d = await res.json(); setPhotoUrl(d.url); }
    else { setError("Photo upload failed. Try again."); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true); setError(""); setSuccess("");
    const res = await fetch("/api/contestants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), act: null, photoUrl: photoUrl || null }),
    });
    setSubmitting(false);
    if (res.ok) {
      setName(""); setPhotoUrl("");
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(name.trim() + " has been added!");
      setTimeout(() => setSuccess(""), 3000);
      onAdded();
    } else { setError("Could not add contestant. Try again."); }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-5 space-y-4" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(250,204,21,0.15)"}}>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Full Name <span className="text-red-400">*</span></label>
        <input placeholder="e.g. Abena Mensah" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Photo <span className="text-white/30 font-normal">(optional)</span></label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 transition active:scale-95"
            style={{background:"linear-gradient(90deg,#facc15,#f59e0b)"}}>
            {uploading ? "Uploading..." : "Choose Photo"}
          </button>
          {photoUrl && (
            <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-yellow-400/30">
              <Image src={photoUrl} alt="preview" fill sizes="48px" className="object-cover" />
            </div>
          )}
          {photoUrl && <button type="button" onClick={() => { setPhotoUrl(""); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-400/20 rounded-xl px-4 py-2">{error}</p>}
      {success && <p className="text-sm text-green-400 bg-green-900/20 border border-green-400/20 rounded-xl px-4 py-2">{success}</p>}
      <button type="submit" disabled={submitting || !name.trim()}
        className="px-6 py-2.5 rounded-xl font-bold text-gray-900 transition active:scale-95 disabled:opacity-50"
        style={{background:"linear-gradient(90deg,#facc15,#f59e0b)"}}>
        {submitting ? "Adding..." : "Add Contestant"}
      </button>
    </form>
  );
}
