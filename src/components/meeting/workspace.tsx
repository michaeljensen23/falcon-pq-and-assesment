import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, ListChecks, Loader2, Menu, Sparkles } from "lucide-react";
import { FalconMark, FalconWordmark } from "@/components/brand/falcon-mark";
import { SectionBody } from "@/components/meeting/form-sections";
import { SnapshotRail, SnapshotStrip } from "@/components/meeting/snapshot";
import { AreaField } from "@/components/meeting/fields";
import { IntakeLaunch, IntakePanel } from "@/components/meeting/intake-panel";
import { PqDocument } from "@/components/pq/document";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { downloadLetterPdf } from "@/lib/assessment/pdf";
import { formatMoney } from "@/lib/format";
import { improveQuestionnaire } from "@/lib/intake/server";
import { pqPdfFilename } from "@/lib/pq/facts";
import { overallCompleteness, SECTIONS, sectionCompleteness, type SectionId } from "@/lib/pq/sections";
import { computeTotals, householdLabel } from "@/lib/pq/totals";
import type { PqData } from "@/lib/pq/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  title: string;
  pq: PqData;
  onChange: (pq: PqData) => void;
  saveState?: string;
  assessmentHref: string;
  backHref?: string;
  backLabel?: string;
  banner?: ReactNode;
  onAskAi?: (sectionId: SectionId) => void;
  aiBusy?: boolean;
  aiText?: string | null;
  aiSection?: SectionId | null;
  headerRight?: React.ReactNode;
  householdId?: string;
};

export function MeetingWorkspace({
  title,
  pq,
  onChange,
  saveState,
  assessmentHref,
  backHref = "/",
  backLabel = "Book of business",
  banner,
  onAskAi,
  aiBusy,
  aiText,
  aiSection,
  headerRight,
  householdId,
}: Props) {
  const [section, setSection] = useState<SectionId>("opening");
  const [navOpen, setNavOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [pqBusy, setPqBusy] = useState(false);
  const [pqExport, setPqExport] = useState(false);
  const pqRef = useRef<HTMLDivElement>(null);
  const pqSnap = useRef(pq);
  const pqInflight = useRef(false);
  pqSnap.current = pq;
  const totals = useMemo(() => computeTotals(pq), [pq]);
  const completeness = overallCompleteness(pq);
  const idx = SECTIONS.findIndex((s) => s.id === section);
  const def = SECTIONS[idx] ?? SECTIONS[0];
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  function go(id: SectionId) {
    setSection(id);
    setNavOpen(false);
  }

  function toggleComplete() {
    const has = pq.completedSections.includes(section);
    onChange({
      ...pq,
      completedSections: has
        ? pq.completedSections.filter((x) => x !== section)
        : [...pq.completedSections, section],
    });
  }

  async function reviewDiscovery() {
    setReviewBusy(true);
    setReviewNote(null);
    try {
      const res = await improveQuestionnaire({ data: { householdId, current: pq } });
      if (!res || typeof res !== "object" || !("ok" in res)) {
        setReviewNote("Review did not finish. Open Files and try Review & improve.");
        return;
      }
      if (!res.ok) {
        setReviewNote(res.error || "Could not review the discovery.");
        return;
      }
      onChange(res.pq);
      setReviewNote(res.summary);
    } catch {
      setReviewNote("Could not review the discovery. Try again.");
    } finally {
      setReviewBusy(false);
    }
  }

  useEffect(() => {
    if (!pqExport || pqInflight.current) return;
    const root = pqRef.current;
    if (!root) {
      setPqExport(false);
      setPqBusy(false);
      return;
    }
    pqInflight.current = true;
    void downloadLetterPdf(root, pqPdfFilename(householdLabel(pqSnap.current)))
      .catch(() => {
        toast.error("Could not create the PQ PDF. Try again.");
      })
      .finally(() => {
        pqInflight.current = false;
        setPqExport(false);
        setPqBusy(false);
      });
  }, [pqExport]);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
      {SECTIONS.map((s, i) => {
        const c = sectionCompleteness(pq, s.id);
        const pct = c.total ? c.filled / c.total : 0;
        const done = pq.completedSections.includes(s.id) || pct >= 1;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => go(s.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
              s.id === section ? "bg-white/10 text-cream" : "text-mist/80 hover:bg-white/5 hover:text-cream",
            )}
          >
            <span className="w-5 tabular text-[11px] text-mist/50">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 truncate">{s.short}</span>
            <span
              className={cn(
                "size-1.5 rounded-full",
                done ? "bg-brass" : pct > 0 ? "bg-mist/50" : "bg-white/15",
              )}
            />
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {pqBusy ? (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/50">
          <div className="rounded-lg bg-cream px-6 py-4 text-sm text-navy shadow-[var(--shadow-border-hover)]">
            Preparing PQ…
          </div>
        </div>
      ) : null}
      <header className="no-print sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-border bg-paper/95 px-3 backdrop-blur-sm sm:px-4">
        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-md lg:hidden"
          onClick={() => setNavOpen(true)}
          aria-label="Open sections"
        >
          <Menu className="size-5" />
        </button>
        <a href={backHref} className="flex shrink-0 items-center" aria-label="Falcon Wealth home">
          <FalconMark className="size-12 rounded-md sm:hidden" />
          <FalconWordmark className="hidden h-16 sm:block" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy">{title}</p>
          <p className="truncate text-xs text-slate">
            {saveState ?? "Autosave on"} · {completeness}% captured
          </p>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate">Net worth</p>
            <p className="tabular text-sm font-medium text-navy">
              {formatMoney(totals.netWorth, { compact: true })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate">Gap</p>
            <p
              className={cn(
                "tabular text-sm font-medium",
                totals.shortage < 0 ? "text-rust" : "text-sage",
              )}
            >
              {formatMoney(totals.shortage)}
            </p>
          </div>
        </div>
        <IntakeLaunch onClick={() => setIntakeOpen(true)} />
        <Button variant="outline" size="sm" onClick={() => void reviewDiscovery()} disabled={reviewBusy || pqBusy}>
          {reviewBusy ? <Loader2 className="size-4 animate-spin" /> : <ListChecks className="size-4" />}
          <span className="hidden sm:inline">{reviewBusy ? "Reviewing…" : "Review & improve"}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="PQ Download"
          onClick={() => {
            if (pqBusy) return;
            setPqBusy(true);
            setPqExport(true);
          }}
          disabled={pqBusy || reviewBusy}
        >
          {pqBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          <span className="hidden sm:inline">{pqBusy ? "Preparing…" : "PQ Download"}</span>
        </Button>
        <Button asChild size="sm">
          <a href={assessmentHref}>
            <FileText className="size-4" />
            <span className="hidden sm:inline">Assessment</span>
          </a>
        </Button>
        {headerRight}
      </header>

      {banner}

      {reviewNote ? (
        <div className="no-print border-b border-border bg-cream px-4 py-3 text-sm text-navy">
          <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-3">
            <p className="whitespace-pre-wrap">{reviewNote}</p>
            <button
              type="button"
              className="shrink-0 text-xs text-slate hover:text-navy"
              onClick={() => setReviewNote(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <IntakePanel
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        householdId={householdId}
        pq={pq}
        onFilled={onChange}
      />

      <SnapshotStrip totals={totals} />

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="bg-navy pt-12">
          {nav}
        </SheetContent>
      </Sheet>

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-start md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[13rem_minmax(0,1fr)_16rem]">
        <aside className="no-print sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-full flex-col overflow-y-auto bg-navy lg:flex">
          <div className="px-4 pt-5 pb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brass">
              Discovery
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-brass" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-mist/70">{completeness}% of the PQ</p>
          </div>
          {nav}
          <div className="px-3 pb-4">
            <a
              href={backHref}
              className="block rounded-md px-2 py-2 text-xs text-mist/60 hover:text-cream"
            >
              ← {backLabel}
            </a>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brass-dim">
                Section {idx + 1} of {SECTIONS.length}
              </p>
              <h1 className="font-display text-3xl text-navy sm:text-4xl">{def.label}</h1>
              <p className="mt-1 text-sm text-slate">{def.prompt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onAskAi ? (
                <Button variant="outline" size="sm" onClick={() => onAskAi(section)} disabled={aiBusy}>
                  <Sparkles className="size-4" />
                  {aiBusy ? "Listening…" : "Follow-ups"}
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={toggleComplete}>
                {pq.completedSections.includes(section) ? "Marked complete" : "Mark complete"}
              </Button>
            </div>
          </div>

          {aiText && aiSection === section ? (
            <div className="mb-5 rounded-lg border border-brass/30 bg-cream p-4 text-sm text-navy">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-brass-dim">
                Suggested follow-ups
              </p>
              <div className="whitespace-pre-wrap">{aiText}</div>
            </div>
          ) : null}

          <SectionBody id={section} pq={pq} onChange={onChange} onOpenIntake={() => setIntakeOpen(true)} />

          <div className="mt-6">
            <AreaField
              label="Section notes"
              value={pq.sectionNotes[section] ?? ""}
              onChange={(v) =>
                onChange({ ...pq, sectionNotes: { ...pq.sectionNotes, [section]: v } })
              }
              placeholder="Parking lot, quotes, things to verify after the meeting…"
              rows={3}
            />
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              variant="outline"
              disabled={!prev}
              onClick={() => prev && go(prev.id)}
            >
              <ChevronLeft className="size-4" />
              {prev ? prev.short : "Start"}
            </Button>
            {next ? (
              <Button onClick={() => go(next.id)}>
                {next.short}
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button asChild>
                <a href={assessmentHref}>
                  Generate assessment
                  <FileText className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </main>

        <div className="no-print sticky top-20 hidden self-start px-4 py-6 md:block">
          <SnapshotRail pq={pq} totals={totals} />
        </div>
      </div>

      {pqExport ? (
        <div ref={pqRef} className="pointer-events-none fixed top-0 left-0 z-40 w-[816px]">
          <PqDocument pq={pq} />
        </div>
      ) : null}
    </div>
  );
}
