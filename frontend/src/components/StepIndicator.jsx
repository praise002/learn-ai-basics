const STEPS = [
  { key: "uploading", label: "Uploading" },
  { key: "transcribing", label: "Transcribing" },
  { key: "cleaning", label: "Cleaning up" },
];

export default function StepIndicator({ step, status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const allDone = status === "done";
  const failed = status === "failed";

  return (
    <ol className="mt-3 flex flex-wrap gap-4 text-sm">
      {STEPS.map((s, index) => {
        const isDone = allDone || index < currentIndex;
        const isCurrent = !allDone && index === currentIndex;
        const isFailedHere = failed && isCurrent;
        return (
          <li
            key={s.key}
            className={
              isFailedHere
                ? "font-semibold text-red-700"
                : isDone
                  ? "text-accent"
                  : isCurrent
                    ? "font-semibold text-slate-900"
                    : "text-slate-400"
            }
          >
            {isFailedHere ? "✕ " : isDone ? "✓ " : ""}
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}
