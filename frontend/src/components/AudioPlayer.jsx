import { useEffect, useState } from "react";

// Plays the file that was recorded or uploaded, so you can hear it before reading the transcript.
export default function AudioPlayer({ file }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  if (!url) return null;
  return <audio controls src={url} className="mt-3 w-full" />;
}
