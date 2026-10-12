import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy transcript"
      title="Copy transcript"
      className="mt-3 inline-flex items-center gap-2 rounded-md border border-accent px-3 py-2 text-accent hover:bg-slate-50"
    >
      {copied ? (
        <>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span className="text-sm">Copied</span>
        </>
      ) : (
        <>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="text-sm">{failed ? "Copy failed. Select and copy by hand" : "Copy transcript"}</span>
        </>
      )}
    </button>
  );
}
