"use client";

import { useState, useEffect } from "react";

interface DownloadPageProps {
  id: string;
  name: string;
  size: number;
  expiresAt: number;
}

export default function DownloadPage({ id, name, size, expiresAt }: DownloadPageProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expiresAt - now;

      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (expired) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-6xl font-bold text-zinc-700 mb-4">Expired</h1>
        <p className="text-zinc-400 text-lg">This file is no longer available.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-3">&#128196;</div>
          <h2 className="text-lg font-semibold text-zinc-100 break-all">{name}</h2>
          <p className="text-zinc-500 text-sm mt-1">{formatSize(size)}</p>
        </div>

        <div className="text-center text-sm text-zinc-500">
          Expires in <span className="text-zinc-300 font-mono">{timeLeft}</span>
        </div>

        <a
          href={`/api/download/${id}`}
          className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-center"
        >
          Download
        </a>
      </div>
    </div>
  );
}
