import type { Metadata } from "next";
import { SessionProvider } from "./components/SessionProvider";
import "./globals.css";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: "Repo Architect – AI-Powered GitHub Analysis",
  description: "Analyze repos, discover projects, find reusable files, and export blueprints",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Repo Architect – AI-Powered GitHub Analysis",
    description: "Analyze repos, discover projects, find reusable files, and export blueprints",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repo Architect – AI-Powered GitHub Analysis",
    description: "Analyze repos, discover projects, find reusable files, and export blueprints",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--bg)]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
