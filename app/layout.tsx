import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Church Talent Show — Vote Now!",
  description: "Cast your vote for your favourite performer at our church talent show.",
  openGraph: {
    title: "Church Talent Show — Vote Now!",
    description: "Cast your vote for your favourite performer at our church talent show.",
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
        <script src="https://js.paystack.co/v1/inline.js" async />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 antialiased">
        {children}
      </body>
    </html>
  );
}
