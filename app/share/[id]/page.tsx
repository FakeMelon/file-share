import { getFile } from "@/lib/db";
import { notFound } from "next/navigation";
import DownloadPage from "@/components/download-page";

export default function SharePage({ params }: { params: { id: string } }) {
  const file = getFile(params.id);
  const now = Math.floor(Date.now() / 1000);

  if (!file || file.expires_at <= now) {
    notFound();
  }

  return (
    <DownloadPage
      id={file.id}
      name={file.original_name}
      size={file.size}
      expiresAt={file.expires_at}
    />
  );
}
