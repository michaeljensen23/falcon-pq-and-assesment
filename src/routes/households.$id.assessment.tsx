import { createFileRoute } from "@tanstack/react-router";
import { AssessmentDocument } from "@/components/assessment/document";
import { HouseholdMissing } from "@/components/household-missing";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useHousehold } from "@/lib/use-household";

export const Route = createFileRoute("/households/$id/assessment")({
  component: HouseholdAssessment,
});

function HouseholdAssessment() {
  const { id } = Route.useParams();
  const { user, isPending, pq, error } = useHousehold(id, "assessment");

  if (pq) {
    return (
      <AssessmentDocument
        pq={pq}
        meetingHref={`/households/${id}`}
        preparedBy={pq.advisor}
      />
    );
  }
  if (isPending) return <div className="min-h-dvh bg-navy-deep" />;
  if (!user) return <RedirectToSignIn />;
  if (error) return <HouseholdMissing />;
  return <div className="min-h-dvh bg-navy-deep" />;
}
