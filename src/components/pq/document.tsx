import type { ReactNode } from "react";
import { FalconWordmark } from "@/components/brand/falcon-mark";
import { buildSectionFacts, type FactItem } from "@/lib/pq/facts";
import { overallCompleteness } from "@/lib/pq/sections";
import { computeTotals, householdLabel } from "@/lib/pq/totals";
import type { PqData } from "@/lib/pq/types";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

export function PqDocument({ pq }: { pq: PqData }) {
  const sections = buildSectionFacts(pq);
  const totals = computeTotals(pq);
  const names = householdLabel(pq);
  const advisor = pq.advisor || "Falcon Wealth Planning";
  const completeness = overallCompleteness(pq);

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6 bg-navy-deep px-0 py-0">
      <Sheet cover>
        <div className="assessment-cover relative flex min-h-[640px] flex-col justify-between overflow-hidden rounded-xl bg-navy px-8 py-10 text-cream">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(176,141,74,0.18),transparent_55%)]" />
          <FalconWordmark inverted className="relative h-28" />
          <div className="relative">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brass">
              Personal Financial Questionnaire
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-cream">{names}</h1>
            <p className="mt-6 text-sm text-mist">Discovery facts · 14 sections</p>
            <p className="mt-1 text-sm text-mist/70">Prepared by {advisor}</p>
            <p className="mt-1 text-sm text-mist/70">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {` · ${completeness}% captured`}
            </p>
          </div>
          <div className="relative text-xs text-mist/70">
            Investable {formatMoney(totals.totalAssetsExRE)}
            <br />
            Net worth {formatMoney(totals.netWorth)}
          </div>
        </div>
      </Sheet>

      {sections.map((section) => (
        <Sheet key={section.id}>
          <DocHeader />
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brass-dim">
            Section {section.number} of 14
          </p>
          <h2 className="mt-1 font-display text-3xl text-navy">{section.label}</h2>
          <p className="mt-1 text-sm text-slate">{section.prompt}</p>
          <div className="mt-6" data-pdf-split>
            {section.items.map((item, i) => (
              <FactView key={`${section.id}-${i}`} item={item} />
            ))}
          </div>
        </Sheet>
      ))}
    </div>
  );
}

function Sheet({ children, cover }: { children: ReactNode; cover?: boolean }) {
  return (
    <section
      data-pdf-page
      data-pdf-cover={cover ? "true" : undefined}
      className={cn(
        "print-page rounded-xl bg-cream px-8 py-10 shadow-[var(--shadow-border)]",
        cover && "overflow-hidden p-0",
      )}
    >
      {children}
    </section>
  );
}

function DocHeader() {
  return (
    <div data-pdf-header className="mb-8 flex items-center justify-between border-b border-border pb-4">
      <FalconWordmark className="h-14" />
      <span className="text-[11px] uppercase tracking-[0.18em] text-slate">Discovery PQ</span>
    </div>
  );
}

function FactView({ item }: { item: FactItem }) {
  if (item.kind === "empty") {
    return <p className="text-sm text-slate">No facts captured in this section yet.</p>;
  }
  if (item.kind === "note") {
    return (
      <div className="mt-4">
        {item.heading ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brass-dim">{item.heading}</p>
        ) : (
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brass-dim">Notes</p>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{item.text}</p>
      </div>
    );
  }
  if (item.kind === "pairs") {
    return (
      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {item.pairs.map((p) => (
          <div key={p.k} className={p.v.length > 80 ? "col-span-2" : undefined}>
            <dt className="text-[11px] uppercase tracking-wider text-slate">{p.k}</dt>
            <dd className="whitespace-pre-wrap text-ink">{p.v}</dd>
          </div>
        ))}
      </dl>
    );
  }
  const total = item.title.toLowerCase().includes("total");
  return (
    <div className={cn("flex items-start justify-between gap-4 border-t border-border py-3", total && "font-medium")}>
      <div className="min-w-0">
        <p className="text-sm text-navy">{item.title}</p>
        {item.detail ? <p className="mt-0.5 text-xs text-slate">{item.detail}</p> : null}
      </div>
      {item.amount ? <p className="shrink-0 tabular text-sm text-navy">{item.amount}</p> : null}
    </div>
  );
}
