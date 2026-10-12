import { cleanText, getTranscript, startTranscript, uploadFile } from "./api.js";

const POLL_MS = 3000;

// Runs one file through the three steps in order. `onUpdate` receives
// partial changes to the file's state, and the screen re-renders from them.
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
  } catch (err) {
    onUpdate({ status: "failed", error: err.message });
  }
}

async function waitForTranscript(id) {
  while (true) {
    const result = await getTranscript(id);
    if (result.status === "completed") return result.text;
    if (result.status === "error") throw new Error(result.error);
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}
