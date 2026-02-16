export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { cleanupExpiredFiles } = await import("@/lib/db");

    // Run cleanup every 5 minutes
    setInterval(() => {
      cleanupExpiredFiles();
    }, 5 * 60 * 1000);

    // Run once on startup
    cleanupExpiredFiles();
    console.log("File cleanup job started (runs every 5 minutes)");
  }
}
