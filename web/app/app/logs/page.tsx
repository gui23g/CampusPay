import { AuditEventsTimeline } from "@/components/audit-events-timeline";
import { PageFrame } from "@/components/navigation";

export default function LogsPage() {
  return (
    <PageFrame active="logs" audience="management">
      <AuditEventsTimeline />
    </PageFrame>
  );
}
