import { cleanText, getTranscript, startTranscript, uploadFile } from "./api.js";

const POLL_MS = 3000;

// Runs one file through the three steps in order. `onUpdate` receives
// partial changes to the file's state, and the screen re-renders from them.
// Returns the file's final status.
export async function processFile(file, onUpdate) {
  try {
    onUpdate({ step: "uploading", status: "running" });
    const { upload_url } = await uploadFile(file);

    onUpdate({ step: "transcribing" });
    const { id } = await startTranscript(upload_url);
    const rawText = await waitForTranscript(id);

    onUpdate({ step: "cleaning", rawText });
    const cleaned = await cleanText(rawText);

    onUpdate({ status: "done", cleanText: cleaned });
    return "done";
  } catch (err) {
    onUpdate({ status: "failed", error: err.message });
    return "failed";
  }
}

// Runs the batch one file at a time, in the order the files were picked.
// Returns how many files finished, so the caller can report the result.
export async function runBatch(entries, onUpdate) {
  let done = 0;
  for (const entry of entries) {
    const status = await processFile(entry.file, (patch) => onUpdate(entry.id, patch));
    if (status === "done") done += 1;
  }
  return { done, total: entries.length };
}

async function waitForTranscript(id) {
  while (true) {
    const result = await getTranscript(id);
    if (result.status === "completed") return result.text;
    if (result.status === "error") throw new Error(result.error);
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}
