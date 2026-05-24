## Add Scan / Upload controls to document submission

Add two real input affordances on the document-submission steps: **Scan with camera** (uses `<input type="file" accept="image/*" capture="environment">`) and **Upload from device** (`<input type="file" accept="image/*,application/pdf" multiple>`). Everything stays offline — files never leave the browser.

### Clinic — Step 2 (`src/routes/clinic.tsx`)
- Add local state `uploaded: { name: string; size: string; type: string }[]` (mapped from real `File` objects: name, formatted KB, `image/*` → "Photo", `pdf` → "PDF").
- Add a top toolbar inside the "Uploaded documents" card with two buttons:
  - **Scan Document** — opens rear camera on mobile, file picker on laptop (camera attr is ignored on desktop, which is fine for the demo).
  - **Upload File** — multi-select picker.
- On first successful pick, **replace** `clinicClaim.documents` with the user's files (per the answer "Replace the mock list"). Subsequent picks append.
- Each row reuses the existing card layout (file icon for PDF, image icon for photo, real `name`/`size`, "Ready" pill). Add a small `×` to remove a row.
- "Scan Documents" (OCR) button stays — it just operates on whatever is in the list. Disable it if the list is empty.
- Show a toast on add: `"Document captured"` or `"2 files uploaded"`.

### Hospital — Step 3 (`src/routes/hospital.tsx`)
Hospital has no dedicated "documents" step; Step 3 is the AI Review that auto-runs `ScanProgress`. Insert a pre-scan upload panel:
- Before the auto-scan kicks off, render the same Scan/Upload toolbar + uploaded-files list (same component).
- Replace the auto-mount behaviour with: scan starts only after the user clicks **Start AI Review** (enabled once ≥1 file is present). Pre-seed the list with `hospitalCase` mock attachments (admission form, ECG, lab report) so the demo still works if the presenter skips upload — but as soon as the user picks any file, the mock list is replaced.
- Rest of Step 3 (CheckList, Q&A fade-in) unchanged.

### Shared component
Extract a small `<DocumentDropzone />` in `src/components/DocumentDropzone.tsx`:
- Props: `files`, `onChange(files)`, `seed?` (initial mock list shown until user uploads).
- Renders: two buttons (Camera icon + Upload icon from lucide-react), grid of file rows with remove button.
- Pure presentation + local state lifted to parent. No external deps.

### Mock data
Add `hospitalCase.documents` to `src/data/mockData.ts` (3 entries: `admission_form.pdf`, `ecg_2025-05-22.jpg`, `lab_troponin.pdf`) so the hospital seed has something to show.

### Out of scope
- No OCR on real images — the existing `ScanProgress` animation is the "scan".
- No persistence across reloads.
- No drag-and-drop (keeps the demo deterministic on a stage laptop).
- No file size/type validation beyond the accept attribute.
