const STEPS = [
  { key: "uploading", label: "Uploading" },
  { key: "transcribing", label: "Transcribing" },
  { key: "cleaning", label: "Cleaning up" },
];

export default function StepIndicator({ step, status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const allDone = status === "done";

  return (
    <ol className="mt-3 flex flex-wrap gap-4 text-sm">
      {STEPS.map((s, index) => {
        const isDone = allDone || index < currentIndex;
        const isCurrent = !allDone && index === currentIndex;
        return (
          <li
            key={s.key}
            className={
              isDone
                ? "text-accent"
                : isCurrent
                  ? "font-semibold text-slate-900"
                  : "text-slate-400"
            }
          >
            {isDone ? "✓ " : ""}
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}
