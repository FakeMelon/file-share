import UploadForm from "@/components/upload-form";

export default function Home() {
  return (
    <div className="w-full max-w-lg">
      <h1 className="text-3xl font-bold text-center mb-8">File Share</h1>
      <UploadForm />
    </div>
  );
}
