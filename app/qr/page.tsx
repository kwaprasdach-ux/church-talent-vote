import Image from "next/image";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://church-talent-vote.vercel.app";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(SITE_URL)}`;

export default function QRPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="h-1 w-full rounded-t-3xl" style={{ background: "linear-gradient(90deg,#facc15,#f59e0b,#facc15)" }} />
        <div className="rounded-b-3xl px-6 py-8 flex flex-col items-center gap-5 text-center shadow-2xl"
          style={{ background: "rgba(5,12,5,0.97)", border: "1px solid rgba(250,204,21,0.2)", borderTop: "none" }}>

          <Image src="/logo.png" alt="ADYOTs Logo" width={120} height={60} className="object-contain" />

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white">Scan to Vote</h1>
            <p className="text-yellow-400 text-sm font-bold">ADYOTs — Yeretete Daakye Akandifo</p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={QR_URL} alt="QR code for voting site" width={300} height={300} className="block" />
          </div>

          <a href={SITE_URL} target="_blank" rel="noreferrer"
            className="text-yellow-400 text-xs font-semibold break-all underline underline-offset-2 hover:text-yellow-300 transition">
            {SITE_URL}
          </a>
          <p className="text-white/40 text-xs">Point your phone camera at the code above or click the link to open the voting page</p>

          <a href={QR_URL} download="adyots-vote-qr.png" target="_blank" rel="noreferrer"
            className="w-full py-3 rounded-2xl font-extrabold text-gray-900 text-sm text-center"
            style={{ background: "linear-gradient(90deg,#facc15,#f59e0b)" }}>
            ⬇ Download QR Code
          </a>

          <Link href="/" className="text-xs text-white/30 hover:text-yellow-400 transition">← Back to home</Link>

          <div className="pt-2 border-t border-white/5 w-full text-center">
            <p className="text-xs text-white/20">Built by <span className="text-yellow-400/50 font-semibold">Pascal Consult</span></p>
            <p className="text-xs text-white/15">0534406881 | WhatsApp: 0553324655</p>
          </div>
        </div>
      </div>
    </main>
  );
}
