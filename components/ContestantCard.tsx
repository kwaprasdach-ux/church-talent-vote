"use client";

import { useState } from "react";
import Image from "next/image";

type Contestant = {
  id: string;
  name: string;
  act: string | null;
  photoUrl: string | null;
  votes: number;
};

export default function ContestantCard({ contestant }: { contestant: Contestant }) {
  const [status, setStatus] = useState<"idle" | "voting" | "voted">("idle");
  const [votes, setVotes] = useState(contestant.votes);
  const [popping, setPopping] = useState(false);

  async function vote() {
    if (status !== "idle") return;
    setStatus("voting");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId: contestant.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVotes(data.votes);
      setStatus("voted");
      setPopping(true);
      setTimeout(() => setPopping(false), 400);
      // Reset after 3 seconds so user can see the confirmation
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("idle");
      alert("Sorry, your vote didn't go through. Please try again.");
    }
  }

  const initial = contestant.name.charAt(0).toUpperCase();

  return (
    <div
      className={`card flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-md ${
        status === "voted" ? "ring-2 ring-green-400" : ""
      }`}
    >
      {/* Photo / Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center overflow-hidden relative">
        {contestant.photoUrl ? (
          <Image
            src={contestant.photoUrl}
            alt={contestant.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <span className="text-5xl font-extrabold text-brand-400 select-none">
            {initial}
          </span>
        )}
        {/* Voted overlay */}
        {status === "voted" && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">
          {contestant.name}
        </h3>
        {contestant.act && (
          <p className="text-xs text-brand-600 font-medium truncate">{contestant.act}</p>
        )}
        <p className="text-xs text-gray-400">
          {votes} {votes === 1 ? "vote" : "votes"}
        </p>

        {/* Vote button */}
        <button
          onClick={vote}
          disabled={status === "voting"}
          className={`mt-2 rounded-xl py-2 text-sm font-semibold text-white transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
            popping ? "pop" : ""
          } ${
            status === "voted"
              ? "bg-green-500"
              : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          {status === "voted"
            ? "✓ Voted!"
            : status === "voting"
            ? "Voting…"
            : "Vote"}
        </button>
      </div>
    </div>
  );
}
