import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X, FileText, Image as ImageIcon, Aperture } from "lucide-react";

export type DocFile = { name: string; size: string; type: string };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function classifyType(file: File | { type: string }): string {
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
  const uploadRef = useRef<HTMLInputElement>(null);
  const [userTouched, setUserTouched] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const visible = userTouched ? files ?? [] : seed;

  const addFiles = (items: DocFile[], fromCamera: boolean) => {
    if (items.length === 0) return;
    const next = userTouched ? [...(files ?? []), ...items] : items;
    setUserTouched(true);
    onChange(next);
    if (fromCamera) onToast?.("Document captured");
    else onToast?.(items.length === 1 ? "1 file uploaded" : `${items.length} files uploaded`);
  };

  const handleUpload = (picked: FileList | null) => {
    if (!picked) return;
    addFiles(
      Array.from(picked).map((f) => ({
        name: f.name,
        size: formatSize(f.size),
        type: classifyType(f),
      })),
      false,
    );
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
          onClick={() => setCameraOpen(true)}
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
          ref={uploadRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleUpload(e.target.files);
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

      {cameraOpen && (
        <CameraModal
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            addFiles(
              [{ name: file.name, size: formatSize(file.size), type: "Photo" }],
              true,
            );
            setCameraOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CameraModal({
  onClose,
  onCapture,
}: {
  onClose: () => void;
  onCapture: (file: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not available in this browser");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not access camera");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const file = new File([blob], `scan_${stamp}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
            <Camera className="h-4 w-4 text-sky-400" /> Scan Document
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative bg-black">
          {error ? (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-red-300">
              {error}. Use Upload File instead.
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="aspect-video w-full bg-black object-cover"
            />
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={capture}
            disabled={!ready || !!error}
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Aperture className="h-4 w-4" /> Capture
          </button>
        </div>
      </div>
    </div>
  );
}
