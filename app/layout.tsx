import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADYOTs - Yeretete Daakye Akandifo | Talent Show Voting",
  description: "Vote for your favourite performer at the Adventist Youth Talented Show (ADYOTs - Yeretete Daakye Akandifo).",
  openGraph: {
    title: "ADYOTs - Yeretete Daakye Akandifo",
    description: "Vote for your favourite performer at the Adventist Youth Talented Show.",
    type: "website",
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
        {/* Paystack loaded lazily inside ContestantCard — not needed globally */}
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
