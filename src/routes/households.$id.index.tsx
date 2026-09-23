import { createFileRoute } from "@tanstack/react-router";
import { MeetingWorkspace } from "@/components/meeting/workspace";
import { HouseholdMissing } from "@/components/household-missing";
import { UserButton, RedirectToSignIn } from "@/lib/auth/gates";
import { suggestFollowUps } from "@/lib/households";
import { useHousehold } from "@/lib/use-household";
import { SECTIONS, type SectionId } from "@/lib/pq/sections";
import { computeTotals, householdLabel } from "@/lib/pq/totals";
import { relativeSaved } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/households/$id/")({ component: HouseholdMeeting });

function HouseholdMeeting() {
  const { id } = Route.useParams();
  const { user, isPending, pq, updatedAt, error, persist } = useHousehold(id, "meeting");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiSection, setAiSection] = useState<SectionId | null>(null);

  async function onAskAi(sectionId: SectionId) {
    if (!pq) return;
    const def = SECTIONS.find((s) => s.id === sectionId);
    const totals = computeTotals(pq);
    setAiBusy(true);
    setAiSection(sectionId);
    try {
      const res = await suggestFollowUps({
        data: {
          section: def?.label ?? sectionId,
          prompt: def?.prompt ?? "",
          snapshot: JSON.stringify(
            {
              names: householdLabel(pq),
              totals: {
                cash: totals.cash,
                deferred: totals.deferred,
                roth: totals.roth,
                investments: totals.investments,
                expenses: totals.expenses,
                shortage: totals.shortage,
              },
              notes: pq.sectionNotes[sectionId] ?? "",
              goals: pq.goals,
              concerns: pq.concerns,
            },
            null,
            0,
          ),
        },
      });
      setAiText(res.ok ? res.text : res.error);
    } catch {
      setAiText("Could not reach Grok just now.");
    } finally {
      setAiBusy(false);
    }
  }

  if (pq) {
    return (
      <MeetingWorkspace
        title={householdLabel(pq)}
        pq={pq}
        onChange={persist}
        saveState={relativeSaved(updatedAt)}
        assessmentHref={`/households/${id}/assessment`}
        householdId={id}
        onAskAi={onAskAi}
        aiBusy={aiBusy}
        aiText={aiText}
        aiSection={aiSection}
        headerRight={<UserButton />}
      />
    );
  }
  if (isPending) return <div className="min-h-dvh bg-paper" />;
  if (!user) return <RedirectToSignIn />;
  if (error) {
    return (
      <HouseholdMissing message="This meeting file is no longer on the server. Open the book of business to pick up Hammarth or another household." />
    );
  }
  return (
    <div className="min-h-dvh bg-paper">
      <div className="h-14 animate-pulse bg-paper-2" />
    </div>
  );
}
