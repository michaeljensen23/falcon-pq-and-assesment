import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getHousehold, recoverHousehold, saveHousehold } from "@/lib/households";
import { clearHouseholdDraft, loadHouseholdDraft, saveHouseholdDraft } from "@/lib/pq/household-draft";
import type { HouseholdStatus, PqData } from "@/lib/pq/types";

type Kind = "meeting" | "assessment";

export function useHousehold(id: string, kind: Kind = "meeting") {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id ?? null;
  const [pq, setPq] = useState<PqData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pqRef = useRef<PqData | null>(null);
  const fileIdRef = useRef(id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  pqRef.current = pq;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fileIdRef.current = id;

    async function load() {
      try {
        const h = await getHousehold({ data: id });
        if (cancelled) return;
        if (h) {
          const draft = loadHouseholdDraft(h.id) ?? loadHouseholdDraft(id);
          const newerDraft = draft && draft.savedAt > h.updatedAt;
          fileIdRef.current = h.id;
          setPq(newerDraft ? draft.pq : h.pq);
          setUpdatedAt(newerDraft ? draft.savedAt : h.updatedAt);
          setError(null);
          if (newerDraft) {
            void saveHousehold({ data: { id: h.id, pq: draft.pq } }).then((r) => {
              if (!cancelled && r?.ok) setUpdatedAt(r.updatedAt);
            });
          } else {
            saveHouseholdDraft(h.id, h.pq);
          }
          return;
        }

        // Deleted / unknown id: never re-insert from a local draft.
        clearHouseholdDraft(id);

        const recovered = await recoverHousehold();
        if (cancelled) return;
        if (recovered) {
          fileIdRef.current = recovered.id;
          setPq(recovered.pq);
          setUpdatedAt(recovered.updatedAt);
          setError(null);
          saveHouseholdDraft(recovered.id, recovered.pq);
          if (recovered.id !== id) {
            if (kind === "assessment") {
              await navigate({
                to: "/households/$id/assessment",
                params: { id: recovered.id },
                replace: true,
              });
            } else {
              await navigate({
                to: "/households/$id",
                params: { id: recovered.id },
                replace: true,
              });
            }
          }
          return;
        }

        if (pqRef.current) return;
        setError("Household not found.");
      } catch {
        // Offline / transient: show a local draft if we have one, but do not recreate the row.
        const draft = loadHouseholdDraft(id);
        if (draft) {
          fileIdRef.current = id;
          setPq(draft.pq);
          setUpdatedAt(draft.savedAt);
          setError(null);
          return;
        }
        if (pqRef.current) return;
        setError("Could not load this household.");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, userId, kind, navigate]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function persist(next: PqData, status?: HouseholdStatus) {
    setPq(next);
    const fileId = fileIdRef.current;
    saveHouseholdDraft(fileId, next);
    if (fileId !== id) saveHouseholdDraft(id, next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveHousehold({ data: { id: fileId, pq: next, status } })
        .then((r) => {
          if (r?.ok) setUpdatedAt(r.updatedAt);
        })
        .catch(() => undefined);
    }, 700);
  }

  return {
    user,
    isPending,
    pq,
    updatedAt,
    error,
    persist,
  };
}
