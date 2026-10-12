import { useRef, useState } from "react";
import { pickRecordingType } from "../lib/checks.js";

export default function RecordButton({ onFile, disabled, onMessage }) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function start() {
    onMessage("");
    const type = pickRecordingType();
    if (!type) {
      onMessage("This browser can't record audio. Use Upload audio instead.");
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      onMessage("Recording needs microphone access. Allow it in your browser settings, or use Upload audio.");
      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType: type.mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: type.mimeType });
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      onFile(new File([blob], `recording-${stamp}.${type.extension}`, { type: type.mimeType }));
    };

    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  if (recording) {
    return (
      <button
        onClick={stop}
        className="inline-flex items-center gap-2 rounded-md border border-red-600 px-4 py-2 text-red-700 hover:bg-slate-50"
      >
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />
        Stop recording
      </button>
    );
  }

  return (
    <button
      onClick={start}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border border-accent px-4 py-2 text-accent hover:bg-slate-50 disabled:opacity-50"
    >
      Record a voice note
    </button>
  );
}
