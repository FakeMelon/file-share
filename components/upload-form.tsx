"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type UploadState = "idle" | "uploading" | "done" | "error";

export default function UploadForm() {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [expiresIn, setExpiresIn] = useState("24h");
  const [state, setState] = useState<UploadState>("idle");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load password from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("upload-password");
    if (saved) setPassword(saved);
  }, []);

  // Save password to localStorage
  useEffect(() => {
    if (password) localStorage.setItem("upload-password", password);
  }, [password]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!file || !password) return;

    setState("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expiresIn", expiresIn);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-upload-password": password },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setShareUrl(data.url);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setShareUrl("");
    setState("idle");
    setError("");
    setCopied(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Success state
  if (state === "done") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="text-center">
          <div className="text-green-400 text-4xl mb-2">&#10003;</div>
          <h2 className="text-xl font-semibold">File uploaded!</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none"
          />
          <button
            onClick={copyLink}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={reset}
          className="w-full text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
        >
          Upload another file
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter upload password"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-500/10"
            : file
            ? "border-green-500/50 bg-green-500/5"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div>
            <p className="text-zinc-200 font-medium">{file.name}</p>
            <p className="text-zinc-500 text-sm mt-1">{formatSize(file.size)}</p>
          </div>
        ) : (
          <div>
            <p className="text-zinc-400">
              Drop a file here or <span className="text-blue-400">browse</span>
            </p>
            <p className="text-zinc-600 text-sm mt-1">Max 100MB</p>
          </div>
        )}
      </div>

      {/* Expiration */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">
          Expires in
        </label>
        <div className="flex gap-2">
          {[
            { value: "1h", label: "1 hour" },
            { value: "24h", label: "24 hours" },
            { value: "7d", label: "7 days" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setExpiresIn(opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                expiresIn === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || !password || state === "uploading"}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {state === "uploading" ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
