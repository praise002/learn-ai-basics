import { useState } from "react";
import AudioPlayer from "./components/AudioPlayer.jsx";
import RecordButton from "./components/RecordButton.jsx";
import StepIndicator from "./components/StepIndicator.jsx";
import UploadButton from "./components/UploadButton.jsx";
import { checkAudioFile } from "./lib/checks.js";
import { processFile } from "./lib/batchRunner.js";

export default function App() {
  const [entry, setEntry] = useState(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const busy = entry?.status === "running";

  async function handleFile(file) {
    setCopied(false);
    setMessage("");
    const problem = await checkAudioFile(file);
    if (problem) {
      setMessage(problem);
      return;
    }
    setEntry({ name: file.name, file, step: "uploading", status: "running" });
    processFile(file, (patch) => setEntry((prev) => ({ ...prev, ...patch })));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(entry.cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setEntry((prev) => ({
        ...prev,
        error: "Couldn't copy automatically. Select the text and copy it by hand.",
      }));
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 font-sans text-slate-800">
      <h1 className="text-2xl font-semibold">Voice Note to Clean Transcript</h1>

      <section className="mt-8 flex flex-wrap items-center gap-3">
        <RecordButton onFile={handleFile} disabled={busy} onMessage={setMessage} />
        <UploadButton onFile={handleFile} disabled={busy} />
      </section>
      {message && <p className="mt-3 text-red-700">{message}</p>}

      {entry && (
        <section className="mt-8">
          <p className="text-sm font-medium">{entry.name}</p>
          <AudioPlayer file={entry.file} />
          <StepIndicator step={entry.step} status={entry.status} />
          {entry.error && <p className="mt-3 text-red-700">{entry.error}</p>}
          {entry.rawText && (
            <details className="mt-4 rounded-md border border-dashed border-slate-300 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-slate-500">Debug: raw transcript (remove later)</summary>
              <div className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-600">{entry.rawText}</div>
            </details>
          )}
          {entry.cleanText && (
            <>
              <div className="mt-6 whitespace-pre-wrap rounded-md bg-slate-50 p-5 leading-relaxed">
                {entry.cleanText}
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
            </>
          )}
        </section>
      )}
    </main>
  );
}
