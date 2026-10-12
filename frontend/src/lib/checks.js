// Recording formats in order of preference. The first one the browser can
// record in is used, and its extension goes on the file so AssemblyAI knows the type.
const RECORDING_TYPES = [
  { mimeType: "audio/mp4", extension: "m4a" },
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
];

const ACCEPTED_EXTENSIONS = ["mp3", "m4a", "wav", "webm"];
const MAX_SECONDS = 60 * 60;

export function pickRecordingType() {
  if (typeof MediaRecorder === "undefined") return null;
  return RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type.mimeType)) ?? null;
}

// Returns a message explaining why the file is refused, or null if it can be processed.
export async function checkAudioFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "That file type isn't supported. Use MP3, M4A, WAV, or WebM.";
  }

  let seconds;
  try {
    seconds = await readDuration(file);
  } catch {
    return "Couldn't read this audio file. Try MP3, M4A, WAV, or WebM.";
  }
  if (seconds > MAX_SECONDS) {
    return "That file is longer than 60 minutes.";
  }
  return null;
}

// Reads the length from the audio's metadata. Some recorded files (WebM from
// MediaRecorder) report an infinite length until the player seeks to the end,
// so we seek there and read the real length.
function readDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();

    const finish = (seconds) => {
      URL.revokeObjectURL(url);
      resolve(seconds);
    };

    audio.preload = "metadata";
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable audio"));
    };
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        finish(audio.duration);
        return;
      }
      audio.ontimeupdate = () => {
        audio.ontimeupdate = null;
        audio.currentTime = 0;
        finish(audio.duration);
      };
      audio.currentTime = Number.MAX_SAFE_INTEGER;
    };
    audio.src = url;
  });
}
