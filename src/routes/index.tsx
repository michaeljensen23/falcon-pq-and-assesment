import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { FalconWordmark } from "@/components/brand/falcon-mark";
import { RequireAuth } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@/lib/auth/gates";
import { createHousehold, deleteHousehold, listHouseholds } from "@/lib/households";
import { formatMoney, formatDate } from "@/lib/format";
import { clearHouseholdDraft } from "@/lib/pq/household-draft";
import type { HouseholdSummary } from "@/lib/pq/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <RequireAuth>
      <BookOfBusiness />
    </RequireAuth>
  );
}

function BookOfBusiness() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<HouseholdSummary[] | null>(null);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState<HouseholdSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    listHouseholds()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  async function create() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await createHousehold({ data: { firstName, lastName } });
      if (!res?.ok) {
        setCreateError(res && "error" in res ? res.error : "Could not create this household.");
        return;
      }
      setOpen(false);
      setFirstName("");
      setLastName("");
      await navigate({ to: "/households/$id", params: { id: res.id } });
    } catch {
      setCreateError("Could not create this household.");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    setDeleteError(null);
    const id = pending.id;
    try {
      const res = await deleteHousehold({ data: id });
      if (!res?.ok) {
        setDeleteError(res && "error" in res ? res.error : "Could not delete this household.");
        return;
      }
      clearHouseholdDraft(id);
      setRows((prev) => (prev ?? []).filter((h) => h.id !== id));
      setPending(null);
    } catch {
      setDeleteError("Could not delete this household.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-paper">
      <header className="flex h-20 items-center justify-between gap-3 border-b border-border bg-cream px-4">
        <FalconWordmark className="h-16" />
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/demo">Sample</Link>
          </Button>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brass-dim">
              Book of business
            </p>
            <h1 className="font-display text-4xl text-navy">Households in discovery</h1>
          </div>
          <Button onClick={() => { setCreateError(null); setOpen(true); }}>
            <Plus className="size-4" />
            New household
          </Button>
        </div>

        {deleteError ? (
          <p className="mt-4 rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{deleteError}</p>
        ) : null}

        <div className="mt-8 divide-y divide-border overflow-hidden rounded-xl bg-cream shadow-[var(--shadow-border)]">
          {rows === null ? (
            <div className="h-40 animate-pulse bg-paper-2" />
          ) : rows.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-display text-2xl text-navy">No households yet</p>
              <p className="mt-2 text-sm text-slate">Start a discovery or open the Hammarth sample.</p>
            </div>
          ) : (
            rows.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-1 pr-2 hover:bg-paper/80"
              >
                <Link
                  to="/households/$id"
                  params={{ id: h.id }}
                  className="flex min-w-0 flex-1 flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{h.displayName}</p>
                    <p className="text-xs text-slate">
                      Updated {formatDate(h.updatedAt)}
                      {h.advisorName ? ` · ${h.advisorName}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm text-navy">{formatMoney(h.totalAssets)}</p>
                    <p className="text-[11px] text-slate">investable</p>
                  </div>
                  <Badge variant={h.status === "delivered" ? "sage" : h.status === "review" ? "brass" : "muted"}>
                    {h.status}
                  </Badge>
                  <div className="w-16 text-right text-xs tabular text-slate">{h.completeness}%</div>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate hover:bg-rust/10 hover:text-rust"
                  aria-label={`Delete ${h.displayName}`}
                  onClick={() => {
                    setDeleteError(null);
                    setPending(h);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="New household">
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="fn">Client first name</Label>
              <Input id="fn" className="mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ln">Last name</Label>
              <Input id="ln" className="mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Button className="w-full" onClick={() => void create()} disabled={creating}>
              Open meeting
            </Button>
            {createError ? <p className="text-sm text-rust">{createError}</p> : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pending !== null} onOpenChange={(next) => !deleting && setPending(next ? pending : null)}>
        <DialogContent title={pending ? `Delete ${pending.displayName}?` : "Delete household?"}>
          <p className="mt-2 text-sm text-slate">
            This removes the discovery file, uploaded statements, and meeting notes. It cannot be
            undone.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setPending(null)} disabled={deleting}>
              Keep file
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete household"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
