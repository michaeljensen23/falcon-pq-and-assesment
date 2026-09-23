import { useRef, useState, type ReactNode } from "react";
import { FalconWordmark } from "@/components/brand/falcon-mark";
import { Button } from "@/components/ui/button";
import { assessmentPdfFilename, downloadAssessmentPdf } from "@/lib/assessment/pdf";
import { formatMoney, ageFromDob } from "@/lib/format";
import {
  ASSET_CLASSES,
  INVESTMENT_STRATEGIES,
  TAX_STRATEGIES,
  buildConcerns,
} from "@/lib/pq/concerns";
import { computeTotals, householdLabel } from "@/lib/pq/totals";
import type { PqData } from "@/lib/pq/types";
import { cn } from "@/lib/utils";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AssessmentDocument({
  pq,
  meetingHref,
  preparedBy,
}: {
  pq: PqData;
  meetingHref: string;
  preparedBy?: string;
}) {
  const totals = computeTotals(pq);
  const concerns = buildConcerns(pq, totals);
  const client = [pq.client.firstName, pq.client.lastName].filter(Boolean).join(" ");
  const spouse = [pq.spouse.firstName, pq.spouse.lastName].filter(Boolean).join(" ");
  const names = [client, spouse].filter(Boolean).join("  ·  ") || "Household";
  const advisor = preparedBy || pq.advisor || "Falcon Wealth Planning";
  const cAge = ageFromDob(pq.client.dob);
  const sAge = ageFromDob(pq.spouse.dob);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    const root = pagesRef.current;
    if (!root || downloading) return;
    setDownloading(true);
    try {
      await downloadAssessmentPdf(root, assessmentPdfFilename(householdLabel(pq)));
    } catch {
      toast.error("Could not create the PDF. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-navy-deep print:bg-white">
      {downloading ? (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/50">
          <div className="rounded-lg bg-cream px-6 py-4 text-sm text-navy shadow-[var(--shadow-border-hover)]">
            Preparing PDF…
          </div>
        </div>
      ) : null}
      <div className="no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-navy px-4 text-cream">
        <a href={meetingHref} className="text-sm text-mist hover:text-cream">
          ← Back to meeting
        </a>
        <span className="hidden truncate text-sm sm:block">{names}</span>
        <Button size="sm" variant="brass" onClick={() => void downloadPdf()} disabled={downloading}>
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {downloading ? "Preparing…" : "Download PDF"}
        </Button>
      </div>

      <div
        ref={pagesRef}
        className="mx-auto flex max-w-[820px] flex-col gap-6 px-4 py-8 print:max-w-none print:gap-0 print:p-0"
      >
        <Page cover>
          <Cover names={names} advisor={advisor} />
        </Page>

        <Page>
          <DocHeader />
          <h2 className="font-display text-3xl text-navy">Introduction</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink">
            <p>
              This Financial Assessment was created from the information captured in your discovery
              meeting. It is designed to give you the resources you need to meet your financial goals
              effectively. Estimates, projections, and figures are approximations based on mathematical
              calculations. Taking this information as absolute may adversely affect your current
              financial position.
            </p>
            <p>
              The analysis is a guide to improving your current situation; the recommendations are a
              starting point. Falcon Wealth provides one to two meetings with our Certified Financial
              Planners at no cost. Financial planning is a continuous series of decisions in service of
              outstanding goals.
            </p>
            <p>
              Our CFP® practitioners are one section of your personal finance and should work alongside
              your CPA and estate attorney. Portions of this report may be based on generally accepted
              tax and estate principles, which are always subject to change. Independent tax and legal
              counsel are suggested.
            </p>
          </div>
        </Page>

        <Page>
          <DocHeader />
          <h2 className="font-display text-2xl text-navy">
            Financial, Retirement, Tax & Investment Assessment
          </h2>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
            1. Where you are today
          </h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              <Row k="Cash & emergency fund" v={totals.cash} />
              <Row k="Tax deferred / qualified / IRA" v={totals.deferred} />
              <Row k="Taxable / non-qualified / brokerage" v={totals.investments} />
              <Row k="Tax free / Roth" v={totals.roth} />
              {totals.business > 0 ? <Row k="Business & other" v={totals.business} /> : null}
              <Row k="Total assets" v={totals.totalAssetsExRE} strong note="Excluding real estate" />
            </tbody>
          </table>
          {totals.realEstate > 0 ? (
            <p className="mt-2 text-xs text-slate">
              Real estate {formatMoney(totals.realEstate)}
              {totals.realEstateLiabilities
                ? ` · mortgages ${formatMoney(totals.realEstateLiabilities)}`
                : ""}
              {" · "}Net worth {formatMoney(totals.netWorth)}
            </p>
          ) : null}

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
            2. What retirement looks like
          </h3>
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate">Expenses today</p>
              <p className="font-display text-3xl text-navy tabular">{formatMoney(totals.expenses)}</p>
            </div>
            <table className="text-sm">
              <tbody>
                <Row k="Social Security" v={totals.socialSecurity} />
                <Row k="Pension" v={totals.pension} />
                <Row k="Rental income" v={totals.rental} />
                <Row k="VA benefits" v={totals.va} />
                <Row k="Total guaranteed income" v={totals.guaranteedRetirement} strong />
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
            3. Shortage required from investments
          </h3>
          <div
            className={cn(
              "mt-3 inline-flex items-baseline gap-3 rounded-md px-4 py-3",
              totals.shortage < 0 ? "bg-rust/10" : "bg-sage/10",
            )}
          >
            <span className="text-xs uppercase tracking-wider text-slate">
              {totals.shortage < 0 ? "Shortage" : "Surplus"}
            </span>
            <span
              className={cn(
                "font-display text-3xl tabular",
                totals.shortage < 0 ? "text-rust" : "text-sage",
              )}
            >
              {formatMoney(totals.shortage)}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate">
            Will this fixed retirement income be enough when factoring in taxes, mortgage payoff, Social
            Security gap, COLA, insurance gap, and education or care expenses?
            {cAge ? ` Client age ${cAge}.` : ""}
            {sAge ? ` Spouse age ${sAge}.` : ""}
          </p>
        </Page>

        <Page>
          <DocHeader />
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
            4. Tax planning and tax reduction strategies
          </h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink">
            {TAX_STRATEGIES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </Page>

        <Page>
          <DocHeader />
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
            5. Investments
          </h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink">
            {INVESTMENT_STRATEGIES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
            6. Insurance and estate planning
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink">
            <li>Estate tax changes come 2026</li>
            <li>Annual gifting</li>
            <li>Charitable giving</li>
            <li>
              Establish estate planning documents — living trust, pour-over will, POAs (healthcare &
              financial), HIPAA
            </li>
            <li>Avoid public records, time delays, probate expenses and attorney fees</li>
            <li>Protect the estate against long-term illness and premature death</li>
            <li>Simplification through coordination of advisors</li>
          </ul>
        </Page>

        <Page>
          <DocHeader />
          <h2 className="font-display text-3xl text-navy">Areas of concern</h2>
          <p className="mt-1 text-sm text-slate">Focus areas for planning, generated from this household.</p>
          <div className="mt-6 space-y-6" data-pdf-split>
            {concerns.map((c) => (
              <section key={c.id} className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl text-navy">{c.title}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      c.severity === "high"
                        ? "bg-rust/15 text-rust"
                        : c.severity === "watch"
                          ? "bg-brass/20 text-brass-dim"
                          : "bg-paper-2 text-slate",
                    )}
                  >
                    {c.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink">{c.summary}</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-brass-dim">
                  Recommended strategy
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink">
                  {c.strategy.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Page>

        <Page>
          <DocHeader />
          <h2 className="font-display text-2xl text-navy">
            Investment management · {formatMoney(totals.totalAssetsExRE)}
          </h2>
          <p className="mt-3 text-sm text-ink">
            Develop a diversified, tax-efficient portfolio to provide for cash-flow needs and mitigate
            inflation. Institutional index funds are favored; ETFs where institutional shares are not
            optimal. Incorporate 12–20 asset classes in percentages contingent on the required return:
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md bg-paper-2 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate">US holdings</p>
              <ul className="mt-2 space-y-1 text-ink">
                {ASSET_CLASSES.us.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-paper-2 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate">
                International
              </p>
              <ul className="mt-2 space-y-1 text-ink">
                {ASSET_CLASSES.intl.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-paper-2 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate">
                Fixed income
              </p>
              <ul className="mt-2 space-y-1 text-ink">
                {ASSET_CLASSES.fixed.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          {totals.annualFees > 0 ? (
            <div className="mt-6 rounded-md bg-cream p-4 shadow-[var(--shadow-border)]">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate">
                Current managed-asset cost
              </p>
              <p className="mt-1 text-sm text-ink">
                Approximate weighted fund expense {totals.weightedFeePct.toFixed(2)}% ·{" "}
                {formatMoney(totals.annualFees)} per year on {formatMoney(totals.managedAssets)} of
                managed assets.
              </p>
            </div>
          ) : null}
        </Page>

        <Page>
          <DocHeader />
          <h2 className="font-display text-2xl text-navy">Tax diversification</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            Flexibility in retirement comes from owning three tax personalities — taxable, tax-deferred,
            and tax-free — so you can choose the character of income each year.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Bucket
              title="Tax-free"
              amount={totals.roth}
              items={["Roth IRAs", "Roth 401(k)", "Municipal bonds (in part)"]}
              note="0% qualified out"
            />
            <Bucket
              title="Taxable"
              amount={totals.investments + totals.cash}
              items={["Brokerage", "Crypto", "Checking / savings", "Collectibles"]}
              note="0–23.8% capital gains"
            />
            <Bucket
              title="Tax-deferred"
              amount={totals.deferred}
              items={["IRAs", "401(k) / 403(b) / 457", "SEP / SIMPLE", "Defined benefit"]}
              note="Ordinary income out"
            />
          </div>
        </Page>

        {pq.goals || pq.concerns ? (
          <Page>
            <DocHeader />
            <h2 className="font-display text-2xl text-navy">Notes from discovery</h2>
            {pq.goals ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
                  Goals captured
                </h3>
                {splitParas(pq.goals).map((para, i) => (
                  <p key={`goal-${i}`} className="mt-2 text-sm leading-relaxed text-ink">
                    {para}
                  </p>
                ))}
              </>
            ) : null}
            {pq.concerns ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid">
                  Concerns captured
                </h3>
                {splitParas(pq.concerns).map((para, i) => (
                  <p key={`concern-${i}`} className="mt-2 text-sm leading-relaxed text-ink">
                    {para}
                  </p>
                ))}
              </>
            ) : null}
          </Page>
        ) : null}

        <Page>
          <DocHeader />
          <h2 className="font-display text-2xl text-navy">Household snapshot</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Item k="Client" v={client || "—"} />
            <Item k="Spouse" v={spouse || "—"} />
            <Item
              k="Residence"
              v={[pq.address.city, pq.address.state].filter(Boolean).join(", ") || "—"}
            />
            <Item k="Filing status" v={pq.filingStatus || "—"} />
            <Item k="Advisor" v={pq.advisor || "—"} />
            <Item k="Referred by" v={pq.referredBy || "—"} />
            <Item
              k="Attorney"
              v={joinNameFirm(pq.advisors.attorney.name, pq.advisors.attorney.firm)}
            />
            <Item k="CPA" v={joinNameFirm(pq.advisors.accountant.name, pq.advisors.accountant.firm)} />
          </dl>
          <p className="mt-10 text-xs leading-relaxed text-slate">
            Falcon Wealth Planning, Inc. · www.FalconWealthPlanning.com · (855) 963-2526 · Office
            locations serving nationwide. This document is educational and is not tax, legal, or
            investment advice. CFP® is a certification mark owned by Certified Financial Planner Board
            of Standards, Inc.
          </p>
        </Page>
      </div>
    </div>
  );
}

function Page({ children, cover }: { children: ReactNode; cover?: boolean }) {
  return (
    <section
      data-pdf-page
      data-pdf-cover={cover ? "true" : undefined}
      className={cn(
        "print-page rounded-xl bg-cream px-8 py-10 shadow-[var(--shadow-border)] print:rounded-none print:px-12 print:py-12 print:shadow-none",
        cover && "overflow-hidden p-0 print:p-0",
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
      <span className="text-[11px] uppercase tracking-[0.18em] text-slate">Financial Assessment</span>
    </div>
  );
}

function Cover({ names, advisor }: { names: string; advisor: string }) {
  return (
    <div className="assessment-cover relative flex min-h-[640px] flex-col justify-between overflow-hidden rounded-xl bg-navy px-8 py-10 text-cream print:min-h-[900px]">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(176,141,74,0.18),transparent_55%)]" />
      <FalconWordmark inverted className="relative h-28" />
      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brass">
          Financial Assessment
        </p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-cream">{names}</h1>
        <p className="mt-6 text-sm text-mist">Prepared by {advisor}</p>
        <p className="mt-1 text-sm text-mist/70">
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <div className="relative text-xs text-mist/70">
        www.FalconWealthPlanning.com
        <br />
        (855) 963-2526 · Serving nationwide
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  strong,
  note,
}: {
  k: string;
  v: number;
  strong?: boolean;
  note?: string;
}) {
  return (
    <tr className={cn(strong && "bg-navy/5 font-medium")}>
      <td className="py-1.5 pr-4 text-ink">
        {k}
        {note ? <span className="ml-2 text-[11px] font-normal text-slate">{note}</span> : null}
      </td>
      <td className="py-1.5 text-right tabular text-navy">{formatMoney(v)}</td>
    </tr>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-slate">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}

function joinNameFirm(name: string, firm: string) {
  return [name, firm].map((s) => s.trim()).filter(Boolean).join(" · ") || "—";
}

function splitParas(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Bucket({
  title,
  amount,
  items,
  note,
}: {
  title: string;
  amount: number;
  items: string[];
  note: string;
}) {
  return (
    <div className="rounded-lg bg-paper-2 p-4">
      <p className="font-display text-xl text-navy">{title}</p>
      <p className="tabular text-sm text-navy-mid">{formatMoney(amount)}</p>
      <p className="mt-1 text-[11px] text-slate">{note}</p>
      <ul className="mt-3 space-y-1 text-sm text-ink">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
