import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-Pdh8pBxf.mjs";
import { n as FalconWordmark, t as FalconMark } from "./falcon-mark-C0hhzhYm.mjs";
import { t as computeTotals } from "./totals-Dlg9CZvQ.mjs";
import { t as Button } from "./button-BRLKHV4M.mjs";
import { r as formatMoney, t as ageFromDob } from "./format-DK-owqV6.mjs";
import { i as buildConcerns, n as INVESTMENT_STRATEGIES, r as TAX_STRATEGIES, t as ASSET_CLASSES } from "./concerns-DK2UMXNf.mjs";
import { o as Printer } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/document-DqbC23Za.js
var import_jsx_runtime = require_jsx_runtime();
function AssessmentDocument({ pq, meetingHref, preparedBy }) {
	const totals = computeTotals(pq);
	const concerns = buildConcerns(pq, totals);
	const client = [pq.client.firstName, pq.client.lastName].filter(Boolean).join(" ");
	const spouse = [pq.spouse.firstName, pq.spouse.lastName].filter(Boolean).join(" ");
	const names = [client, spouse].filter(Boolean).join("  ·  ") || "Household";
	const advisor = preparedBy || pq.advisor || "Falcon Wealth Planning";
	const cAge = ageFromDob(pq.client.dob);
	const sAge = ageFromDob(pq.spouse.dob);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-navy-deep print:bg-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-navy px-4 text-cream",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: meetingHref,
					className: "text-sm text-mist hover:text-cream",
					children: "← Back to meeting"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden truncate text-sm sm:block",
					children: names
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "brass",
					onClick: () => window.print(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), "Print / PDF"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-[820px] flex-col gap-6 px-4 py-8 print:max-w-none print:gap-0 print:p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
					names,
					advisor
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl text-navy",
						children: "Introduction"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-4 text-sm leading-relaxed text-ink",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This Financial Assessment was created from the information captured in your discovery meeting. It is designed to give you the resources you need to meet your financial goals effectively. Estimates, projections, and figures are approximations based on mathematical calculations. Taking this information as absolute may adversely affect your current financial position." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The analysis is a guide to improving your current situation; the recommendations are a starting point. Falcon Wealth provides one to two meetings with our Certified Financial Planners at no cost. Financial planning is a continuous series of decisions in service of outstanding goals." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Our CFP® practitioners are one section of your personal finance and should work alongside your CPA and estate attorney. Portions of this report may be based on generally accepted tax and estate principles, which are always subject to change. Independent tax and legal counsel are suggested." })
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-navy",
						children: "Financial, Retirement, Tax & Investment Assessment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
						children: "1. Where you are today"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						className: "mt-3 w-full text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Cash & emergency fund",
								v: totals.cash
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Tax deferred / qualified / IRA",
								v: totals.deferred
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Taxable / non-qualified / brokerage",
								v: totals.investments
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Tax free / Roth",
								v: totals.roth
							}),
							totals.business > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Business & other",
								v: totals.business
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Total assets",
								v: totals.totalAssetsExRE,
								strong: true,
								note: "Excluding real estate"
							})
						] })
					}),
					totals.realEstate > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-slate",
						children: [
							"Real estate ",
							formatMoney(totals.realEstate),
							totals.realEstateLiabilities ? ` · mortgages ${formatMoney(totals.realEstateLiabilities)}` : "",
							" · ",
							"Net worth ",
							formatMoney(totals.netWorth)
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
						children: "2. What retirement looks like"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-6 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-slate",
							children: "Expenses today"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl text-navy tabular",
							children: formatMoney(totals.expenses)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
							className: "text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Social Security",
									v: totals.socialSecurity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Pension",
									v: totals.pension
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Rental income",
									v: totals.rental
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "VA benefits",
									v: totals.va
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Total guaranteed income",
									v: totals.guaranteedRetirement,
									strong: true
								})
							] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
						children: "3. Shortage required from investments"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("mt-3 inline-flex items-baseline gap-3 rounded-md px-4 py-3", totals.shortage < 0 ? "bg-rust/10" : "bg-sage/10"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs uppercase tracking-wider text-slate",
							children: totals.shortage < 0 ? "Shortage" : "Surplus"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-display text-3xl tabular", totals.shortage < 0 ? "text-rust" : "text-sage"),
							children: formatMoney(totals.shortage)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-slate",
						children: [
							"Will this fixed retirement income be enough when factoring in taxes, mortgage payoff, Social Security gap, COLA, insurance gap, and education or care expenses?",
							cAge ? ` Client age ${cAge}.` : "",
							sAge ? ` Spouse age ${sAge}.` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
						children: "4. Tax planning and tax reduction strategies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 list-decimal space-y-1 pl-5 text-sm text-ink",
						children: TAX_STRATEGIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
						children: "5. Investments"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 list-decimal space-y-1 pl-5 text-sm text-ink",
						children: INVESTMENT_STRATEGIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
						children: "6. Insurance and estate planning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 list-disc space-y-1 pl-5 text-sm text-ink",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Estate tax changes come 2026" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Annual gifting" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Charitable giving" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Establish estate planning documents — living trust, pour-over will, POAs (healthcare & financial), HIPAA" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Avoid public records, time delays, probate expenses and attorney fees" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Protect the estate against long-term illness and premature death" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Simplification through coordination of advisors" })
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl text-navy",
						children: "Areas of concern"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-slate",
						children: "Focus areas for planning, generated from this household."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-6",
						children: concerns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-xl text-navy",
										children: c.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", c.severity === "high" ? "bg-rust/15 text-rust" : c.severity === "watch" ? "bg-brass/20 text-brass-dim" : "bg-paper-2 text-slate"),
										children: c.severity
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-ink",
									children: c.summary
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-brass-dim",
									children: "Recommended strategy"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 list-disc space-y-1 pl-5 text-sm text-ink",
									children: c.strategy.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
								})
							]
						}, c.id))
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-2xl text-navy",
						children: ["Investment management · ", formatMoney(totals.totalAssetsExRE)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-ink",
						children: "Develop a diversified, tax-efficient portfolio to provide for cash-flow needs and mitigate inflation. Institutional index funds are favored; ETFs where institutional shares are not optimal. Incorporate 12–20 asset classes in percentages contingent on the required return:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 text-sm sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-paper-2 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-medium uppercase tracking-wider text-slate",
									children: "US holdings"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1 text-ink",
									children: ASSET_CLASSES.us.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, x))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-paper-2 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-medium uppercase tracking-wider text-slate",
									children: "International"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1 text-ink",
									children: ASSET_CLASSES.intl.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, x))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-paper-2 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-medium uppercase tracking-wider text-slate",
									children: "Fixed income"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1 text-ink",
									children: ASSET_CLASSES.fixed.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, x))
								})]
							})
						]
					}),
					totals.annualFees > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 rounded-md bg-cream p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-wider text-slate",
							children: "Current managed-asset cost"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-ink",
							children: [
								"Approximate weighted fund expense ",
								totals.weightedFeePct.toFixed(2),
								"% ·",
								" ",
								formatMoney(totals.annualFees),
								" per year on ",
								formatMoney(totals.managedAssets),
								" of managed assets."
							]
						})]
					}) : null
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-navy",
						children: "Tax diversification"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-ink",
						children: "Flexibility in retirement comes from owning three tax personalities — taxable, tax-deferred, and tax-free — so you can choose the character of income each year."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bucket, {
								title: "Tax-free",
								amount: totals.roth,
								items: [
									"Roth IRAs",
									"Roth 401(k)",
									"Municipal bonds (in part)"
								],
								note: "0% qualified out"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bucket, {
								title: "Taxable",
								amount: totals.investments + totals.cash,
								items: [
									"Brokerage",
									"Crypto",
									"Checking / savings",
									"Collectibles"
								],
								note: "0–23.8% capital gains"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bucket, {
								title: "Tax-deferred",
								amount: totals.deferred,
								items: [
									"IRAs",
									"401(k) / 403(b) / 457",
									"SEP / SIMPLE",
									"Defined benefit"
								],
								note: "Ordinary income out"
							})
						]
					}),
					pq.goals ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
							children: "Goals captured"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink",
							children: pq.goals
						})]
					}) : null,
					pq.concerns ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold uppercase tracking-[0.14em] text-navy-mid",
							children: "Concerns captured"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink",
							children: pq.concerns
						})]
					}) : null
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-navy",
						children: "Household snapshot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Client",
								v: client || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Spouse",
								v: spouse || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Residence",
								v: [pq.address.city, pq.address.state].filter(Boolean).join(", ") || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Filing status",
								v: pq.filingStatus || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Advisor",
								v: pq.advisor || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Referred by",
								v: pq.referredBy || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "Attorney",
								v: pq.advisors.attorney.name ? `${pq.advisors.attorney.name} · ${pq.advisors.attorney.firm}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								k: "CPA",
								v: pq.advisors.accountant.name ? `${pq.advisors.accountant.name} · ${pq.advisors.accountant.firm}` : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-10 text-xs leading-relaxed text-slate",
						children: "Falcon Wealth Planning, Inc. · www.FalconWealthPlanning.com · (855) 963-2526 · Office locations serving nationwide. This document is educational and is not tax, legal, or investment advice. CFP® is a certification mark owned by Certified Financial Planner Board of Standards, Inc."
					})
				] })
			]
		})]
	});
}
function Page({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "print-page rounded-xl bg-cream px-8 py-10 shadow-[var(--shadow-border)] print:rounded-none print:px-12 print:py-12 print:shadow-none",
		children
	});
}
function DocHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-8 flex items-center justify-between border-b border-border pb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconWordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] uppercase tracking-[0.18em] text-slate",
			children: "Financial Assessment"
		})]
	});
}
function Cover({ names, advisor }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-[640px] flex-col justify-between overflow-hidden rounded-lg bg-navy px-8 py-10 text-cream print:min-h-[900px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(176,141,74,0.18),transparent_55%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconWordmark, { inverted: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.22em] text-brass",
						children: "Financial Assessment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-5xl leading-tight text-cream",
						children: names
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-sm text-mist",
						children: ["Prepared by ", advisor]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-mist/70",
						children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-mist/70",
					children: [
						"www.FalconWealthPlanning.com",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"(855) 963-2526 · Serving nationwide"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconMark, { className: "size-16" })]
			})
		]
	});
}
function Row({ k, v, strong, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: cn(strong && "bg-navy/5 font-medium"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
			className: "py-1.5 pr-4 text-ink",
			children: [k, note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-2 text-[11px] font-normal text-slate",
				children: note
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "py-1.5 text-right tabular text-navy",
			children: formatMoney(v)
		})]
	});
}
function Item({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[11px] uppercase tracking-wider text-slate",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "text-ink",
		children: v
	})] });
}
function Bucket({ title, amount, items, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-paper-2 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl text-navy",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "tabular text-sm text-navy-mid",
				children: formatMoney(amount)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-slate",
				children: note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 text-sm text-ink",
				children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: i }, i))
			})
		]
	});
}
//#endregion
export { AssessmentDocument as t };
