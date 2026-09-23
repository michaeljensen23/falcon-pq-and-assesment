import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatMoney } from "@/lib/format";
import { buildConcerns } from "@/lib/pq/concerns";
import type { Totals } from "@/lib/pq/totals";
import type { PqData } from "@/lib/pq/types";
import { cn } from "@/lib/utils";

const COLORS = {
  cash: "#8d7038",
  deferred: "#1c3a56",
  taxable: "#2f5574",
  roth: "#3d6b56",
  other: "#5c6b7a",
};

export function SnapshotStrip({ totals }: { totals: Totals }) {
  const items = [
    { label: "Investable", value: totals.totalAssetsExRE },
    { label: totals.shortage < 0 ? "Gap" : "Surplus", value: totals.shortage, alert: totals.shortage < 0 },
    { label: "Cash", value: totals.cash },
    { label: "Deferred", value: totals.deferred },
    { label: "Roth", value: totals.roth },
  ];
  return (
    <div className="no-print sticky top-14 z-20 flex gap-5 overflow-x-auto border-b border-white/10 bg-navy px-4 py-2.5 md:hidden">
      {items.map((item) => (
        <div key={item.label} className="shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-mist/70">{item.label}</p>
          <p
            className={cn(
              "tabular text-sm font-medium",
              item.alert ? "text-brass" : "text-cream",
            )}
          >
            {formatMoney(item.value, { compact: true })}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SnapshotRail({ pq, totals }: { pq: PqData; totals: Totals }) {
  const slices = [
    { name: "Cash", value: totals.cash, color: COLORS.cash },
    { name: "Tax-deferred", value: totals.deferred, color: COLORS.deferred },
    { name: "Taxable", value: totals.investments, color: COLORS.taxable },
    { name: "Roth", value: totals.roth, color: COLORS.roth },
    { name: "Business", value: totals.business, color: COLORS.other },
  ].filter((s) => s.value > 0);

  const concerns = buildConcerns(pq, totals).filter((c) => c.severity === "high");

  return (
    <aside className="flex flex-col gap-3">
      <div className="rounded-xl bg-navy p-4 text-cream">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-mist/80">
          Investable (ex-RE)
        </p>
        <p className="mt-1 font-display text-3xl tabular tracking-tight">
          {formatMoney(totals.totalAssetsExRE)}
        </p>
        <p className="mt-1 text-xs text-mist/80">
          Net worth {formatMoney(totals.netWorth)}
          {totals.realEstate ? ` · RE ${formatMoney(totals.realEstate)}` : ""}
        </p>
      </div>

      <div className="rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">
          Tax location
        </p>
        {slices.length === 0 ? (
          <p className="mt-6 mb-4 text-sm text-slate">Add accounts and the mix appears here.</p>
        ) : (
          <>
            <div className="mx-auto h-28 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={34}
                    outerRadius={52}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {slices.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-xs">
              {slices.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="tabular text-navy">{formatMoney(s.value, { compact: true })}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">
          Retirement paycheck
        </p>
        <Stat label="Guaranteed" value={totals.guaranteedRetirement} />
        <Stat label="Expenses" value={totals.expenses} />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-xs text-slate">
            {totals.shortage < 0 ? "Shortage" : "Surplus"}
          </span>
          <span
            className={cn(
              "tabular text-sm font-medium",
              totals.shortage < 0 ? "text-rust" : "text-sage",
            )}
          >
            {formatMoney(totals.shortage)}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate">
          <span>SS {formatMoney(totals.socialSecurity, { compact: true })}</span>
          <span>Pension {formatMoney(totals.pension, { compact: true })}</span>
          <span>Rental {formatMoney(totals.rental, { compact: true })}</span>
          <span>VA {formatMoney(totals.va, { compact: true })}</span>
        </div>
      </div>

      <div className="rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">
          Today’s cash flow
        </p>
        <Stat label="Income" value={totals.incomeCurrent} />
        <Stat label="Taxes" value={totals.totalTax} />
        <Stat label="Savings" value={totals.totalSavings} />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-xs text-slate">Net +/-</span>
          <span
            className={cn(
              "tabular text-sm font-medium",
              totals.cashFlow < 0 ? "text-rust" : "text-sage",
            )}
          >
            {formatMoney(totals.cashFlow)}
          </span>
        </div>
      </div>

      {concerns.length > 0 ? (
        <div className="rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">
            High-priority findings
          </p>
          <ul className="mt-2 space-y-2">
            {concerns.slice(0, 4).map((c) => (
              <li key={c.id} className="text-sm text-navy">
                {c.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className="text-xs text-slate">{label}</span>
      <span className="tabular text-sm text-navy">{formatMoney(value)}</span>
    </div>
  );
}
