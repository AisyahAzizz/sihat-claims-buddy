import { useRef, useState } from "react";
import { Camera, Upload, X, FileText, Image as ImageIcon } from "lucide-react";

export type DocFile = { name: string; size: string; type: string };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function classifyType(file: File): string {
  if (file.type.startsWith("image/")) return "Photo";
  if (file.type === "application/pdf") return "PDF";
  return file.type || "File";
}

export function DocumentDropzone({
  seed,
  files,
  onChange,
  onToast,
}: {
  seed: DocFile[];
  files: DocFile[] | null;
  onChange: (files: DocFile[]) => void;
  onToast?: (msg: string) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [userTouched, setUserTouched] = useState(false);

  const visible = userTouched ? files ?? [] : seed;

  const handlePick = (picked: FileList | null, fromCamera: boolean) => {
    if (!picked || picked.length === 0) return;
    const mapped: DocFile[] = Array.from(picked).map((f) => ({
      name: f.name,
      size: formatSize(f.size),
      type: classifyType(f),
    }));
    const next = userTouched ? [...(files ?? []), ...mapped] : mapped;
    setUserTouched(true);
    onChange(next);
    if (fromCamera) onToast?.("Document captured");
    else onToast?.(mapped.length === 1 ? "1 file uploaded" : `${mapped.length} files uploaded`);
  };

  const remove = (idx: number) => {
    const next = [...(files ?? visible)];
    next.splice(idx, 1);
    setUserTouched(true);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20"
        >
          <Camera className="h-4 w-4" /> Scan Document
        </button>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          <Upload className="h-4 w-4" /> Upload File
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handlePick(e.target.files, true);
            e.target.value = "";
          }}
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handlePick(e.target.files, false);
            e.target.value = "";
          }}
        />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-xs text-slate-500">
          No documents yet — scan with the camera or upload a file.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((d, i) => (
            <div
              key={`${d.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/40 p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 ring-1 ring-slate-700">
                {d.type === "Photo" ? (
                  <ImageIcon className="h-5 w-5 text-sky-400" />
                ) : (
                  <FileText className="h-5 w-5 text-sky-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-xs text-slate-200">{d.name}</div>
                <div className="text-[11px] text-slate-500">
                  {d.type} · {d.size}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                Ready
              </span>
              {userTouched && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
