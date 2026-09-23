import { useEffect, useRef, useState } from "react";
import { FileUp, ListChecks, Loader2, Paperclip, Sparkles, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  deleteDocument,
  fillQuestionnaire,
  improveQuestionnaire,
  listDocuments,
  saveMeetingNotes,
  uploadDocument,
  type DocumentMeta,
} from "@/lib/intake/server";
import { MAX_FILE_BYTES, MAX_FILES, MAX_NOTES_CHARS, isLikelyUpload, mimeFromFilename } from "@/lib/intake/limits";
import { NOTES_TEMPLATE } from "@/lib/intake/notes-template";
import { SECTIONS, type SectionId } from "@/lib/pq/sections";
import type { PqData } from "@/lib/pq/types";
import { cn } from "@/lib/utils";

type LocalFile = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  contentB64: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId?: string;
  pq: PqData;
  onFilled: (pq: PqData) => void;
};

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function rpcMessage(err: unknown, fallback: string) {
  if (!(err instanceof Error) || !err.message) return fallback;
  if (err.message === "Unauthorized" || /401/.test(err.message)) return "Please sign in again.";
  if (/Failed to fetch|NetworkError|timeout|AbortError/i.test(err.message)) {
    return "That took too long. Try a smaller file, or paste the figures as notes.";
  }
  return fallback;
}

function readAsB64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function IntakePanel({ open, onOpenChange, householdId, pq, onFilled }: Props) {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<DocumentMeta[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [busy, setBusy] = useState<"load" | "upload" | "fill" | "review" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [gained, setGained] = useState<SectionId[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || !householdId) return;
    let cancelled = false;
    setBusy("load");
    listDocuments({ data: householdId })
      .then((r) => {
        if (cancelled) return;
        if (!r || !Array.isArray(r.files)) {
          setError("Could not load files for this household.");
          return;
        }
        setFiles(r.files);
        setNotes(r.notes ?? "");
        setLocalFiles([]);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load files for this household.");
      })
      .finally(() => {
        if (!cancelled) setBusy((b) => (b === "load" ? null : b));
      });
    return () => {
      cancelled = true;
    };
  }, [open, householdId]);

  function persistNotes(value: string) {
    const next = value.slice(0, MAX_NOTES_CHARS);
    setNotes(next);
    if (!householdId) return;
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      void saveMeetingNotes({ data: { householdId, notes: next } });
    }, 600);
  }

  async function addFiles(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list);
    const have = files.length + localFiles.length;
    if (have + incoming.length > MAX_FILES) {
      setError(`Up to ${MAX_FILES} files per household.`);
      return;
    }
    setBusy("upload");
    let uploaded = false;
    const addedLocal: LocalFile[] = [];
    try {
      for (const file of incoming) {
        if (!isLikelyUpload(file.name, file.type)) {
          setError("Use PDF, image, text, CSV, or Excel (.xlsx).");
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          setError(`${file.name} is over 3 MB. Split it or paste the notes.`);
          continue;
        }
        const contentB64 = await readAsB64(file);
        if (householdId) {
          const res = await uploadDocument({
            data: { householdId, filename: file.name, contentB64 },
          });
          if (!res || typeof res !== "object" || !("ok" in res) || !res.ok) {
            setError(
              res && typeof res === "object" && "error" in res && typeof res.error === "string"
                ? res.error
                : "Upload failed. Try PDF, image, text, or Excel.",
            );
            continue;
          }
          setFiles((prev) => [res.file, ...prev]);
          uploaded = true;
        } else {
          addedLocal.push({
            id: `local-${file.name}-${file.size}`,
            filename: file.name,
            mimeType: file.type || mimeFromFilename(file.name),
            sizeBytes: file.size,
            contentB64,
          });
          uploaded = true;
        }
      }
      if (addedLocal.length) setLocalFiles((prev) => [...addedLocal, ...prev]);
    } catch (err) {
      setError(rpcMessage(err, "Upload failed."));
    } finally {
      setBusy(null);
    }
    if (uploaded) await applySources("fill", [...addedLocal, ...localFiles]);
  }

  async function remove(id: string, local: boolean) {
    if (local) {
      setLocalFiles((prev) => prev.filter((f) => f.id !== id));
      return;
    }
    if (!householdId) return;
    await deleteDocument({ data: { householdId, id } });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function applySources(mode: "fill" | "review", inlineOverride?: LocalFile[]) {
    setError(null);
    setSummary(null);
    setGained([]);
    setBusy(mode);
    try {
      const inline = inlineOverride ?? localFiles;
      const payload = {
        householdId,
        current: pq,
        notes,
        inlineFiles: householdId
          ? undefined
          : inline.map((f) => ({
              filename: f.filename,
              mimeType: f.mimeType,
              contentB64: f.contentB64,
            })),
      };
      const res =
        mode === "review"
          ? await improveQuestionnaire({ data: { householdId, current: pq, notes } })
          : await fillQuestionnaire({ data: payload });
      if (!res || typeof res !== "object" || !("ok" in res)) {
        setError(
          mode === "review"
            ? "Review did not finish. Try again."
            : "Fill did not finish. Click Fill again — labeled statements complete in a few seconds.",
        );
        return;
      }
      if (!res.ok) {
        setError(res.error || "Could not update the questionnaire.");
        return;
      }
      onFilled(res.pq);
      setGained(res.filledSections);
      setSummary(res.summary || "Discovery updated. Review the 14 sections, then generate the assessment.");
    } catch (err) {
      setError(rpcMessage(err, "Could not update the questionnaire."));
    } finally {
      setBusy(null);
    }
  }

  const allFiles = [
    ...files.map((f) => ({ ...f, local: false })),
    ...localFiles.map((f) => ({
      id: f.id,
      filename: f.filename,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      kind: "file",
      createdAt: "",
      local: true,
    })),
  ];
  const canFill = Boolean(notes.trim() || allFiles.length);
  const working = Boolean(busy && busy !== "load");
  const filling = busy === "fill";
  const reviewing = busy === "review";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Files & meeting notes"
        className="flex max-h-dvh w-full max-w-xl flex-col overflow-y-auto"
      >
        <p className="mt-1 text-sm text-slate">
          Upload statements or paste notes. Matching accounts are updated in place (name, address, or
          account number) — duplicates are folded, parent totals dropped, and new holdings added.
          Review & improve re-reads the file against what is already in the 14 sections.
        </p>
        {!householdId ? (
          <p className="mt-2 text-xs text-slate">
            Sample file — uploads stay in this session only. Open a household from the book to keep
            documents with the client.
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate">
            Documents stay on this household. Only signed-in @falconwp.com advisors can open them.
          </p>
        )}

        <div className="mt-4">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate">Meeting notes</p>
            <div className="flex flex-wrap items-center gap-x-3 text-xs">
              <button
                type="button"
                className="text-navy underline-offset-2 hover:underline disabled:text-slate disabled:no-underline"
                disabled={working}
                onClick={() => {
                  if (notes.trim()) {
                    setError("Notes already have text. Download the blank template instead, or clear this box first.");
                    return;
                  }
                  setError(null);
                  persistNotes(NOTES_TEMPLATE);
                }}
              >
                Insert template
              </button>
              <a
                href="/falcon-meeting-notes-template.txt"
                download="Falcon-discovery-meeting-notes.txt"
                className="text-navy underline-offset-2 hover:underline"
              >
                Download template
              </a>
              <a
                href="/falcon-meeting-script-prompt.txt"
                download="Falcon-meeting-script-prompt.txt"
                className="text-navy underline-offset-2 hover:underline"
              >
                Script prompt
              </a>
            </div>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => persistNotes(e.target.value)}
            rows={6}
            maxLength={MAX_NOTES_CHARS}
            placeholder="Insert the template, or paste the filled notes from the meeting script…"
            disabled={working}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate">Documents</p>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json,.xlsx,application/pdf,image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy === "upload" || working}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
            }}
            className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl bg-paper px-4 py-6 text-center shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
          >
            <Upload className="size-5 text-navy" />
            <span className="text-sm font-medium text-navy">Drop PDFs, Excel, or images</span>
            <span className="text-xs text-slate">Up to {MAX_FILES} files · 3 MB each</span>
          </button>

          {allFiles.length > 0 ? (
            <ul className="mt-3 divide-y divide-border rounded-lg bg-paper-2">
              {allFiles.map((f) => (
                <li key={f.id} className="flex min-h-11 items-center gap-3 px-3 py-2">
                  <Paperclip className="size-4 shrink-0 text-slate" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-navy">{f.filename}</p>
                    <p className="text-xs text-slate">{formatSize(f.sizeBytes)}</p>
                  </div>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() => void remove(f.id, f.local)}
                    aria-label={`Remove ${f.filename}`}
                    disabled={working}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-rust">{error}</p> : null}

        {summary ? (
          <div className="mt-4 rounded-lg bg-paper p-4 text-sm text-navy shadow-[var(--shadow-border)]">
            <p className="text-xs font-medium uppercase tracking-wider text-brass-dim">
              {reviewing || summary?.startsWith("Already") ? "Discovery review" : "Updated from sources"}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{summary}</p>
            {gained.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {gained.map((id) => {
                  const label = SECTIONS.find((s) => s.id === id)?.short ?? id;
                  return (
                    <Badge key={id} variant="sage">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate">
                No new fields — matching rows were already on the discovery. Review & improve
                still folds duplicates and refreshes balances from the statements.
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={working}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => void applySources("review")}
            disabled={working}
          >
            {reviewing ? <Loader2 className="size-4 animate-spin" /> : <ListChecks className="size-4" />}
            {reviewing ? "Reviewing…" : "Review & improve"}
          </Button>
          <Button onClick={() => void applySources("fill")} disabled={!canFill || working}>
            {filling ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {filling ? "Updating discovery…" : busy === "upload" ? "Reading file…" : "Update discovery"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function IntakeLaunch({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className={className}>
      <FileUp className="size-4" />
      <span className="hidden sm:inline">Files</span>
    </Button>
  );
}

export function IntakeCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl bg-cream p-4 text-left shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-navy text-cream">
        <FileUp className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-medium text-navy">Fill from documents</span>
        <span className="mt-0.5 block text-sm text-slate">
          Drop a statement to update the discovery. Matching rows are consolidated — you still review
          every section before the assessment.
        </span>
      </span>
    </button>
  );
}
