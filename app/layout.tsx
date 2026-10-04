import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grokked — Vibe Code with High Comprehension",
  description:
    "Vibe code apps with AI, but prove you understand each step before unlocking the next. Powered by Gemini multi-agent architecture.",
  keywords: ["vibe coding", "AI coding", "Gemini 2.5", "programming comprehension", "hackathon"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080c14] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        {children}
      </body>
    </html>
  );
}
