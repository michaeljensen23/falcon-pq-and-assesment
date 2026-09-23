import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { householdLabel } from "@/lib/pq/totals";
import type { PqData } from "@/lib/pq/types";
import { uid } from "@/lib/utils";
import {
  decodeBase64,
  encodeBase64,
  FILL_COOLDOWN_MS,
  FILL_HOURLY_CAP,
  inspectFile,
  MAX_EXTRACT_CHARS,
  MAX_FILES,
  MAX_NOTES_CHARS,
  MAX_PQ_JSON_CHARS,
  publicError,
  requireId,
  safeJsonParse,
  UPLOAD_COOLDOWN_MS,
  UPLOAD_HOURLY_CAP,
  PARSE_COOLDOWN_MS,
  PARSE_HOURLY_CAP,
} from "./limits";
import { gainedSections, markDocsReceived, mergeIntake, type IntakeExtract } from "./merge";
import { isRichStatement, parseSourcesToExtract, statementRowCount } from "./parse-statement";
import { pdfTextIsUseful, pdfToText } from "./pdf";
import { currentHint, prepareSources, textsFromStored, type StoredFile } from "./prepare";
import { consumeRateLimit } from "./rate-limit";
import { compactSnapshot, consolidatePq, diffPq, formatReport } from "./reconcile";
import { extractQuestionnaire } from "./xai";

export type DocumentMeta = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  createdAt: string;
};

function paceParse(userId: string) {
  return consumeRateLimit(`parse:${userId}`, PARSE_COOLDOWN_MS, PARSE_HOURLY_CAP);
}

function optionalHouseholdId(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return requireId(value, "household");
}

async function assertHousehold(userId: string, householdId: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from households where id = ${householdId} and user_id = ${userId} limit 1
  `;
  if (!rows[0]) throw new Error("Household not found");
}

function asPq(value: unknown): PqData {
  if (!value || typeof value !== "object") throw new Error("Invalid questionnaire");
  const json = JSON.stringify(value);
  if (json.length > MAX_PQ_JSON_CHARS) throw new Error("Questionnaire is too large.");
  const parsed = safeJsonParse(json);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid questionnaire");
  }
  return parsed as PqData;
}

function ingestBytes(filename: string, contentB64: string): StoredFile {
  const bytes = decodeBase64(contentB64);
  const inspected = inspectFile(filename, bytes);
  return {
    filename: inspected.filename,
    mimeType: inspected.mime,
    contentB64: encodeBase64(bytes),
    notesText: null,
    kind: inspected.kind,
    bytes,
  };
}

async function extractForStore(file: StoredFile): Promise<string | null> {
  if (!file.bytes) return null;
  try {
    if (file.kind === "pdf") {
      const text = pdfToText(file.bytes);
      return pdfTextIsUseful(text) ? text : null;
    }
    if (file.kind === "text") {
      const text = Buffer.from(file.bytes).toString("utf8").slice(0, MAX_NOTES_CHARS);
      return text.trim().length >= 40 ? text : null;
    }
    if (file.kind === "xlsx") {
      const { workbookToText } = await import("./xlsx");
      const text = await workbookToText(file.bytes);
      return pdfTextIsUseful(text) ? text.slice(0, MAX_EXTRACT_CHARS) : null;
    }
  } catch {
    return null;
  }
  return null;
}

async function persistPq(
  userId: string,
  householdId: string,
  pq: PqData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pqJson = JSON.stringify(pq);
  if (pqJson.length > MAX_PQ_JSON_CHARS) {
    return { ok: false as const, error: "Filled questionnaire was too large to save." };
  }
  const sql = await getSql();
  const name = householdLabel(pq);
  const now = new Date().toISOString();
  const updated = await sql<{ id: string }>`
    update households
    set display_name = ${name},
        advisor_name = ${pq.advisor},
        meeting_date = ${pq.dateOfSecondMeeting || null},
        pq_json = ${pqJson},
        updated_at = ${now}
    where id = ${householdId} and user_id = ${userId}
    returning id
  `;
  if (updated.length === 0) {
    return { ok: false as const, error: "Household not found." };
  }
  return { ok: true as const };
}

export const listDocuments = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((householdId: unknown) => requireId(householdId, "household"))
  .handler(async ({ context, data: householdId }) => {
    await assertHousehold(context.userId, householdId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      filename: string;
      mime_type: string;
      size_bytes: number;
      kind: string;
      created_at: string;
      notes_text: string | null;
    }>`
      select id, filename, mime_type, size_bytes, kind, created_at,
        case when kind = ${"notes"} then notes_text else null end as notes_text
      from household_documents
      where household_id = ${householdId} and user_id = ${context.userId}
      order by created_at desc
    `;
    const notes = rows.find((r) => r.kind === "notes");
    const files: DocumentMeta[] = rows
      .filter((r) => r.kind !== "notes")
      .map((r) => ({
        id: r.id,
        filename: r.filename,
        mimeType: r.mime_type,
        sizeBytes: r.size_bytes,
        kind: r.kind,
        createdAt: r.created_at,
      }));
    return { files, notes: (notes?.notes_text ?? "").slice(0, MAX_NOTES_CHARS) };
  });

export const uploadDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Invalid upload");
    const rec = input as Record<string, unknown>;
    if (typeof rec.filename !== "string" || typeof rec.contentB64 !== "string") {
      throw new Error("Invalid upload");
    }
    return {
      householdId: requireId(rec.householdId, "household"),
      filename: rec.filename.slice(0, 200),
      contentB64: rec.contentB64,
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const limited = consumeRateLimit(
        `upload:${context.userId}`,
        UPLOAD_COOLDOWN_MS,
        UPLOAD_HOURLY_CAP,
      );
      if (!limited.ok) return { ok: false as const, error: limited.error };
      await assertHousehold(context.userId, data.householdId);
      const ingested = ingestBytes(data.filename, data.contentB64);
      const extract = await extractForStore(ingested);
      const sql = await getSql();
      const existing = await sql<{ n: number }>`
        select count(*)::int as n from household_documents
        where household_id = ${data.householdId} and user_id = ${context.userId} and kind <> ${"notes"}
      `;
      if ((existing[0]?.n ?? 0) >= MAX_FILES) {
        return {
          ok: false as const,
          error: `This household already has ${MAX_FILES} files. Remove one to add another.`,
        };
      }
      const id = uid();
      const now = new Date().toISOString();
      const size = ingested.bytes?.byteLength ?? 0;
      // Keep the binary only when Fill still needs it (images, or extract failed).
      const storedB64 = ingested.kind === "image" || !extract ? ingested.contentB64 : null;
      await sql`
        insert into household_documents (id, household_id, user_id, filename, mime_type, size_bytes, kind, notes_text, content_b64, created_at)
        values (${id}, ${data.householdId}, ${context.userId}, ${ingested.filename}, ${ingested.mimeType}, ${size}, ${ingested.kind}, ${extract}, ${storedB64}, ${now})
      `;
      return {
        ok: true as const,
        file: {
          id,
          filename: ingested.filename,
          mimeType: ingested.mimeType,
          sizeBytes: size,
          kind: ingested.kind,
          createdAt: now,
        } satisfies DocumentMeta,
      };
    } catch (err) {
      return { ok: false as const, error: publicError(err, "Upload failed. Try PDF, image, text, CSV, or Excel (.xlsx).") };
    }
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Invalid request");
    const rec = input as Record<string, unknown>;
    return {
      householdId: requireId(rec.householdId, "household"),
      id: requireId(rec.id),
    };
  })
  .handler(async ({ context, data }) => {
    await assertHousehold(context.userId, data.householdId);
    const sql = await getSql();
    await sql`
      delete from household_documents
      where id = ${data.id} and household_id = ${data.householdId} and user_id = ${context.userId} and kind <> ${"notes"}
    `;
    return { ok: true as const };
  });

export const saveMeetingNotes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Invalid notes");
    const rec = input as Record<string, unknown>;
    const notes = typeof rec.notes === "string" ? rec.notes.slice(0, MAX_NOTES_CHARS) : "";
    return { householdId: requireId(rec.householdId, "household"), notes };
  })
  .handler(async ({ context, data }) => {
    try {
      await assertHousehold(context.userId, data.householdId);
      const sql = await getSql();
      const existing = await sql<{ id: string }>`
        select id from household_documents
        where household_id = ${data.householdId} and user_id = ${context.userId} and kind = ${"notes"}
        limit 1
      `;
      const now = new Date().toISOString();
      if (existing[0]) {
        await sql`
          update household_documents
          set notes_text = ${data.notes}, size_bytes = ${data.notes.length}, created_at = ${now}
          where id = ${existing[0].id} and user_id = ${context.userId}
        `;
      } else {
        await sql`
          insert into household_documents (id, household_id, user_id, filename, mime_type, size_bytes, kind, notes_text, created_at)
          values (${uid()}, ${data.householdId}, ${context.userId}, ${"Meeting notes"}, ${"text/plain"}, ${data.notes.length}, ${"notes"}, ${data.notes}, ${now})
        `;
      }
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: publicError(err, "Could not save meeting notes.") };
    }
  });

export const fillQuestionnaire = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const rec = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    const notes = typeof rec.notes === "string" ? rec.notes.slice(0, MAX_NOTES_CHARS) : "";
    const inlineFiles = Array.isArray(rec.inlineFiles) ? rec.inlineFiles.slice(0, MAX_FILES) : [];
    return { householdId: optionalHouseholdId(rec.householdId), current: rec.current, notes, inlineFiles };
  })
  .handler(async ({ context, data }) => {
    try {
      const paced = paceParse(context.userId);
      if (!paced.ok) return { ok: false as const, error: paced.error };
      let current: PqData;
      try {
        current = asPq(data.current);
      } catch {
        return {
          ok: false as const,
          error: "Questionnaire data was not valid. Refresh the page and try Fill again.",
        };
      }

      const stored: StoredFile[] = [];

      if (data.householdId) {
        await assertHousehold(context.userId, data.householdId);
        const sql = await getSql();
        const rows = await sql<{
          filename: string;
          mime_type: string;
          content_b64: string | null;
          notes_text: string | null;
          kind: string;
        }>`
          select filename, mime_type,
            case
              when notes_text is not null and length(notes_text) >= 80 then null
              else content_b64
            end as content_b64,
            notes_text, kind
          from household_documents
          where household_id = ${data.householdId} and user_id = ${context.userId}
        `;
        for (const r of rows) {
          if (r.kind === "notes") {
            stored.push({
              filename: r.filename,
              mimeType: "text/plain",
              contentB64: null,
              notesText: (r.notes_text ?? "").slice(0, MAX_NOTES_CHARS),
              kind: "notes",
            });
            continue;
          }
          const cached = r.notes_text && pdfTextIsUseful(r.notes_text) ? r.notes_text : null;
          if (cached) {
            stored.push({
              filename: r.filename,
              mimeType: "text/plain",
              contentB64: null,
              notesText: cached,
              kind: "text",
            });
            continue;
          }
          if (!r.content_b64) continue;
          try {
            stored.push(ingestBytes(r.filename, r.content_b64));
          } catch {
            /* skip a file that no longer passes inspection rather than failing the fill */
          }
        }
      } else {
        for (const f of data.inlineFiles) {
          if (!f || typeof f !== "object") continue;
          const rec = f as Record<string, unknown>;
          if (typeof rec.filename !== "string" || typeof rec.contentB64 !== "string") continue;
          try {
            const ingested = ingestBytes(rec.filename, rec.contentB64);
            ingested.notesText = await extractForStore(ingested);
            stored.push(ingested);
          } catch (err) {
            return {
              ok: false as const,
              error: publicError(err, "That file type is not accepted. Use PDF, image, text, CSV, or Excel (.xlsx)."),
            };
          }
        }
      }

      const storedNotes = stored.find((s) => s.kind === "notes")?.notesText ?? "";
      const combinedNotes = data.notes || storedNotes;
      const fileSources = stored.filter((s) => s.kind !== "notes");
      if (!combinedNotes.trim() && fileSources.length === 0) {
        return { ok: false as const, error: "Add meeting notes or a document first." };
      }

      const cachedTexts = textsFromStored(stored);
      let local = parseSourcesToExtract([combinedNotes, ...cachedTexts]);
      let localRows = statementRowCount(local);
      let sources = await prepareSources(fileSources);

      if (!isRichStatement(local) && sources.some((s) => s.text)) {
        local = parseSourcesToExtract([combinedNotes, ...sources.map((s) => s.text ?? "")]);
        localRows = statementRowCount(local);
      }

      const hasImages = sources.some((s) => s.kind === "image" && s.bytes);
      // Labeled statements fill locally. Grok only for photos or empty extracts.
      const needGrok = hasImages || localRows === 0;

      let grokExtract: IntakeExtract | null = null;
      if (needGrok) {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          if (localRows === 0) {
            return { ok: false as const, error: "Grok is not available in this environment." };
          }
        } else {
          const limited = consumeRateLimit(`fill:${context.userId}`, FILL_COOLDOWN_MS, FILL_HOURLY_CAP);
          if (!limited.ok) {
            if (localRows === 0) return { ok: false as const, error: limited.error };
          } else {
            try {
              grokExtract = await extractQuestionnaire({
                apiKey,
                notes: combinedNotes,
                sources,
                currentHint: compactSnapshot(current) || currentHint({
                  advisor: current.advisor,
                  client: [current.client?.firstName, current.client?.lastName].filter(Boolean).join(" "),
                  spouse: [current.spouse?.firstName, current.spouse?.lastName].filter(Boolean).join(" "),
                }),
              });
            } catch (err) {
              if (localRows === 0) {
                return {
                  ok: false as const,
                  error: publicError(err, "Could not read those files. Paste the figures as notes."),
                };
              }
            }
          }
        }
      }

      if (localRows === 0 && !grokExtract) {
        return {
          ok: false as const,
          error: "Could not read those files. Try PDF with selectable text, or paste the figures as notes.",
        };
      }

      let pq = consolidatePq(mergeIntake(current, local));
      if (grokExtract) pq = consolidatePq(mergeIntake(pq, grokExtract));
      pq = markDocsReceived(
        pq,
        fileSources.map((f) => f.filename),
      );
      const filled = gainedSections(current, pq);
      const report = diffPq(current, pq);
      const summary = formatReport(report);
      const extractNote = (grokExtract?.summary?.trim() || local.summary || "").slice(0, 1_200);
      const combinedSummary = extractNote ? `${summary}\n\n${extractNote}` : summary;

      if (data.householdId) {
        const saved = await persistPq(context.userId, data.householdId, pq);
        if (!saved.ok) return saved;
      }

      return {
        ok: true as const,
        pq,
        filledSections: filled,
        summary: combinedSummary.slice(0, 4_000),
        changes: report,
      };
    } catch (err) {
      return { ok: false as const, error: publicError(err, "Could not fill the questionnaire. Try again.") };
    }
  });

export const improveQuestionnaire = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const rec = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    const notes = typeof rec.notes === "string" ? rec.notes.slice(0, MAX_NOTES_CHARS) : "";
    return { householdId: optionalHouseholdId(rec.householdId), current: rec.current, notes };
  })
  .handler(async ({ context, data }) => {
    try {
      const paced = paceParse(context.userId);
      if (!paced.ok) return { ok: false as const, error: paced.error };
      let current: PqData;
      try {
        current = asPq(data.current);
      } catch {
        return {
          ok: false as const,
          error: "Questionnaire data was not valid. Refresh the page and try again.",
        };
      }

      const stored: StoredFile[] = [];
      if (data.householdId) {
        await assertHousehold(context.userId, data.householdId);
        const sql = await getSql();
        const rows = await sql<{
          filename: string;
          notes_text: string | null;
          kind: string;
        }>`
          select filename, notes_text, kind
          from household_documents
          where household_id = ${data.householdId} and user_id = ${context.userId}
        `;
        for (const r of rows) {
          if (r.kind === "notes") {
            stored.push({
              filename: r.filename,
              mimeType: "text/plain",
              contentB64: null,
              notesText: (r.notes_text ?? "").slice(0, MAX_NOTES_CHARS),
              kind: "notes",
            });
            continue;
          }
          const cached = r.notes_text && pdfTextIsUseful(r.notes_text) ? r.notes_text : null;
          if (cached) {
            stored.push({
              filename: r.filename,
              mimeType: "text/plain",
              contentB64: null,
              notesText: cached,
              kind: "text",
            });
          }
        }
      }

      const storedNotes = stored.find((s) => s.kind === "notes")?.notesText ?? "";
      const combinedNotes = data.notes || storedNotes;
      const fileSources = stored.filter((s) => s.kind !== "notes");

      let pq = consolidatePq(current);
      const texts = textsFromStored(stored);
      const local = parseSourcesToExtract([combinedNotes, ...texts]);
      if (statementRowCount(local) > 0) {
        pq = consolidatePq(mergeIntake(pq, local));
      }
      pq = markDocsReceived(
        pq,
        fileSources.map((f) => f.filename),
      );
      const report = diffPq(current, pq);
      const filled = gainedSections(current, pq);
      const summary = formatReport(report);

      if (data.householdId) {
        const saved = await persistPq(context.userId, data.householdId, pq);
        if (!saved.ok) return saved;
      }

      return {
        ok: true as const,
        pq,
        filledSections: filled,
        summary,
        changes: report,
      };
    } catch (err) {
      return { ok: false as const, error: publicError(err, "Could not review the discovery. Try again.") };
    }
  });
