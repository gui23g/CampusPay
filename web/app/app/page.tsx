import { ManagementOverview } from "@/components/management-overview";
import { PageFrame } from "@/components/navigation";

export default function ManagementOverviewPage() {
  return (
    <PageFrame active="overview" audience="management">
      <ManagementOverview />
    </PageFrame>
  );
}
