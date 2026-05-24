export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-200">
      <code className="font-mono whitespace-pre">{code}</code>
    </pre>
  );
}
