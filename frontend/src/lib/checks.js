// Recording formats in order of preference. The first one the browser can
// record in is used, and its extension goes on the file so AssemblyAI knows the type.
const RECORDING_TYPES = [
  { mimeType: "audio/mp4", extension: "m4a" },
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
];

export function pickRecordingType() {
  if (typeof MediaRecorder === "undefined") return null;
  return RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type.mimeType)) ?? null;
}
