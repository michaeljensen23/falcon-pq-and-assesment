import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MeetingWorkspace } from "@/components/meeting/workspace";
import { HAMMARTH_NAME } from "@/lib/pq/hammarth";
import { loadDemoPq, saveDemoPq } from "@/lib/pq/demo-storage";
import type { PqData } from "@/lib/pq/types";

export const Route = createFileRoute("/demo/")({ component: DemoMeeting });

function DemoMeeting() {
  const [pq, setPq] = useState<PqData>(() => loadDemoPq());
  return (
    <MeetingWorkspace
      title={HAMMARTH_NAME}
      pq={pq}
      onChange={(next) => {
        setPq(next);
        saveDemoPq(next);
      }}
      saveState="Sample — this browser only"
      assessmentHref="/demo/assessment"
      backHref="/"
      backLabel="Book of business"
      banner={
        <div className="no-print bg-brass px-4 py-2 text-center text-sm text-navy-deep">
          Sample household from a completed discovery. Open a household from the book to keep a
          permanent copy.
        </div>
      }
    />
  );
}
