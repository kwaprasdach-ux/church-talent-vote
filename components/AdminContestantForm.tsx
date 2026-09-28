"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  onAdded: () => void;
};

export default function AdminContestantForm({ onAdded }: Props) {
  const [name, setName] = useState("");
  const [act, setAct] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ACT_PRESETS = ["Singing", "Dancing", "Poetry", "Comedy", "Instrument", "Drama", "Other"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/contestants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), act: act.trim(), photoUrl: photoUrl.trim() }),
    });

    setSubmitting(false);

    if (res.ok) {
      setName("");
      setAct("");
      setPhotoUrl("");
      setSuccess(`"${name.trim()}" has been added!`);
      setTimeout(() => setSuccess(""), 3000);
      onAdded();
    } else {
      setError("Couldn't add contestant. Please try again.");
    }
  }

  const previewUrl = photoUrl.trim().startsWith("http") ? photoUrl.trim() : null;

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="e.g. Abena Mensah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </div>

        {/* Act type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Act / Category
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {ACT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAct(preset)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  act === preset
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-400"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            placeholder="Or type custom act…"
            value={act}
            onChange={(e) => setAct(e.target.value)}
            className="input"
          />
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            placeholder="https://example.com/photo.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="input"
            type="url"
          />
          {previewUrl && (
            <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-200 relative">
              <Image
                src={previewUrl}
                alt="preview"
                fill
                sizes="64px"
                className="object-cover"
                onError={() => setPhotoUrl("")}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          ⚠️ {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          ✅ {success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="btn-primary"
      >
        {submitting ? "Adding…" : "Add Contestant"}
      </button>
    </form>
  );
}
