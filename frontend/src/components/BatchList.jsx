import AudioPlayer from "./AudioPlayer.jsx";
import CopyButton from "./CopyButton.jsx";
import StepIndicator from "./StepIndicator.jsx";

// Shows every file in the batch, in the order it was picked.
export default function BatchList({ entries }) {
  return (
    <ol className="mt-8 space-y-8">
      {entries.map((entry) => (
        <li key={entry.id} className="border-t border-slate-200 pt-6">
          <p className="text-sm font-medium">{entry.name}</p>
          <AudioPlayer file={entry.file} />
          {entry.status === "waiting" ? (
            <p className="mt-3 text-sm text-slate-400">Waiting</p>
          ) : (
            <StepIndicator step={entry.step} status={entry.status} />
          )}
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
              <CopyButton text={entry.cleanText} />
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
