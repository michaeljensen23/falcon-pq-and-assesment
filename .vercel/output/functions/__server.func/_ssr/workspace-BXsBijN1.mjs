import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as cn } from "./utils-Pdh8pBxf.mjs";
import { n as FalconWordmark, t as FalconMark } from "./falcon-mark-C0hhzhYm.mjs";
import { a as emptyCash, c as emptyIncome, i as emptyBusiness, l as emptyInsurance, n as emptyAccount, o as emptyChild, p as emptyRealEstate, t as computeTotals, u as emptyLiability } from "./totals-Dlg9CZvQ.mjs";
import { t as Button } from "./button-BRLKHV4M.mjs";
import { i as parseMoney, r as formatMoney, t as ageFromDob } from "./format-DK-owqV6.mjs";
import { i as buildConcerns } from "./concerns-DK2UMXNf.mjs";
import { a as Sparkles, c as Paperclip, d as FileUp, f as FileText, h as Check, i as Trash2, l as Menu, m as ChevronLeft, n as Upload, p as ChevronRight, t as X, u as LoaderCircle } from "../_libs/lucide-react.mjs";
import { _ as safeJsonParse, c as authMiddleware, f as isLikelyUpload, g as requireId, m as mimeFromFilename, o as MAX_NOTES_CHARS } from "./limits-D0iI08tS.mjs";
import { n as overallCompleteness, r as sectionCompleteness, t as SECTIONS } from "./sections-B44NPx6A.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Label, i as Input, n as Dialog$1, r as DialogContent$1, t as Badge } from "./label-DhrC2xFK.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { i as ResponsiveContainer, n as Pie, r as Cell, t as PieChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace-BXsBijN1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-lg bg-cream px-3 py-2 text-sm text-ink shadow-[var(--shadow-border)] placeholder:text-slate/70 focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function asPq(value) {
	if (!value || typeof value !== "object") throw new Error("Invalid questionnaire");
	const json = JSON.stringify(value);
	if (json.length > 4e5) throw new Error("Questionnaire is too large.");
	const parsed = safeJsonParse(json);
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid questionnaire");
	return parsed;
}
var listDocuments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((householdId) => requireId(householdId, "household")).handler(createSsrRpc("fd887fc0e5091afe220c388d894d970ef6f2a46dbd0e077198f10794719b992f"));
var uploadDocument = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Invalid upload");
	const rec = input;
	if (typeof rec.filename !== "string" || typeof rec.contentB64 !== "string") throw new Error("Invalid upload");
	return {
		householdId: requireId(rec.householdId, "household"),
		filename: rec.filename.slice(0, 200),
		contentB64: rec.contentB64
	};
}).handler(createSsrRpc("190b0523ea795e5c90f061319008a046fd936bcb96c080fc3710ebdb49df2658"));
var deleteDocument = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Invalid request");
	const rec = input;
	return {
		householdId: requireId(rec.householdId, "household"),
		id: requireId(rec.id)
	};
}).handler(createSsrRpc("919520206a2321ce72b707fdb5b19d315f2c72e3eec89f80d485ef8380cf963f"));
var saveMeetingNotes = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Invalid notes");
	const rec = input;
	const notes = typeof rec.notes === "string" ? rec.notes.slice(0, MAX_NOTES_CHARS) : "";
	return {
		householdId: requireId(rec.householdId, "household"),
		notes
	};
}).handler(createSsrRpc("41e06188c0c37f2c54345f5812b699d2650503233c5a7ab78c7ffe0d481a7108"));
var fillQuestionnaire = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Invalid request");
	const rec = input;
	const householdId = rec.householdId == null || rec.householdId === "" ? void 0 : requireId(rec.householdId, "household");
	const notes = typeof rec.notes === "string" ? rec.notes.slice(0, MAX_NOTES_CHARS) : "";
	const inlineFiles = Array.isArray(rec.inlineFiles) ? rec.inlineFiles.slice(0, 8) : [];
	return {
		householdId,
		current: asPq(rec.current),
		notes,
		inlineFiles
	};
}).handler(createSsrRpc("d620251a51a3f1add1b16a18caa56c1887b9f0a8c0c36ff97b0f77ee53fd2192"));
/** Blank capture sheet — same labels Grok maps into the 14 PQ sections. */
var NOTES_TEMPLATE = `FALCON WEALTH PLANNING — Discovery meeting notes
Fill what you heard. Write "not discussed" or leave blank. Do not guess.
Money: annual, digits only when you can (250000). If they said monthly, write "3600/month = 43200 annual".
Dates: YYYY-MM-DD. Mortgages stay on the property. Unknown beneficiaries: write "unknown".

------------------------------------------------------------
1. MEETING OPEN
Ask: Who is in the room? Who referred them? Which statements did they bring?

Advisor:
Paraplanner:
Date of 2nd meeting:
Referred by:
In the room:

Documents received (yes/no):
- Federal tax returns (last 2 years):
- Investment / brokerage statements:
- Retirement plan statements (401k / IRA):
- Social Security statements:
- Pension / annuity statements:
- Life & disability insurance policies:
- Long-term care policies:
- Estate documents (will, trust, POAs):
- Mortgage / HELOC statements:
- Pay stubs or K-1s:
Still outstanding:

------------------------------------------------------------
2. FAMILY
Ask: Walk the household — names they use, ages, address, children, grandchildren.

Client first name:
Client nickname:
Client last name:
Client date of birth:
Client marital status:          (Married / Single / Widowed / Divorced / Domestic partner)
Years married:

Spouse first name:
Spouse nickname:
Spouse last name:
Spouse date of birth:

Residence street:
City:
State:
Zip:
Country: USA

Children (name, age):
1)
2)
3)

Total grandchildren:
Grandchildren notes:
Family notes (health, marriage story, who they support, where they want to live):

------------------------------------------------------------
3. OCCUPATION
Ask: Job title, employer (last if retired), years in the role, intended retirement age.

Client job title:
Client employer:
Client years at job:
Client retirement age (actual or planned):

Spouse job title:
Spouse employer:
Spouse years at job:
Spouse retirement age (actual or planned):

------------------------------------------------------------
4. ADVISORS
Ask: Who is the attorney, CPA, insurance agent? Preference (they like them) or commitment (they will not switch)?

Attorney name:
Attorney firm:
Attorney notes:
Attorney preference (yes/no):
Attorney commitment (yes/no):

Accountant name:
Accountant firm:
Accountant notes:
Accountant preference (yes/no):
Accountant commitment (yes/no):

Insurance agent name:
Insurance agent firm:
Insurance agent notes:
Insurance preference (yes/no):
Insurance commitment (yes/no):

Other advisor name:
Other advisor firm:
Other advisor notes:

------------------------------------------------------------
5. REAL ESTATE
Ask: Homes and rentals — value, mortgage, payment, income, year bought, how titled.
Put the mortgage on this property. Do not list it again under Other liabilities.

Property 1:
  Description:                  (e.g. Primary residence — city)
  Market value:
  Liability / mortgage balance:
  Rate / term:
  Payment (monthly, then annual):
  Rental income EBT (annual):
  Year acquired:
  Purchase price:
  Improvements / additions:
  Ownership:                    (Joint / Trust / Client / Spouse / LLC)

Property 2:
  Description:
  Market value:
  Liability / mortgage balance:
  Rate / term:
  Payment:
  Rental income EBT:
  Year acquired:
  Purchase price:
  Improvements / additions:
  Ownership:

------------------------------------------------------------
6. TAX-DEFERRED (IRA / 401k / 403b / pension / annuity)
Ask: Custodian, balance, yearly additions, company match, type, owner, beneficiary, fee.

Types: Traditional IRA | Rollover IRA | 401(k) | 403(b) | 457 | SEP/SIMPLE | Pension | Annuity

Account 1:
  Custodian:
  Market value:
  Annual additions:
  Company match:
  Type:
  Owner:
  Beneficiary:
  Fee %:

Account 2:
  Custodian:
  Market value:
  Annual additions:
  Company match:
  Type:
  Owner:
  Beneficiary:
  Fee %:

Account 3:
  Custodian:
  Market value:
  Annual additions:
  Company match:
  Type:
  Owner:
  Beneficiary:
  Fee %:

------------------------------------------------------------
7. ROTH & AFTER-TAX
Ask: Roth IRA, Roth 401(k), after-tax 401(k), HSA. Note the five-year clock. "None" is a finding.

Types: Roth IRA | Roth 401(k) | After-tax 401(k) | HSA

Account 1:
  Custodian:
  Market value:
  Annual additions:
  Employer contrib / 5-year clock:
  Type:
  Owner:
  Beneficiary:
  Fee %:

If none: write "No Roth accounts" and any backdoor / conversion history.

------------------------------------------------------------
8. BROKERAGE, STOCKS, ETF, NON-QUALIFIED ANNUITY, CRYPTO
Ask: Non-qualified investments — cost basis, owner, beneficiary.

Types: Brokerage | Individual stocks | ETF / mutual fund | Non-qualified annuity | Crypto | Other

Account 1:
  Custodian:
  Market value:
  Annual additions:
  Cost basis:
  Type:
  Owner:
  Beneficiary:
  Fee %:

Account 2:
  Custodian:
  Market value:
  Annual additions:
  Cost basis:
  Type:
  Owner:
  Beneficiary:
  Fee %:

------------------------------------------------------------
9. CASH & CDs
Ask: Emergency reserve, bank, money market, CDs, T-bills. Who owns them.

Account 1:
  Description:
  Market value:
  Interest rate:
  Owner:

Account 2:
  Description:
  Market value:
  Interest rate:
  Owner:

Account 3:
  Description:
  Market value:
  Interest rate:
  Owner:

------------------------------------------------------------
10. BUSINESS & OTHER ASSETS
Ask: Business interests, collectibles, private notes. List business cash here, not under Cash.
If none, write "None".

Asset 1:
  Description:
  Market value:
  Cost basis:
  Owner:

------------------------------------------------------------
11. OTHER LIABILITIES
Ask: Notes, HELOC (if not already on a property), margin, student loans, cars. Not mortgages already listed.
If none, write "None".

Liability 1:
  Description:
  Amount:
  Interest rate:
  Term / payment:

------------------------------------------------------------
12. INSURANCE
Ask: Life, LTC, disability, umbrella, homeowners. Company, benefit, who is insured, premium, cash value, beneficiary.

Types: Term life | Whole life / UL | Disability | Long-term care | Homeowners / auto | Umbrella | Other

Policy 1:
  Company:
  Type:
  Death / daily benefit:
  Insured:
  Owner:
  Policy date:
  Annual premium:
  Cash value:
  Beneficiary:

Policy 2:
  Company:
  Type:
  Death / daily benefit:
  Insured:
  Owner:
  Policy date:
  Annual premium:
  Cash value:
  Beneficiary:

Has umbrella (yes/no):
Has long-term care policy (yes/no):

------------------------------------------------------------
13. INCOME & TAX
Ask: Wages, Social Security, pensions — current and at retirement. Annual spending. Filing status and last return.

Income types: Wages | Social Security | Pension | Rental | VA | Annuity | Business | Other
All amounts ANNUAL.

Income 1:
  Description:
  Current annual amount:
  Amount at retirement:
  Type:
  Start date:
  Owner:
  Survivor / COLA:

Income 2:
  Description:
  Current annual amount:
  Amount at retirement:
  Type:
  Start date:
  Owner:
  Survivor / COLA:

Income 3:
  Description:
  Current annual amount:
  Amount at retirement:
  Type:
  Start date:
  Owner:
  Survivor / COLA:

Annual household expenses:
Filing status:                  (Married Filing Jointly / Married Filing Separately / Single / Head of Household)
Taxable income (last return):
Itemized deductions:
Federal tax:
State tax:
FICA tax:
Capital-loss carryforward:
Tax-deferred contributions this year:
Retirement benefit notes (survivor options, COLA, claiming age):

------------------------------------------------------------
14. GOALS, CONCERNS & ESTATE
Ask: What does a great next decade look like? What keeps them up at night? Which estate docs exist?

Goals:
Concerns:

Estate documents on file (yes/no):
- Will:
- Living trust:
- Financial durable POA:
- Medical POA:
- HIPAA release:
- Quality of life directive:
Year drafted / last reviewed:
`;
`${NOTES_TEMPLATE}`;
function formatSize(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1048576) return `${Math.round(n / 1024)} KB`;
	return `${(n / 1048576).toFixed(1)} MB`;
}
function rpcMessage(err, fallback) {
	if (!(err instanceof Error) || !err.message) return fallback;
	if (err.message === "Unauthorized" || /401/.test(err.message)) return "Please sign in again.";
	if (/Failed to fetch|NetworkError|timeout|AbortError/i.test(err.message)) return "That took too long. Try a smaller file, or paste the figures as notes.";
	return err.message.slice(0, 180);
}
function readAsB64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			const comma = result.indexOf(",");
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("Could not read file"));
		reader.readAsDataURL(file);
	});
}
function IntakePanel({ open, onOpenChange, householdId, pq, onFilled }) {
	const [notes, setNotes] = (0, import_react.useState)("");
	const [files, setFiles] = (0, import_react.useState)([]);
	const [localFiles, setLocalFiles] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [gained, setGained] = (0, import_react.useState)([]);
	const inputRef = (0, import_react.useRef)(null);
	const notesTimer = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open || !householdId) return;
		let cancelled = false;
		setBusy("load");
		listDocuments({ data: householdId }).then((r) => {
			if (cancelled) return;
			if (!r || !Array.isArray(r.files)) {
				setError("Could not load files for this household.");
				return;
			}
			setFiles(r.files);
			setNotes(r.notes ?? "");
			setLocalFiles([]);
		}).catch(() => {
			if (!cancelled) setError("Could not load files for this household.");
		}).finally(() => {
			if (!cancelled) setBusy((b) => b === "load" ? null : b);
		});
		return () => {
			cancelled = true;
		};
	}, [open, householdId]);
	function persistNotes(value) {
		const next = value.slice(0, MAX_NOTES_CHARS);
		setNotes(next);
		if (!householdId) return;
		if (notesTimer.current) clearTimeout(notesTimer.current);
		notesTimer.current = setTimeout(() => {
			saveMeetingNotes({ data: {
				householdId,
				notes: next
			} });
		}, 600);
	}
	async function addFiles(list) {
		setError(null);
		const incoming = Array.from(list);
		if (files.length + localFiles.length + incoming.length > 8) {
			setError(`Up to 8 files per household.`);
			return;
		}
		setBusy("upload");
		try {
			for (const file of incoming) {
				if (!isLikelyUpload(file.name, file.type)) {
					setError("Use PDF, image, text, CSV, or Excel (.xlsx).");
					continue;
				}
				if (file.size > 3145728) {
					setError(`${file.name} is over 3 MB. Split it or paste the notes.`);
					continue;
				}
				const contentB64 = await readAsB64(file);
				if (householdId) {
					const res = await uploadDocument({ data: {
						householdId,
						filename: file.name,
						contentB64
					} });
					if (!res || typeof res !== "object" || !("ok" in res) || !res.ok) {
						setError(res && typeof res === "object" && "error" in res && typeof res.error === "string" ? res.error : "Upload failed. Try PDF, image, text, or Excel.");
						continue;
					}
					setFiles((prev) => [res.file, ...prev]);
				} else setLocalFiles((prev) => [{
					id: `local-${file.name}-${file.size}`,
					filename: file.name,
					mimeType: file.type || mimeFromFilename(file.name),
					sizeBytes: file.size,
					contentB64
				}, ...prev]);
			}
		} catch (err) {
			setError(rpcMessage(err, "Upload failed."));
		} finally {
			setBusy(null);
		}
	}
	async function remove(id, local) {
		if (local) {
			setLocalFiles((prev) => prev.filter((f) => f.id !== id));
			return;
		}
		if (!householdId) return;
		await deleteDocument({ data: {
			householdId,
			id
		} });
		setFiles((prev) => prev.filter((f) => f.id !== id));
	}
	async function fill() {
		setError(null);
		setSummary(null);
		setGained([]);
		setBusy("fill");
		try {
			const res = await fillQuestionnaire({ data: {
				householdId,
				current: pq,
				notes,
				inlineFiles: householdId ? void 0 : localFiles.map((f) => ({
					filename: f.filename,
					mimeType: f.mimeType,
					contentB64: f.contentB64
				}))
			} });
			if (!res || typeof res !== "object" || !("ok" in res)) {
				setError("Fill did not finish. Try again, or paste the figures as notes.");
				return;
			}
			if (!res.ok) {
				setError(res.error || "Could not fill the questionnaire.");
				return;
			}
			onFilled(res.pq);
			setGained(res.filledSections);
			setSummary(res.summary || "Questionnaire updated. Review the 14 sections, then generate the assessment.");
		} catch (err) {
			setError(rpcMessage(err, "Could not fill the questionnaire."));
		} finally {
			setBusy(null);
		}
	}
	const allFiles = [...files.map((f) => ({
		...f,
		local: false
	})), ...localFiles.map((f) => ({
		id: f.id,
		filename: f.filename,
		mimeType: f.mimeType,
		sizeBytes: f.sizeBytes,
		kind: "file",
		createdAt: "",
		local: true
	}))];
	const canFill = Boolean(notes.trim() || allFiles.length);
	const filling = busy === "fill";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
			title: "Files & meeting notes",
			className: "flex max-h-dvh w-full max-w-xl flex-col overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-slate",
					children: "Upload statements, the PQ workbook, or paste notes from the room. Labeled balance sheets fill immediately. Photos and free-form notes still go through Grok. You review the 14 sections, then generate the assessment."
				}),
				!householdId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-slate",
					children: "Sample file — uploads stay in this session only. Open a household from the book to keep documents with the client."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-slate",
					children: "Documents stay on this household. Only signed-in @falconwp.com advisors can open them."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-slate",
							children: "Meeting notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-x-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-navy underline-offset-2 hover:underline disabled:text-slate disabled:no-underline",
									disabled: filling,
									onClick: () => {
										if (notes.trim()) {
											setError("Notes already have text. Download the blank template instead, or clear this box first.");
											return;
										}
										setError(null);
										persistNotes(NOTES_TEMPLATE);
									},
									children: "Insert template"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/falcon-meeting-notes-template.txt",
									download: "Falcon-discovery-meeting-notes.txt",
									className: "text-navy underline-offset-2 hover:underline",
									children: "Download template"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/falcon-meeting-script-prompt.txt",
									download: "Falcon-meeting-script-prompt.txt",
									className: "text-navy underline-offset-2 hover:underline",
									children: "Script prompt"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: notes,
						onChange: (e) => persistNotes(e.target.value),
						rows: 6,
						maxLength: MAX_NOTES_CHARS,
						placeholder: "Insert the template, or paste the filled notes from the meeting script…",
						disabled: filling
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs font-medium uppercase tracking-wider text-slate",
							children: "Documents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							type: "file",
							className: "sr-only",
							multiple: true,
							accept: ".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json,.xlsx,application/pdf,image/png,image/jpeg,image/webp,image/gif",
							onChange: (e) => {
								if (e.target.files?.length) addFiles(e.target.files);
								e.target.value = "";
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => inputRef.current?.click(),
							disabled: busy === "upload" || filling,
							onDragOver: (e) => {
								e.preventDefault();
							},
							onDrop: (e) => {
								e.preventDefault();
								if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
							},
							className: "flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl bg-paper px-4 py-6 text-center shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5 text-navy" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-navy",
									children: "Drop PDFs, Excel, or images"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-slate",
									children: [
										"Up to ",
										8,
										" files · 3 MB each"
									]
								})
							]
						}),
						allFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 divide-y divide-border rounded-lg bg-paper-2",
							children: allFiles.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex min-h-11 items-center gap-3 px-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4 shrink-0 text-slate" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm text-navy",
											children: f.filename
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-slate",
											children: formatSize(f.sizeBytes)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "grid size-10 place-items-center text-slate hover:text-rust",
										onClick: () => void remove(f.id, f.local),
										"aria-label": `Remove ${f.filename}`,
										disabled: filling,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})
								]
							}, f.id))
						}) : null
					]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-rust",
					children: error
				}) : null,
				summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-lg bg-paper p-4 text-sm text-navy shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-brass-dim",
							children: "Filled from sources"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 whitespace-pre-wrap",
							children: summary
						}),
						gained.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-1.5",
							children: gained.map((id) => {
								const label = SECTIONS.find((s) => s.id === id)?.short ?? id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "sage",
									children: label
								}, id);
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-slate",
							children: "No new fields detected — the notes may already match what is in the file."
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => onOpenChange(false),
						disabled: filling,
						children: "Close"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => void fill(),
						disabled: !canFill || Boolean(busy),
						children: [filling ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), filling ? "Reading sources…" : "Fill 14 sections"]
					})]
				})
			]
		})
	});
}
function IntakeLaunch({ onClick, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		onClick,
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: "Files"
		})]
	});
}
function IntakeCard({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex w-full items-start gap-3 rounded-xl bg-cream p-4 text-left shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-10 shrink-0 place-items-center rounded-md bg-navy text-cream",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-medium text-navy",
			children: "Fill from documents"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block text-sm text-slate",
			children: "Drop statements or paste notes. Grok drafts the questionnaire — you still review every section before the assessment."
		})] })]
	});
}
function Checkbox({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
		className: cn("grid size-4 shrink-0 place-items-center rounded-xs bg-cream shadow-[var(--shadow-border)] data-[state=checked]:bg-navy data-[state=checked]:text-cream", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-3",
			strokeWidth: 3
		}) })
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("flex min-w-0 flex-col gap-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "uppercase tracking-[0.14em]",
			children: label
		}), children]
	});
}
function TextField({ label, value, onChange, placeholder, className, type = "text" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type,
			value,
			placeholder,
			onChange: (e) => onChange(e.target.value)
		})
	});
}
function AreaField({ label, value, onChange, placeholder, rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			rows,
			value,
			placeholder,
			onChange: (e) => onChange(e.target.value)
		})
	});
}
function MoneyInput({ value, onChange, className, placeholder = "0" }) {
	const [focused, setFocused] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)(value ? String(value) : "");
	(0, import_react.useEffect)(() => {
		if (!focused) setText(value ? String(value) : "");
	}, [value, focused]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		inputMode: "decimal",
		className: cn("tabular text-right", className),
		value: focused ? text : value ? formatMoney(value) : "",
		placeholder,
		onFocus: () => {
			setFocused(true);
			setText(value ? String(value) : "");
		},
		onBlur: () => {
			setFocused(false);
			onChange(parseMoney(text));
		},
		onChange: (e) => {
			setText(e.target.value);
			onChange(parseMoney(e.target.value));
		}
	});
}
function MoneyField({ label, value, onChange, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
			value,
			onChange
		})
	});
}
function CheckRow({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 hover:bg-paper-2/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
			checked,
			onCheckedChange: (v) => onChange(Boolean(v))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-ink",
			children: label
		})]
	});
}
function MiniSelect({ value, onChange, options, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		className: cn("h-10 w-full rounded-md bg-cream px-2 text-sm text-ink shadow-[var(--shadow-border)]", className),
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: o,
			children: o || "—"
		}, o))
	});
}
function AddRowButton({ onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "mt-2 text-sm font-medium text-navy-mid underline-offset-4 hover:underline",
		children
	});
}
function SectionBody({ id, pq, onChange, onOpenIntake }) {
	switch (id) {
		case "opening": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpeningSection, {
			pq,
			onChange,
			onOpenIntake
		});
		case "family": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilySection, {
			pq,
			onChange
		});
		case "occupation": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OccupationSection, {
			pq,
			onChange
		});
		case "advisors": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisorsSection, {
			pq,
			onChange
		});
		case "real-estate": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RealEstateSection, {
			pq,
			onChange
		});
		case "deferred": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountsSection, {
			pq,
			onChange,
			keyName: "deferred",
			extraLabel: "Company match",
			types: [
				"Traditional IRA",
				"Rollover IRA",
				"401(k)",
				"403(b)",
				"457",
				"SEP/SIMPLE",
				"Pension",
				"Annuity"
			]
		});
		case "roth": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountsSection, {
			pq,
			onChange,
			keyName: "roth",
			extraLabel: "ER contrib / 5 years?",
			types: [
				"Roth IRA",
				"Roth 401(k)",
				"After-tax 401(k)",
				"HSA"
			],
			emptyNote: "No Roth on the books is itself a finding — mark the section complete and keep moving."
		});
		case "investments": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountsSection, {
			pq,
			onChange,
			keyName: "investments",
			extraLabel: "Cost basis",
			types: [
				"Brokerage",
				"Individual stocks",
				"ETF / mutual fund",
				"Non-qualified annuity",
				"Crypto",
				"Other"
			]
		});
		case "cash": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashSection, {
			pq,
			onChange
		});
		case "business": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusinessSection, {
			pq,
			onChange
		});
		case "liabilities": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiabilitiesSection, {
			pq,
			onChange
		});
		case "insurance": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsuranceSection, {
			pq,
			onChange
		});
		case "income": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomeSection, {
			pq,
			onChange
		});
		case "goals": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalsSection, {
			pq,
			onChange
		});
	}
}
function OpeningSection({ pq, onChange, onOpenIntake }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			onOpenIntake ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakeCard, { onClick: onOpenIntake }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Advisor",
						value: pq.advisor,
						onChange: (v) => onChange({
							...pq,
							advisor: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Paraplanner",
						value: pq.paraPlanner,
						onChange: (v) => onChange({
							...pq,
							paraPlanner: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Date of 2nd meeting",
						type: "date",
						value: pq.dateOfSecondMeeting,
						onChange: (v) => onChange({
							...pq,
							dateOfSecondMeeting: v
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
				label: "Referred by",
				value: pq.referredBy,
				onChange: (v) => onChange({
					...pq,
					referredBy: v
				}),
				placeholder: "Client name or source"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate",
				children: "Requested documents"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border rounded-lg bg-cream shadow-[var(--shadow-border)]",
				children: pq.requestedDocuments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-3 px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: d.received,
						onChange: (e) => onChange({
							...pq,
							requestedDocuments: pq.requestedDocuments.map((x) => x.id === d.id ? {
								...x,
								received: e.target.checked
							} : x)
						}),
						className: "size-4 accent-navy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-sm", d.received && "text-slate line-through"),
						children: d.name
					})]
				}, d.id))
			})] })
		]
	});
}
function FamilySection({ pq, onChange }) {
	const cAge = ageFromDob(pq.client.dob);
	const sAge = ageFromDob(pq.spouse.dob);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 font-display text-lg text-navy",
				children: "Client"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "First name",
						value: pq.client.firstName,
						onChange: (v) => onChange({
							...pq,
							client: {
								...pq.client,
								firstName: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Nickname",
						value: pq.client.nickname,
						onChange: (v) => onChange({
							...pq,
							client: {
								...pq.client,
								nickname: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Last name",
						value: pq.client.lastName,
						onChange: (v) => onChange({
							...pq,
							client: {
								...pq.client,
								lastName: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Marital status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSelect, {
							value: pq.client.maritalStatus,
							onChange: (v) => onChange({
								...pq,
								client: {
									...pq.client,
									maritalStatus: v
								}
							}),
							options: [
								"",
								"Married",
								"Single",
								"Widowed",
								"Divorced",
								"Domestic partner"
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Date of birth",
						type: "date",
						value: pq.client.dob,
						onChange: (v) => onChange({
							...pq,
							client: {
								...pq.client,
								dob: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Age",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-10 items-center rounded-md bg-paper-2 px-3 text-sm tabular text-navy",
							children: cAge ?? "—"
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 font-display text-lg text-navy",
				children: "Spouse"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "First name",
						value: pq.spouse.firstName,
						onChange: (v) => onChange({
							...pq,
							spouse: {
								...pq.spouse,
								firstName: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Nickname",
						value: pq.spouse.nickname,
						onChange: (v) => onChange({
							...pq,
							spouse: {
								...pq.spouse,
								nickname: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Last name",
						value: pq.spouse.lastName,
						onChange: (v) => onChange({
							...pq,
							spouse: {
								...pq.spouse,
								lastName: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Years married",
						value: pq.spouse.yearsMarried,
						onChange: (v) => onChange({
							...pq,
							spouse: {
								...pq.spouse,
								yearsMarried: v
							},
							client: {
								...pq.client,
								yearsMarried: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Date of birth",
						type: "date",
						value: pq.spouse.dob,
						onChange: (v) => onChange({
							...pq,
							spouse: {
								...pq.spouse,
								dob: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Age",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-10 items-center rounded-md bg-paper-2 px-3 text-sm tabular text-navy",
							children: sAge ?? "—"
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						className: "lg:col-span-2",
						label: "Residence",
						value: pq.address.street,
						onChange: (v) => onChange({
							...pq,
							address: {
								...pq.address,
								street: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "City",
						value: pq.address.city,
						onChange: (v) => onChange({
							...pq,
							address: {
								...pq.address,
								city: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "State",
						value: pq.address.state,
						onChange: (v) => onChange({
							...pq,
							address: {
								...pq.address,
								state: v
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Zip",
						value: pq.address.zip,
						onChange: (v) => onChange({
							...pq,
							address: {
								...pq.address,
								zip: v
							}
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate",
					children: "Children"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: pq.children.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_6rem_auto] gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Name",
								value: ch.name,
								onChange: (e) => onChange({
									...pq,
									children: pq.children.map((x) => x.id === ch.id ? {
										...x,
										name: e.target.value
									} : x)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Age",
								value: ch.age,
								onChange: (e) => onChange({
									...pq,
									children: pq.children.map((x) => x.id === ch.id ? {
										...x,
										age: e.target.value
									} : x)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center text-slate hover:text-rust",
								onClick: () => onChange({
									...pq,
									children: pq.children.filter((x) => x.id !== ch.id)
								}),
								"aria-label": "Remove child",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, ch.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
					onClick: () => onChange({
						...pq,
						children: [...pq.children, emptyChild()]
					}),
					children: "Add child"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Total grandchildren",
						value: pq.grandchildrenCount,
						onChange: (v) => onChange({
							...pq,
							grandchildrenCount: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaField, {
						label: "Family notes",
						value: pq.familyNotes,
						onChange: (v) => onChange({
							...pq,
							familyNotes: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaField, {
						label: "Grandchildren notes",
						value: pq.grandchildrenNotes,
						onChange: (v) => onChange({
							...pq,
							grandchildrenNotes: v
						})
					})
				]
			})
		]
	});
}
function OccupationSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 font-display text-lg text-navy",
			children: pq.client.firstName || "Client"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Job title",
					value: pq.client.jobTitle,
					onChange: (v) => onChange({
						...pq,
						client: {
							...pq.client,
							jobTitle: v
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Employer (last, if retired)",
					value: pq.client.employer,
					onChange: (v) => onChange({
						...pq,
						client: {
							...pq.client,
							employer: v
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "# of years",
					value: pq.client.yearsAtJob,
					onChange: (v) => onChange({
						...pq,
						client: {
							...pq.client,
							yearsAtJob: v
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Retirement age",
					value: pq.client.retirementAge,
					onChange: (v) => onChange({
						...pq,
						client: {
							...pq.client,
							retirementAge: v
						}
					})
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 font-display text-lg text-navy",
			children: pq.spouse.firstName || "Spouse"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Job title",
					value: pq.spouse.jobTitle,
					onChange: (v) => onChange({
						...pq,
						spouse: {
							...pq.spouse,
							jobTitle: v
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Employer (last, if retired)",
					value: pq.spouse.employer,
					onChange: (v) => onChange({
						...pq,
						spouse: {
							...pq.spouse,
							employer: v
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "# of years",
					value: pq.spouse.yearsAtJob,
					onChange: (v) => onChange({
						...pq,
						spouse: {
							...pq.spouse,
							yearsAtJob: v
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Retirement age",
					value: pq.spouse.retirementAge,
					onChange: (v) => onChange({
						...pq,
						spouse: {
							...pq.spouse,
							retirementAge: v
						}
					})
				})
			]
		})] })]
	});
}
function AdvisorCard({ title, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 rounded-lg bg-cream p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg text-navy",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
				label: "Name",
				value: value.name,
				onChange: (v) => onChange({
					...value,
					name: v
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
				label: "Firm",
				value: value.firm,
				onChange: (v) => onChange({
					...value,
					firm: v
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
				label: "Notes",
				value: value.notes,
				onChange: (v) => onChange({
					...value,
					notes: v
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
					label: "Preference",
					checked: value.preference,
					onChange: (v) => onChange({
						...value,
						preference: v
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
					label: "Commitment",
					checked: value.commitment,
					onChange: (v) => onChange({
						...value,
						commitment: v
					})
				})]
			})
		]
	});
}
function AdvisorsSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisorCard, {
				title: "Attorney",
				value: pq.advisors.attorney,
				onChange: (v) => onChange({
					...pq,
					advisors: {
						...pq.advisors,
						attorney: v
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisorCard, {
				title: "Accountant",
				value: pq.advisors.accountant,
				onChange: (v) => onChange({
					...pq,
					advisors: {
						...pq.advisors,
						accountant: v
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisorCard, {
				title: "Insurance agent",
				value: pq.advisors.insurance,
				onChange: (v) => onChange({
					...pq,
					advisors: {
						...pq.advisors,
						insurance: v
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisorCard, {
				title: "Other advisor",
				value: pq.advisors.other,
				onChange: (v) => onChange({
					...pq,
					advisors: {
						...pq.advisors,
						other: v
					}
				})
			})
		]
	});
}
function Th({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-slate", className),
		children
	});
}
function RealEstateSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[980px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Description" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-32",
						children: "Market value"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-32",
						children: "Liability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-28",
						children: "Rate / term"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-28",
						children: "PMT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-28",
						children: "Income EBT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-24",
						children: "Year"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-28",
						children: "Ownership"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pq.realEstate.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.description,
							placeholder: "Primary residence",
							onChange: (e) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									description: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
							value: r.marketValue,
							onChange: (n) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									marketValue: n
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
							value: r.liabilityAmount,
							onChange: (n) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									liabilityAmount: n
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.rateTerm,
							onChange: (e) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									rateTerm: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
							value: r.payment,
							onChange: (n) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									payment: n
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
							value: r.incomeEbt,
							onChange: (n) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									incomeEbt: n
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.acquisitionYear,
							onChange: (e) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									acquisitionYear: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.ownership,
							onChange: (e) => onChange({
								...pq,
								realEstate: pq.realEstate.map((x) => x.id === r.id ? {
									...x,
									ownership: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-10 place-items-center text-slate hover:text-rust",
						onClick: () => onChange({
							...pq,
							realEstate: pq.realEstate.filter((x) => x.id !== r.id)
						}),
						"aria-label": "Remove property",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					}) })
				]
			}, r.id)) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
		onClick: () => onChange({
			...pq,
			realEstate: [...pq.realEstate, emptyRealEstate()]
		}),
		children: "Add property"
	})] });
}
function AccountsSection({ pq, onChange, keyName, extraLabel, types, emptyNote }) {
	const rows = pq[keyName];
	const setRows = (next) => onChange({
		...pq,
		[keyName]: next
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		emptyNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-slate",
			children: emptyNote
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[1080px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Custodian" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-32",
							children: "Market value"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-28",
							children: "Additions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-32",
							children: extraLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-36",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-28",
							children: "Owner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Beneficiary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-20",
							children: "Fee %"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: r.custodian,
								onChange: (e) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									custodian: e.target.value
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
								value: r.marketValue,
								onChange: (n) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									marketValue: n
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
								value: r.additions,
								onChange: (n) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									additions: n
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
								value: r.extra,
								onChange: (n) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									extra: n
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSelect, {
								value: r.type,
								onChange: (v) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									type: v
								} : x)),
								options: ["", ...types]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: r.ownership,
								onChange: (e) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									ownership: e.target.value
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: r.beneficiary,
								onChange: (e) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									beneficiary: e.target.value
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "tabular text-right",
								value: r.feePct ? String(r.feePct) : "",
								onChange: (e) => setRows(rows.map((x) => x.id === r.id ? {
									...x,
									feePct: Number(e.target.value) || 0
								} : x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-10 place-items-center text-slate hover:text-rust",
							onClick: () => setRows(rows.filter((x) => x.id !== r.id)),
							"aria-label": "Remove account",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						}) })
					]
				}, r.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
			onClick: () => setRows([...rows, emptyAccount(extraLabel)]),
			children: "Add account"
		})
	] });
}
function CashSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Description" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-36",
						children: "Market value"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-28",
						children: "Int. rate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-32",
						children: "Owner"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pq.cash.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.description,
							onChange: (e) => onChange({
								...pq,
								cash: pq.cash.map((x) => x.id === r.id ? {
									...x,
									description: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
							value: r.marketValue,
							onChange: (n) => onChange({
								...pq,
								cash: pq.cash.map((x) => x.id === r.id ? {
									...x,
									marketValue: n
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.intRate,
							onChange: (e) => onChange({
								...pq,
								cash: pq.cash.map((x) => x.id === r.id ? {
									...x,
									intRate: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.owner,
							onChange: (e) => onChange({
								...pq,
								cash: pq.cash.map((x) => x.id === r.id ? {
									...x,
									owner: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-10 place-items-center text-slate hover:text-rust",
						onClick: () => onChange({
							...pq,
							cash: pq.cash.filter((x) => x.id !== r.id)
						}),
						"aria-label": "Remove cash row",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					}) })
				]
			}, r.id)) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
		onClick: () => onChange({
			...pq,
			cash: [...pq.cash, emptyCash()]
		}),
		children: "Add cash / CD"
	})] });
}
function BusinessSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-slate",
			children: "List any cash held inside the business as business cash."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[640px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Description" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-36",
							children: "Market value"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-36",
							children: "Cost basis"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "w-32",
							children: "Owner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pq.business.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: r.description,
								onChange: (e) => onChange({
									...pq,
									business: pq.business.map((x) => x.id === r.id ? {
										...x,
										description: e.target.value
									} : x)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
								value: r.marketValue,
								onChange: (n) => onChange({
									...pq,
									business: pq.business.map((x) => x.id === r.id ? {
										...x,
										marketValue: n
									} : x)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
								value: r.costBasis,
								onChange: (n) => onChange({
									...pq,
									business: pq.business.map((x) => x.id === r.id ? {
										...x,
										costBasis: n
									} : x)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: r.owner,
								onChange: (e) => onChange({
									...pq,
									business: pq.business.map((x) => x.id === r.id ? {
										...x,
										owner: e.target.value
									} : x)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-10 place-items-center text-slate hover:text-rust",
							onClick: () => onChange({
								...pq,
								business: pq.business.filter((x) => x.id !== r.id)
							}),
							"aria-label": "Remove",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						}) })
					]
				}, r.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
			onClick: () => onChange({
				...pq,
				business: [...pq.business, emptyBusiness()]
			}),
			children: "Add business / other asset"
		})
	] });
}
function LiabilitiesSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Description" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-36",
						children: "Amount"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-28",
						children: "Int. rate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "w-36",
						children: "Term / PMT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pq.otherLiabilities.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.description,
							onChange: (e) => onChange({
								...pq,
								otherLiabilities: pq.otherLiabilities.map((x) => x.id === r.id ? {
									...x,
									description: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
							value: r.amount,
							onChange: (n) => onChange({
								...pq,
								otherLiabilities: pq.otherLiabilities.map((x) => x.id === r.id ? {
									...x,
									amount: n
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.intRate,
							onChange: (e) => onChange({
								...pq,
								otherLiabilities: pq.otherLiabilities.map((x) => x.id === r.id ? {
									...x,
									intRate: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.termPmt,
							onChange: (e) => onChange({
								...pq,
								otherLiabilities: pq.otherLiabilities.map((x) => x.id === r.id ? {
									...x,
									termPmt: e.target.value
								} : x)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-10 place-items-center text-slate hover:text-rust",
						onClick: () => onChange({
							...pq,
							otherLiabilities: pq.otherLiabilities.filter((x) => x.id !== r.id)
						}),
						"aria-label": "Remove",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					}) })
				]
			}, r.id)) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
		onClick: () => onChange({
			...pq,
			otherLiabilities: [...pq.otherLiabilities, emptyLiability()]
		}),
		children: "Add liability"
	})] });
}
function InsuranceSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
					label: "Umbrella liability policy in force",
					checked: pq.hasUmbrella,
					onChange: (v) => onChange({
						...pq,
						hasUmbrella: v
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
					label: "Long-term care coverage in force",
					checked: pq.hasLtc,
					onChange: (v) => onChange({
						...pq,
						hasLtc: v
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[1100px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Company" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-36",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-32",
								children: "Death / daily"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-28",
								children: "Insured"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-28",
								children: "Owner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-32",
								children: "Premium"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-32",
								children: "Cash value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Beneficiary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pq.insurance.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/70",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.company,
									onChange: (e) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											company: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSelect, {
									value: r.type,
									onChange: (v) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											type: v
										} : x)
									}),
									options: [
										"",
										"Term life",
										"Whole life",
										"UL / IUL",
										"Disability",
										"Long-term care",
										"Homeowners / auto",
										"Umbrella",
										"Other"
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
									value: r.deathBenefit,
									onChange: (n) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											deathBenefit: n
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.insured,
									onChange: (e) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											insured: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.owner,
									onChange: (e) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											owner: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
									value: r.annualPremium,
									onChange: (n) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											annualPremium: n
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
									value: r.cashValue,
									onChange: (n) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											cashValue: n
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.beneficiary,
									onChange: (e) => onChange({
										...pq,
										insurance: pq.insurance.map((x) => x.id === r.id ? {
											...x,
											beneficiary: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center text-slate hover:text-rust",
								onClick: () => onChange({
									...pq,
									insurance: pq.insurance.filter((x) => x.id !== r.id)
								}),
								"aria-label": "Remove",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}) })
						]
					}, r.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
				onClick: () => onChange({
					...pq,
					insurance: [...pq.insurance, emptyInsurance()]
				}),
				children: "Add policy"
			})
		]
	});
}
function IncomeSection({ pq, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-cream shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[980px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Income" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-36",
								children: "Current"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-36",
								children: "At retirement"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-40",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "w-32",
								children: "Owner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Survivor / COLA" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-10" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pq.income.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/70",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.description,
									onChange: (e) => onChange({
										...pq,
										income: pq.income.map((x) => x.id === r.id ? {
											...x,
											description: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
									value: r.currentAmount,
									onChange: (n) => onChange({
										...pq,
										income: pq.income.map((x) => x.id === r.id ? {
											...x,
											currentAmount: n
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyInput, {
									value: r.futureRetirementAmount,
									onChange: (n) => onChange({
										...pq,
										income: pq.income.map((x) => x.id === r.id ? {
											...x,
											futureRetirementAmount: n
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSelect, {
									value: r.type,
									onChange: (v) => onChange({
										...pq,
										income: pq.income.map((x) => x.id === r.id ? {
											...x,
											type: v
										} : x)
									}),
									options: [
										"Wages",
										"Social Security",
										"Pension",
										"Rental",
										"VA",
										"Annuity",
										"Business",
										"Other"
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.owner,
									onChange: (e) => onChange({
										...pq,
										income: pq.income.map((x) => x.id === r.id ? {
											...x,
											owner: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: r.survivorCola,
									onChange: (e) => onChange({
										...pq,
										income: pq.income.map((x) => x.id === r.id ? {
											...x,
											survivorCola: e.target.value
										} : x)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center text-slate hover:text-rust",
								onClick: () => onChange({
									...pq,
									income: pq.income.filter((x) => x.id !== r.id)
								}),
								"aria-label": "Remove",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}) })
						]
					}, r.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRowButton, {
				onClick: () => onChange({
					...pq,
					income: [...pq.income, emptyIncome()]
				}),
				children: "Add income"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "Annual expenses",
						value: pq.annualExpenses,
						onChange: (n) => onChange({
							...pq,
							annualExpenses: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Filing status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSelect, {
							value: pq.filingStatus,
							onChange: (v) => onChange({
								...pq,
								filingStatus: v
							}),
							options: [
								"Married Filing Jointly",
								"Married Filing Separately",
								"Single",
								"Head of Household",
								"Qualifying Widow(er)"
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "Taxable income",
						value: pq.taxableIncome,
						onChange: (n) => onChange({
							...pq,
							taxableIncome: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "Itemized deductions",
						value: pq.itemizedDed,
						onChange: (n) => onChange({
							...pq,
							itemizedDed: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "Federal tax",
						value: pq.federalTax,
						onChange: (n) => onChange({
							...pq,
							federalTax: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "State tax",
						value: pq.stateTax,
						onChange: (n) => onChange({
							...pq,
							stateTax: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "FICA tax",
						value: pq.ficaTax,
						onChange: (n) => onChange({
							...pq,
							ficaTax: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "Cap-loss carryforward",
						value: pq.capLossCarryForward,
						onChange: (n) => onChange({
							...pq,
							capLossCarryForward: n
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: "Tax-deferred contributions",
						value: pq.taxDeferredContributions,
						onChange: (n) => onChange({
							...pq,
							taxDeferredContributions: n
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaField, {
				label: "Retirement benefit notes",
				value: pq.retirementBenefits,
				onChange: (v) => onChange({
					...pq,
					retirementBenefits: v
				})
			})
		]
	});
}
function GoalsSection({ pq, onChange }) {
	const docs = pq.estateDocs;
	const setDoc = (k, v) => onChange({
		...pq,
		estateDocs: {
			...docs,
			[k]: v
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaField, {
				label: "Goals",
				rows: 5,
				value: pq.goals,
				onChange: (v) => onChange({
					...pq,
					goals: v
				}),
				placeholder: "What does a great next decade look like?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaField, {
				label: "Concerns",
				rows: 5,
				value: pq.concerns,
				onChange: (v) => onChange({
					...pq,
					concerns: v
				}),
				placeholder: "What keeps them up at night?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate",
				children: "Estate documents on file"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
						label: "Will",
						checked: docs.will,
						onChange: (v) => setDoc("will", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
						label: "Living trust",
						checked: docs.trust,
						onChange: (v) => setDoc("trust", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
						label: "Financial durable POA",
						checked: docs.financialPoa,
						onChange: (v) => setDoc("financialPoa", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
						label: "Medical POA",
						checked: docs.medicalPoa,
						onChange: (v) => setDoc("medicalPoa", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
						label: "HIPAA release",
						checked: docs.hipaa,
						onChange: (v) => setDoc("hipaa", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
						label: "Quality of life directive",
						checked: docs.qualityOfLife,
						onChange: (v) => setDoc("qualityOfLife", v)
					})
				]
			})] })
		]
	});
}
var COLORS = {
	cash: "#8d7038",
	deferred: "#1c3a56",
	taxable: "#2f5574",
	roth: "#3d6b56",
	other: "#5c6b7a"
};
function SnapshotStrip({ totals }) {
	const items = [
		{
			label: "Investable",
			value: totals.totalAssetsExRE
		},
		{
			label: totals.shortage < 0 ? "Gap" : "Surplus",
			value: totals.shortage,
			alert: totals.shortage < 0
		},
		{
			label: "Cash",
			value: totals.cash
		},
		{
			label: "Deferred",
			value: totals.deferred
		},
		{
			label: "Roth",
			value: totals.roth
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-print sticky top-14 z-20 flex gap-5 overflow-x-auto border-b border-white/10 bg-navy px-4 py-2.5 md:hidden",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.16em] text-mist/70",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("tabular text-sm font-medium", item.alert ? "text-brass" : "text-cream"),
				children: formatMoney(item.value, { compact: true })
			})]
		}, item.label))
	});
}
function SnapshotRail({ pq, totals }) {
	const slices = [
		{
			name: "Cash",
			value: totals.cash,
			color: COLORS.cash
		},
		{
			name: "Tax-deferred",
			value: totals.deferred,
			color: COLORS.deferred
		},
		{
			name: "Taxable",
			value: totals.investments,
			color: COLORS.taxable
		},
		{
			name: "Roth",
			value: totals.roth,
			color: COLORS.roth
		},
		{
			name: "Business",
			value: totals.business,
			color: COLORS.other
		}
	].filter((s) => s.value > 0);
	const concerns = buildConcerns(pq, totals).filter((c) => c.severity === "high");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-navy p-4 text-cream",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-mist/80",
						children: "Investable (ex-RE)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-3xl tabular tracking-tight",
						children: formatMoney(totals.totalAssetsExRE)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-mist/80",
						children: [
							"Net worth ",
							formatMoney(totals.netWorth),
							totals.realEstate ? ` · RE ${formatMoney(totals.realEstate)}` : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-slate",
					children: "Tax location"
				}), slices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 mb-4 text-sm text-slate",
					children: "Add accounts and the mix appears here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-28 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieChart, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
						data: slices,
						dataKey: "value",
						nameKey: "name",
						innerRadius: 34,
						outerRadius: 52,
						paddingAngle: 2,
						stroke: "none",
						children: slices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: s.color }, s.name))
					}) }) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5 text-xs",
					children: slices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 text-slate",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2 rounded-full",
								style: { background: s.color }
							}), s.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular text-navy",
							children: formatMoney(s.value, { compact: true })
						})]
					}, s.name))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-slate",
						children: "Retirement paycheck"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Guaranteed",
						value: totals.guaranteedRetirement
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Expenses",
						value: totals.expenses
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between border-t border-border pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-slate",
							children: totals.shortage < 0 ? "Shortage" : "Surplus"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("tabular text-sm font-medium", totals.shortage < 0 ? "text-rust" : "text-sage"),
							children: formatMoney(totals.shortage)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["SS ", formatMoney(totals.socialSecurity, { compact: true })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Pension ", formatMoney(totals.pension, { compact: true })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Rental ", formatMoney(totals.rental, { compact: true })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["VA ", formatMoney(totals.va, { compact: true })] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-slate",
						children: "Today’s cash flow"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Income",
						value: totals.incomeCurrent
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Taxes",
						value: totals.totalTax
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Savings",
						value: totals.totalSavings
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between border-t border-border pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-slate",
							children: "Net +/-"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("tabular text-sm font-medium", totals.cashFlow < 0 ? "text-rust" : "text-sage"),
							children: formatMoney(totals.cashFlow)
						})]
					})
				]
			}),
			concerns.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-cream p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-slate",
					children: "High-priority findings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: concerns.slice(0, 4).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-navy",
						children: c.title
					}, c.id))
				})]
			}) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-slate",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "tabular text-sm text-navy",
			children: formatMoney(value)
		})]
	});
}
var Sheet = Dialog;
function SheetContent({ className, children, side = "left" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-navy-deep/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed inset-y-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-navy text-cream shadow-[var(--shadow-border)]", side === "left" ? "left-0" : "right-0", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "sr-only",
				children: "Menu"
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				className: "absolute top-3 right-3 rounded-sm p-1 text-mist hover:bg-white/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})
		]
	})] });
}
function MeetingWorkspace({ title, pq, onChange, saveState, assessmentHref, backHref = "/", backLabel = "Book of business", banner, onAskAi, aiBusy, aiText, aiSection, headerRight, householdId }) {
	const [section, setSection] = (0, import_react.useState)("opening");
	const [navOpen, setNavOpen] = (0, import_react.useState)(false);
	const [intakeOpen, setIntakeOpen] = (0, import_react.useState)(false);
	const totals = (0, import_react.useMemo)(() => computeTotals(pq), [pq]);
	const completeness = overallCompleteness(pq);
	const idx = SECTIONS.findIndex((s) => s.id === section);
	const def = SECTIONS[idx] ?? SECTIONS[0];
	const prev = SECTIONS[idx - 1];
	const next = SECTIONS[idx + 1];
	function go(id) {
		setSection(id);
		setNavOpen(false);
	}
	function toggleComplete() {
		const has = pq.completedSections.includes(section);
		onChange({
			...pq,
			completedSections: has ? pq.completedSections.filter((x) => x !== section) : [...pq.completedSections, section]
		});
	}
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3",
		children: SECTIONS.map((s, i) => {
			const c = sectionCompleteness(pq, s.id);
			const pct = c.total ? c.filled / c.total : 0;
			const done = pq.completedSections.includes(s.id) || pct >= 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => go(s.id),
				className: cn("flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors", s.id === section ? "bg-white/10 text-cream" : "text-mist/80 hover:bg-white/5 hover:text-cream"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-5 tabular text-[11px] text-mist/50",
						children: String(i + 1).padStart(2, "0")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 truncate",
						children: s.short
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", done ? "bg-brass" : pct > 0 ? "bg-mist/50" : "bg-white/15") })
				]
			}, s.id);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-paper/95 px-3 backdrop-blur-sm sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-10 shrink-0 place-items-center rounded-md lg:hidden",
						onClick: () => setNavOpen(true),
						"aria-label": "Open sections",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: backHref,
						className: "flex shrink-0 items-center",
						"aria-label": "Falcon Wealth home",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 place-items-center rounded-md bg-navy sm:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconMark, { className: "size-7" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconWordmark, {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-navy",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-slate",
							children: [
								saveState ?? "Autosave on",
								" · ",
								completeness,
								"% captured"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden items-center gap-4 md:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wider text-slate",
								children: "Net worth"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular text-sm font-medium text-navy",
								children: formatMoney(totals.netWorth, { compact: true })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wider text-slate",
								children: "Gap"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("tabular text-sm font-medium", totals.shortage < 0 ? "text-rust" : "text-sage"),
								children: formatMoney(totals.shortage)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakeLaunch, { onClick: () => setIntakeOpen(true) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: assessmentHref,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Assessment"
							})]
						})
					}),
					headerRight
				]
			}),
			banner,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakePanel, {
				open: intakeOpen,
				onOpenChange: setIntakeOpen,
				householdId,
				pq,
				onFilled: onChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotStrip, { totals }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: navOpen,
				onOpenChange: setNavOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "left",
					className: "bg-navy pt-12",
					children: nav
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-start md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[13rem_minmax(0,1fr)_16rem]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "no-print sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-full flex-col overflow-y-auto bg-navy lg:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-4 pt-5 pb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-medium uppercase tracking-[0.18em] text-brass",
										children: "Discovery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 h-1 overflow-hidden rounded-full bg-white/10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-brass",
											style: { width: `${completeness}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1.5 text-[11px] text-mist/70",
										children: [completeness, "% of the PQ"]
									})
								]
							}),
							nav,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-3 pb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: backHref,
									className: "block rounded-md px-2 py-2 text-xs text-mist/60 hover:text-cream",
									children: ["← ", backLabel]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "min-w-0 px-4 py-6 sm:px-6 lg:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex flex-wrap items-end justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "max-w-2xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] font-medium uppercase tracking-[0.18em] text-brass-dim",
											children: [
												"Section ",
												idx + 1,
												" of ",
												SECTIONS.length
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "font-display text-3xl text-navy sm:text-4xl",
											children: def.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-slate",
											children: def.prompt
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [onAskAi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => onAskAi(section),
										disabled: aiBusy,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), aiBusy ? "Listening…" : "Follow-ups"]
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: toggleComplete,
										children: pq.completedSections.includes(section) ? "Marked complete" : "Mark complete"
									})]
								})]
							}),
							aiText && aiSection === section ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 rounded-lg border border-brass/30 bg-cream p-4 text-sm text-navy",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-brass-dim",
									children: "Suggested follow-ups"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "whitespace-pre-wrap",
									children: aiText
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionBody, {
								id: section,
								pq,
								onChange,
								onOpenIntake: () => setIntakeOpen(true)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaField, {
									label: "Section notes",
									value: pq.sectionNotes[section] ?? "",
									onChange: (v) => onChange({
										...pq,
										sectionNotes: {
											...pq.sectionNotes,
											[section]: v
										}
									}),
									placeholder: "Parking lot, quotes, things to verify after the meeting…",
									rows: 3
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-between gap-3 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									disabled: !prev,
									onClick: () => prev && go(prev.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), prev ? prev.short : "Start"]
								}), next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => go(next.id),
									children: [next.short, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: assessmentHref,
										children: ["Generate assessment", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" })]
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "no-print sticky top-20 hidden self-start px-4 py-6 md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotRail, {
							pq,
							totals
						})
					})
				]
			})
		]
	});
}
//#endregion
export { MeetingWorkspace as t };
