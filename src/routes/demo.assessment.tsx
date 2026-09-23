import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AssessmentDocument } from "@/components/assessment/document";
import { loadDemoPq } from "@/lib/pq/demo-storage";

export const Route = createFileRoute("/demo/assessment")({ component: DemoAssessment });

function DemoAssessment() {
  const [pq] = useState(() => loadDemoPq());
  return (
    <AssessmentDocument pq={pq} meetingHref="/demo" preparedBy="Michael Jensen, CFP®" />
  );
}
