import { useEffect, useState } from "react";

export function ScanProgress({
  labels,
  intervalMs = 280,
  onComplete,
}: {
  labels: string[];
  intervalMs?: number;
  onComplete?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (idx >= labels.length) {
      setDone(true);
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), intervalMs);
    return () => clearTimeout(t);
  }, [idx, labels.length, intervalMs, done, onComplete]);

  const pct = Math.min(100, (idx / labels.length) * 100);
  const current = labels[Math.min(idx, labels.length - 1)];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{done ? "Scan complete" : current}</span>
        <span className="font-mono text-sky-300">{Math.round(done ? 100 : pct)}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all"
          style={{ width: `${done ? 100 : pct}%`, transitionDuration: `${intervalMs}ms` }}
        />
      </div>
    </div>
  );
}
