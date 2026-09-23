import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { IntakeCard } from "@/components/meeting/intake-panel";
import {
  AddRowButton,
  AreaField,
  CheckRow,
  Field,
  MiniSelect,
  MoneyField,
  MoneyInput,
  TextField,
} from "@/components/meeting/fields";
import { Input } from "@/components/ui/input";
import { ageFromDob } from "@/lib/format";
import {
  emptyAccount,
  emptyBusiness,
  emptyCash,
  emptyChild,
  emptyIncome,
  emptyInsurance,
  emptyLiability,
  emptyRealEstate,
} from "@/lib/pq/empty";
import type { SectionId } from "@/lib/pq/sections";
import type { AdvisorContact, PqData } from "@/lib/pq/types";
import { cn } from "@/lib/utils";

type Props = { pq: PqData; onChange: (pq: PqData) => void; onOpenIntake?: () => void };

export function SectionBody({
  id,
  pq,
  onChange,
  onOpenIntake,
}: {
  id: SectionId;
  pq: PqData;
  onChange: (pq: PqData) => void;
  onOpenIntake?: () => void;
}) {
  switch (id) {
    case "opening":
      return <OpeningSection pq={pq} onChange={onChange} onOpenIntake={onOpenIntake} />;
    case "family":
      return <FamilySection pq={pq} onChange={onChange} />;
    case "occupation":
      return <OccupationSection pq={pq} onChange={onChange} />;
    case "advisors":
      return <AdvisorsSection pq={pq} onChange={onChange} />;
    case "real-estate":
      return <RealEstateSection pq={pq} onChange={onChange} />;
    case "deferred":
      return (
        <AccountsSection
          pq={pq}
          onChange={onChange}
          keyName="deferred"
          extraLabel="Company match"
          types={["Traditional IRA", "Rollover IRA", "401(k)", "403(b)", "457", "SEP/SIMPLE", "Pension", "Annuity"]}
        />
      );
    case "roth":
      return (
        <AccountsSection
          pq={pq}
          onChange={onChange}
          keyName="roth"
          extraLabel="ER contrib / 5 years?"
          types={["Roth IRA", "Roth 401(k)", "After-tax 401(k)", "HSA"]}
          emptyNote="No Roth on the books is itself a finding — mark the section complete and keep moving."
        />
      );
    case "investments":
      return (
        <AccountsSection
          pq={pq}
          onChange={onChange}
          keyName="investments"
          extraLabel="Cost basis"
          types={["Brokerage", "Individual stocks", "ETF / mutual fund", "Non-qualified annuity", "Crypto", "Other"]}
        />
      );
    case "cash":
      return <CashSection pq={pq} onChange={onChange} />;
    case "business":
      return <BusinessSection pq={pq} onChange={onChange} />;
    case "liabilities":
      return <LiabilitiesSection pq={pq} onChange={onChange} />;
    case "insurance":
      return <InsuranceSection pq={pq} onChange={onChange} />;
    case "income":
      return <IncomeSection pq={pq} onChange={onChange} />;
    case "goals":
      return <GoalsSection pq={pq} onChange={onChange} />;
  }
}

function OpeningSection({ pq, onChange, onOpenIntake }: Props) {
  return (
    <div className="space-y-5">
      {onOpenIntake ? <IntakeCard onClick={onOpenIntake} /> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Advisor" value={pq.advisor} onChange={(v) => onChange({ ...pq, advisor: v })} />
        <TextField
          label="Paraplanner"
          value={pq.paraPlanner}
          onChange={(v) => onChange({ ...pq, paraPlanner: v })}
        />
        <TextField
          label="Date of 2nd meeting"
          type="date"
          value={pq.dateOfSecondMeeting}
          onChange={(v) => onChange({ ...pq, dateOfSecondMeeting: v })}
        />
      </div>
      <TextField
        label="Referred by"
        value={pq.referredBy}
        onChange={(v) => onChange({ ...pq, referredBy: v })}
        placeholder="Client name or source"
      />
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate">
          Requested documents
        </p>
        <div className="divide-y divide-border rounded-lg bg-cream shadow-[var(--shadow-border)]">
          {pq.requestedDocuments.map((d) => (
            <label key={d.id} className="flex min-h-11 items-center gap-3 px-3">
              <input
                type="checkbox"
                checked={d.received}
                onChange={(e) =>
                  onChange({
                    ...pq,
                    requestedDocuments: pq.requestedDocuments.map((x) =>
                      x.id === d.id ? { ...x, received: e.target.checked } : x,
                    ),
                  })
                }
                className="size-4 accent-navy"
              />
              <span className={cn("text-sm", d.received && "text-slate line-through")}>{d.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function FamilySection({ pq, onChange }: Props) {
  const cAge = ageFromDob(pq.client.dob);
  const sAge = ageFromDob(pq.spouse.dob);
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 font-display text-lg text-navy">Client</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="First name"
            value={pq.client.firstName}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, firstName: v } })}
          />
          <TextField
            label="Nickname"
            value={pq.client.nickname}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, nickname: v } })}
          />
          <TextField
            label="Last name"
            value={pq.client.lastName}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, lastName: v } })}
          />
          <Field label="Marital status">
            <MiniSelect
              value={pq.client.maritalStatus}
              onChange={(v) => onChange({ ...pq, client: { ...pq.client, maritalStatus: v } })}
              options={["", "Married", "Single", "Widowed", "Divorced", "Domestic partner"]}
            />
          </Field>
          <TextField
            label="Date of birth"
            type="date"
            value={pq.client.dob}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, dob: v } })}
          />
          <Field label="Age">
            <div className="flex h-10 items-center rounded-md bg-paper-2 px-3 text-sm tabular text-navy">
              {cAge ?? "—"}
            </div>
          </Field>
        </div>
      </div>
      <div>
        <p className="mb-3 font-display text-lg text-navy">Spouse</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="First name"
            value={pq.spouse.firstName}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, firstName: v } })}
          />
          <TextField
            label="Nickname"
            value={pq.spouse.nickname}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, nickname: v } })}
          />
          <TextField
            label="Last name"
            value={pq.spouse.lastName}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, lastName: v } })}
          />
          <TextField
            label="Years married"
            value={pq.spouse.yearsMarried}
            onChange={(v) =>
              onChange({
                ...pq,
                spouse: { ...pq.spouse, yearsMarried: v },
                client: { ...pq.client, yearsMarried: v },
              })
            }
          />
          <TextField
            label="Date of birth"
            type="date"
            value={pq.spouse.dob}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, dob: v } })}
          />
          <Field label="Age">
            <div className="flex h-10 items-center rounded-md bg-paper-2 px-3 text-sm tabular text-navy">
              {sAge ?? "—"}
            </div>
          </Field>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <TextField
          className="lg:col-span-2"
          label="Residence"
          value={pq.address.street}
          onChange={(v) => onChange({ ...pq, address: { ...pq.address, street: v } })}
        />
        <TextField
          label="City"
          value={pq.address.city}
          onChange={(v) => onChange({ ...pq, address: { ...pq.address, city: v } })}
        />
        <TextField
          label="State"
          value={pq.address.state}
          onChange={(v) => onChange({ ...pq, address: { ...pq.address, state: v } })}
        />
        <TextField
          label="Zip"
          value={pq.address.zip}
          onChange={(v) => onChange({ ...pq, address: { ...pq.address, zip: v } })}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate">
          Children
        </p>
        <div className="space-y-2">
          {pq.children.map((ch) => (
            <div key={ch.id} className="grid grid-cols-[1fr_6rem_auto] gap-2">
              <Input
                placeholder="Name"
                value={ch.name}
                onChange={(e) =>
                  onChange({
                    ...pq,
                    children: pq.children.map((x) =>
                      x.id === ch.id ? { ...x, name: e.target.value } : x,
                    ),
                  })
                }
              />
              <Input
                placeholder="Age"
                value={ch.age}
                onChange={(e) =>
                  onChange({
                    ...pq,
                    children: pq.children.map((x) =>
                      x.id === ch.id ? { ...x, age: e.target.value } : x,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="grid size-10 place-items-center text-slate hover:text-rust"
                onClick={() => onChange({ ...pq, children: pq.children.filter((x) => x.id !== ch.id) })}
                aria-label="Remove child"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <AddRowButton onClick={() => onChange({ ...pq, children: [...pq.children, emptyChild()] })}>
          Add child
        </AddRowButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField
          label="Total grandchildren"
          value={pq.grandchildrenCount}
          onChange={(v) => onChange({ ...pq, grandchildrenCount: v })}
        />
        <AreaField
          label="Family notes"
          value={pq.familyNotes}
          onChange={(v) => onChange({ ...pq, familyNotes: v })}
        />
        <AreaField
          label="Grandchildren notes"
          value={pq.grandchildrenNotes}
          onChange={(v) => onChange({ ...pq, grandchildrenNotes: v })}
        />
      </div>
    </div>
  );
}

function OccupationSection({ pq, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 font-display text-lg text-navy">
          {pq.client.firstName || "Client"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="Job title"
            value={pq.client.jobTitle}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, jobTitle: v } })}
          />
          <TextField
            label="Employer (last, if retired)"
            value={pq.client.employer}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, employer: v } })}
          />
          <TextField
            label="# of years"
            value={pq.client.yearsAtJob}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, yearsAtJob: v } })}
          />
          <TextField
            label="Retirement age"
            value={pq.client.retirementAge}
            onChange={(v) => onChange({ ...pq, client: { ...pq.client, retirementAge: v } })}
          />
        </div>
      </div>
      <div>
        <p className="mb-3 font-display text-lg text-navy">
          {pq.spouse.firstName || "Spouse"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="Job title"
            value={pq.spouse.jobTitle}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, jobTitle: v } })}
          />
          <TextField
            label="Employer (last, if retired)"
            value={pq.spouse.employer}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, employer: v } })}
          />
          <TextField
            label="# of years"
            value={pq.spouse.yearsAtJob}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, yearsAtJob: v } })}
          />
          <TextField
            label="Retirement age"
            value={pq.spouse.retirementAge}
            onChange={(v) => onChange({ ...pq, spouse: { ...pq.spouse, retirementAge: v } })}
          />
        </div>
      </div>
    </div>
  );
}

function AdvisorCard({
  title,
  value,
  onChange,
}: {
  title: string;
  value: AdvisorContact;
  onChange: (v: AdvisorContact) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg bg-cream p-4 shadow-[var(--shadow-border)]">
      <p className="font-display text-lg text-navy">{title}</p>
      <TextField label="Name" value={value.name} onChange={(v) => onChange({ ...value, name: v })} />
      <TextField label="Firm" value={value.firm} onChange={(v) => onChange({ ...value, firm: v })} />
      <TextField label="Notes" value={value.notes} onChange={(v) => onChange({ ...value, notes: v })} />
      <div className="flex flex-wrap gap-4">
        <CheckRow
          label="Preference"
          checked={value.preference}
          onChange={(v) => onChange({ ...value, preference: v })}
        />
        <CheckRow
          label="Commitment"
          checked={value.commitment}
          onChange={(v) => onChange({ ...value, commitment: v })}
        />
      </div>
    </div>
  );
}

function AdvisorsSection({ pq, onChange }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdvisorCard
        title="Attorney"
        value={pq.advisors.attorney}
        onChange={(v) => onChange({ ...pq, advisors: { ...pq.advisors, attorney: v } })}
      />
      <AdvisorCard
        title="Accountant"
        value={pq.advisors.accountant}
        onChange={(v) => onChange({ ...pq, advisors: { ...pq.advisors, accountant: v } })}
      />
      <AdvisorCard
        title="Insurance agent"
        value={pq.advisors.insurance}
        onChange={(v) => onChange({ ...pq, advisors: { ...pq.advisors, insurance: v } })}
      />
      <AdvisorCard
        title="Other advisor"
        value={pq.advisors.other}
        onChange={(v) => onChange({ ...pq, advisors: { ...pq.advisors, other: v } })}
      />
    </div>
  );
}

function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn("px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-slate", className)}>
      {children}
    </th>
  );
}

function RealEstateSection({ pq, onChange }: Props) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Description</Th>
              <Th className="w-32">Market value</Th>
              <Th className="w-32">Liability</Th>
              <Th className="w-28">Rate / term</Th>
              <Th className="w-28">PMT</Th>
              <Th className="w-28">Income EBT</Th>
              <Th className="w-24">Year</Th>
              <Th className="w-28">Ownership</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pq.realEstate.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.description}
                    placeholder="Primary residence"
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, description: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.marketValue}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, marketValue: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.liabilityAmount}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, liabilityAmount: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.rateTerm}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, rateTerm: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.payment}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) => (x.id === r.id ? { ...x, payment: n } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.incomeEbt}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, incomeEbt: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.acquisitionYear}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, acquisitionYear: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.ownership}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        realEstate: pq.realEstate.map((x) =>
                          x.id === r.id ? { ...x, ownership: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() =>
                      onChange({ ...pq, realEstate: pq.realEstate.filter((x) => x.id !== r.id) })
                    }
                    aria-label="Remove property"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={() => onChange({ ...pq, realEstate: [...pq.realEstate, emptyRealEstate()] })}>
        Add property
      </AddRowButton>
    </div>
  );
}

function AccountsSection({
  pq,
  onChange,
  keyName,
  extraLabel,
  types,
  emptyNote,
}: Props & {
  keyName: "deferred" | "roth" | "investments";
  extraLabel: string;
  types: string[];
  emptyNote?: string;
}) {
  const rows = pq[keyName];
  const setRows = (next: typeof rows) => onChange({ ...pq, [keyName]: next });
  return (
    <div>
      {emptyNote ? <p className="mb-3 text-sm text-slate">{emptyNote}</p> : null}
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Custodian</Th>
              <Th className="w-32">Market value</Th>
              <Th className="w-28">Additions</Th>
              <Th className="w-32">{extraLabel}</Th>
              <Th className="w-36">Type</Th>
              <Th className="w-28">Owner</Th>
              <Th>Beneficiary</Th>
              <Th className="w-20">Fee %</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.custodian}
                    onChange={(e) =>
                      setRows(rows.map((x) => (x.id === r.id ? { ...x, custodian: e.target.value } : x)))
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.marketValue}
                    onChange={(n) => setRows(rows.map((x) => (x.id === r.id ? { ...x, marketValue: n } : x)))}
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.additions}
                    onChange={(n) => setRows(rows.map((x) => (x.id === r.id ? { ...x, additions: n } : x)))}
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.extra}
                    onChange={(n) => setRows(rows.map((x) => (x.id === r.id ? { ...x, extra: n } : x)))}
                  />
                </td>
                <td className="p-1.5">
                  <MiniSelect
                    value={r.type}
                    onChange={(v) => setRows(rows.map((x) => (x.id === r.id ? { ...x, type: v } : x)))}
                    options={["", ...types]}
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.ownership}
                    onChange={(e) =>
                      setRows(rows.map((x) => (x.id === r.id ? { ...x, ownership: e.target.value } : x)))
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.beneficiary}
                    onChange={(e) =>
                      setRows(rows.map((x) => (x.id === r.id ? { ...x, beneficiary: e.target.value } : x)))
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    className="tabular text-right"
                    value={r.feePct ? String(r.feePct) : ""}
                    onChange={(e) =>
                      setRows(
                        rows.map((x) =>
                          x.id === r.id ? { ...x, feePct: Number(e.target.value) || 0 } : x,
                        ),
                      )
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
                    aria-label="Remove account"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={() => setRows([...rows, emptyAccount(extraLabel)])}>Add account</AddRowButton>
    </div>
  );
}

function CashSection({ pq, onChange }: Props) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Description</Th>
              <Th className="w-36">Market value</Th>
              <Th className="w-28">Int. rate</Th>
              <Th className="w-32">Owner</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pq.cash.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.description}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        cash: pq.cash.map((x) => (x.id === r.id ? { ...x, description: e.target.value } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.marketValue}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        cash: pq.cash.map((x) => (x.id === r.id ? { ...x, marketValue: n } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.intRate}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        cash: pq.cash.map((x) => (x.id === r.id ? { ...x, intRate: e.target.value } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.owner}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        cash: pq.cash.map((x) => (x.id === r.id ? { ...x, owner: e.target.value } : x)),
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() => onChange({ ...pq, cash: pq.cash.filter((x) => x.id !== r.id) })}
                    aria-label="Remove cash row"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={() => onChange({ ...pq, cash: [...pq.cash, emptyCash()] })}>
        Add cash / CD
      </AddRowButton>
    </div>
  );
}

function BusinessSection({ pq, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate">List any cash held inside the business as business cash.</p>
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Description</Th>
              <Th className="w-36">Market value</Th>
              <Th className="w-36">Cost basis</Th>
              <Th className="w-32">Owner</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pq.business.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.description}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        business: pq.business.map((x) =>
                          x.id === r.id ? { ...x, description: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.marketValue}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        business: pq.business.map((x) => (x.id === r.id ? { ...x, marketValue: n } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.costBasis}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        business: pq.business.map((x) => (x.id === r.id ? { ...x, costBasis: n } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.owner}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        business: pq.business.map((x) => (x.id === r.id ? { ...x, owner: e.target.value } : x)),
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() =>
                      onChange({ ...pq, business: pq.business.filter((x) => x.id !== r.id) })
                    }
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={() => onChange({ ...pq, business: [...pq.business, emptyBusiness()] })}>
        Add business / other asset
      </AddRowButton>
    </div>
  );
}

function LiabilitiesSection({ pq, onChange }: Props) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Description</Th>
              <Th className="w-36">Amount</Th>
              <Th className="w-28">Int. rate</Th>
              <Th className="w-36">Term / PMT</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pq.otherLiabilities.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.description}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        otherLiabilities: pq.otherLiabilities.map((x) =>
                          x.id === r.id ? { ...x, description: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.amount}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        otherLiabilities: pq.otherLiabilities.map((x) =>
                          x.id === r.id ? { ...x, amount: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.intRate}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        otherLiabilities: pq.otherLiabilities.map((x) =>
                          x.id === r.id ? { ...x, intRate: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.termPmt}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        otherLiabilities: pq.otherLiabilities.map((x) =>
                          x.id === r.id ? { ...x, termPmt: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() =>
                      onChange({
                        ...pq,
                        otherLiabilities: pq.otherLiabilities.filter((x) => x.id !== r.id),
                      })
                    }
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton
        onClick={() => onChange({ ...pq, otherLiabilities: [...pq.otherLiabilities, emptyLiability()] })}
      >
        Add liability
      </AddRowButton>
    </div>
  );
}

function InsuranceSection({ pq, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-6">
        <CheckRow
          label="Umbrella liability policy in force"
          checked={pq.hasUmbrella}
          onChange={(v) => onChange({ ...pq, hasUmbrella: v })}
        />
        <CheckRow
          label="Long-term care coverage in force"
          checked={pq.hasLtc}
          onChange={(v) => onChange({ ...pq, hasLtc: v })}
        />
      </div>
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Company</Th>
              <Th className="w-36">Type</Th>
              <Th className="w-32">Death / daily</Th>
              <Th className="w-28">Insured</Th>
              <Th className="w-28">Owner</Th>
              <Th className="w-32">Premium</Th>
              <Th className="w-32">Cash value</Th>
              <Th>Beneficiary</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pq.insurance.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.company}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, company: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MiniSelect
                    value={r.type}
                    onChange={(v) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) => (x.id === r.id ? { ...x, type: v } : x)),
                      })
                    }
                    options={[
                      "",
                      "Term life",
                      "Whole life",
                      "UL / IUL",
                      "Disability",
                      "Long-term care",
                      "Homeowners / auto",
                      "Umbrella",
                      "Other",
                    ]}
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.deathBenefit}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, deathBenefit: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.insured}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, insured: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.owner}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, owner: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.annualPremium}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, annualPremium: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.cashValue}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, cashValue: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.beneficiary}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        insurance: pq.insurance.map((x) =>
                          x.id === r.id ? { ...x, beneficiary: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() =>
                      onChange({ ...pq, insurance: pq.insurance.filter((x) => x.id !== r.id) })
                    }
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={() => onChange({ ...pq, insurance: [...pq.insurance, emptyInsurance()] })}>
        Add policy
      </AddRowButton>
    </div>
  );
}

function IncomeSection({ pq, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Income</Th>
              <Th className="w-36">Current</Th>
              <Th className="w-36">At retirement</Th>
              <Th className="w-40">Type</Th>
              <Th className="w-32">Owner</Th>
              <Th>Survivor / COLA</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pq.income.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                <td className="p-1.5">
                  <Input
                    value={r.description}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        income: pq.income.map((x) =>
                          x.id === r.id ? { ...x, description: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.currentAmount}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        income: pq.income.map((x) =>
                          x.id === r.id ? { ...x, currentAmount: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MoneyInput
                    value={r.futureRetirementAmount}
                    onChange={(n) =>
                      onChange({
                        ...pq,
                        income: pq.income.map((x) =>
                          x.id === r.id ? { ...x, futureRetirementAmount: n } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <MiniSelect
                    value={r.type}
                    onChange={(v) =>
                      onChange({
                        ...pq,
                        income: pq.income.map((x) => (x.id === r.id ? { ...x, type: v } : x)),
                      })
                    }
                    options={[
                      "Wages",
                      "Social Security",
                      "Pension",
                      "Rental",
                      "VA",
                      "Annuity",
                      "Business",
                      "Other",
                    ]}
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.owner}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        income: pq.income.map((x) => (x.id === r.id ? { ...x, owner: e.target.value } : x)),
                      })
                    }
                  />
                </td>
                <td className="p-1.5">
                  <Input
                    value={r.survivorCola}
                    onChange={(e) =>
                      onChange({
                        ...pq,
                        income: pq.income.map((x) =>
                          x.id === r.id ? { ...x, survivorCola: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-slate hover:text-rust"
                    onClick={() => onChange({ ...pq, income: pq.income.filter((x) => x.id !== r.id) })}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowButton onClick={() => onChange({ ...pq, income: [...pq.income, emptyIncome()] })}>
        Add income
      </AddRowButton>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyField
          label="Annual expenses"
          value={pq.annualExpenses}
          onChange={(n) => onChange({ ...pq, annualExpenses: n })}
        />
        <Field label="Filing status">
          <MiniSelect
            value={pq.filingStatus}
            onChange={(v) => onChange({ ...pq, filingStatus: v })}
            options={[
              "Married Filing Jointly",
              "Married Filing Separately",
              "Single",
              "Head of Household",
              "Qualifying Widow(er)",
            ]}
          />
        </Field>
        <MoneyField
          label="Taxable income"
          value={pq.taxableIncome}
          onChange={(n) => onChange({ ...pq, taxableIncome: n })}
        />
        <MoneyField
          label="Itemized deductions"
          value={pq.itemizedDed}
          onChange={(n) => onChange({ ...pq, itemizedDed: n })}
        />
        <MoneyField
          label="Federal tax"
          value={pq.federalTax}
          onChange={(n) => onChange({ ...pq, federalTax: n })}
        />
        <MoneyField
          label="State tax"
          value={pq.stateTax}
          onChange={(n) => onChange({ ...pq, stateTax: n })}
        />
        <MoneyField
          label="FICA tax"
          value={pq.ficaTax}
          onChange={(n) => onChange({ ...pq, ficaTax: n })}
        />
        <MoneyField
          label="Cap-loss carryforward"
          value={pq.capLossCarryForward}
          onChange={(n) => onChange({ ...pq, capLossCarryForward: n })}
        />
        <MoneyField
          label="Tax-deferred contributions"
          value={pq.taxDeferredContributions}
          onChange={(n) => onChange({ ...pq, taxDeferredContributions: n })}
        />
      </div>
      <AreaField
        label="Retirement benefit notes"
        value={pq.retirementBenefits}
        onChange={(v) => onChange({ ...pq, retirementBenefits: v })}
      />
    </div>
  );
}

function GoalsSection({ pq, onChange }: Props) {
  const docs = pq.estateDocs;
  const setDoc = (k: keyof typeof docs, v: boolean) =>
    onChange({ ...pq, estateDocs: { ...docs, [k]: v } });
  return (
    <div className="space-y-6">
      <AreaField
        label="Goals"
        rows={5}
        value={pq.goals}
        onChange={(v) => onChange({ ...pq, goals: v })}
        placeholder="What does a great next decade look like?"
      />
      <AreaField
        label="Concerns"
        rows={5}
        value={pq.concerns}
        onChange={(v) => onChange({ ...pq, concerns: v })}
        placeholder="What keeps them up at night?"
      />
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate">
          Estate documents on file
        </p>
        <div className="grid gap-1 sm:grid-cols-2">
          <CheckRow label="Will" checked={docs.will} onChange={(v) => setDoc("will", v)} />
          <CheckRow label="Living trust" checked={docs.trust} onChange={(v) => setDoc("trust", v)} />
          <CheckRow
            label="Financial durable POA"
            checked={docs.financialPoa}
            onChange={(v) => setDoc("financialPoa", v)}
          />
          <CheckRow
            label="Medical POA"
            checked={docs.medicalPoa}
            onChange={(v) => setDoc("medicalPoa", v)}
          />
          <CheckRow label="HIPAA release" checked={docs.hipaa} onChange={(v) => setDoc("hipaa", v)} />
          <CheckRow
            label="Quality of life directive"
            checked={docs.qualityOfLife}
            onChange={(v) => setDoc("qualityOfLife", v)}
          />
        </div>
      </div>
    </div>
  );
}
