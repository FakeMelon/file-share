import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "File Share",
  description: "Simple self-hosted file sharing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
        <footer className="text-center text-zinc-600 text-sm py-4">
          File Share
        </footer>
      </body>
    </html>
  );
}
