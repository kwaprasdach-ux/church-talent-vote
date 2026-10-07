import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://church-talent-vote.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "ADYOTs — Vote for Your Favourite Performer",
  description: "Cast your vote for your favourite performer at the Adventist Youth Talented Show (ADYOTs — Yeretete Daakye Akandifo). GHS 1 = 1 Vote. Mobile money accepted.",
  keywords: ["ADYOTs", "Adventist Youth Talented Show", "Yeretete Daakye Akandifo", "talent show", "voting", "Ghana"],
  openGraph: {
    title: "ADYOTs — Vote for Your Favourite Performer 🎤",
    description: "Cast your vote now! GHS 1 = 1 Vote. MTN · Telecel · AirtelTigo Mobile Money accepted.",
    url: APP_URL,
    siteName: "ADYOTs Talent Show",
    type: "website",
    images: [
      {
        url: "/backdrop.jpg",
        width: 1200,
        height: 630,
        alt: "ADYOTs — Adventist Youth Talented Show",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADYOTs — Vote for Your Favourite Performer 🎤",
    description: "Cast your vote now! GHS 1 = 1 Vote. MTN · Telecel · AirtelTigo Mobile Money accepted.",
    images: ["/backdrop.jpg"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundImage: "url('/backdrop.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundColor: "#031a0e",
        }}
      >
        <div className="min-h-screen bg-navy-900/70 backdrop-blur-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
