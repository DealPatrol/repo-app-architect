import type { Metadata } from "next";
import { SessionProvider } from "./components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Architect – AI-Powered GitHub Analysis",
  description: "Analyze repos, discover projects, find reusable files, and export blueprints",
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
