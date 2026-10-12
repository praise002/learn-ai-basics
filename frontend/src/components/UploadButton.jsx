export default function UploadButton({ onFiles, disabled }) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      Upload audio
      <input
        type="file"
        multiple
        accept=".mp3,.m4a,.wav,.webm,audio/*"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </label>
  );
}
