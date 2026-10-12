import { useState } from "react";
import { cleanText } from "./lib/api.js";

export default function App() {
  const [rawText, setRawText] = useState("");
  const [cleaned, setCleaned] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleClean() {
    setBusy(true);
    setError("");
    try {
      setCleaned(await cleanText(rawText));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically. Select the text and copy it by hand.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 font-sans text-slate-800">
      <h1 className="text-2xl font-semibold">Voice Note to Clean Transcript</h1>

      <section className="mt-8">
        <label htmlFor="raw" className="block text-sm font-medium">
          Paste a rambling transcript
        </label>
        <textarea
          id="raw"
          rows={8}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 p-3 leading-relaxed focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleClean}
          disabled={busy || !rawText.trim()}
          className="mt-3 rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? "Cleaning up..." : "Clean up"}
        </button>
        {error && <p className="mt-3 text-red-700">{error}</p>}
      </section>

      {cleaned && (
        <section className="mt-10">
          <h2 className="text-sm font-medium">Cleaned transcript</h2>
          <div className="mt-2 whitespace-pre-wrap rounded-md bg-slate-50 p-5 leading-relaxed">
            {cleaned}
          </div>
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
                <span className="text-sm">Copy transcript</span>
              </>
            )}
          </button>
        </section>
      )}
    </main>
  );
}
