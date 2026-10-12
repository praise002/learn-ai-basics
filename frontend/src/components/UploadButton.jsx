export default function UploadButton({ onFile, disabled }) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      Upload audio
      <input
        type="file"
        accept=".mp3,.m4a,.wav,.webm,audio/*"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}
