export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-zinc-700 mb-4">404</h1>
      <p className="text-zinc-400 text-lg mb-6">
        This file doesn&apos;t exist or has expired.
      </p>
      <a
        href="/"
        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
      >
        Go to upload page
      </a>
    </div>
  );
}
