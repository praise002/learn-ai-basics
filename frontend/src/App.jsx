import { useState } from "react";
import BatchList from "./components/BatchList.jsx";
import RecordButton from "./components/RecordButton.jsx";
import UploadButton from "./components/UploadButton.jsx";
import { runBatch } from "./lib/batchRunner.js";
import { checkAudioFile } from "./lib/checks.js";

export default function App() {
  const [batch, setBatch] = useState([]);
  const [message, setMessage] = useState("");
  const busy = batch.some((entry) => entry.status === "waiting" || entry.status === "running");

  function updateEntry(id, patch) {
    setBatch((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  // Files that fail the checks are refused with a message; the rest start a new batch.
  async function handleFiles(files) {
    setMessage("");
    const problems = [];
    const accepted = [];
    for (const file of files) {
      const problem = await checkAudioFile(file);
      if (problem) {
        problems.push(`${file.name}: ${problem}`);
      } else {
        accepted.push({ id: crypto.randomUUID(), name: file.name, file, status: "waiting" });
      }
    }
    if (problems.length) setMessage(problems.join(" "));
    if (accepted.length === 0) return;

    setBatch(accepted);
    runBatch(accepted, updateEntry);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 font-sans text-slate-800">
      <h1 className="text-2xl font-semibold">Voice Note to Clean Transcript</h1>

      <section className="mt-8 flex flex-wrap items-center gap-3">
        <RecordButton onFile={(file) => handleFiles([file])} disabled={busy} onMessage={setMessage} />
        <UploadButton onFiles={handleFiles} disabled={busy} />
      </section>
      {message && <p className="mt-3 text-red-700">{message}</p>}

      {batch.length > 0 && <BatchList entries={batch} />}
    </main>
  );
}
