import { Hexagon } from "lucide-react";

export function KaizenBadge({ message = "Received from KAIZEN" }: { message?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
      <Hexagon className="h-3 w-3 text-sky-600" />
      {message}
    </span>
  );
}
