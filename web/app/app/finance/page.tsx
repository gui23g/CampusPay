import { FinanceDashboard } from "@/components/finance-dashboard";
import { PageFrame } from "@/components/navigation";

export default function FinancePage() {
  return (
    <PageFrame active="finance" audience="management">
      <FinanceDashboard />
    </PageFrame>
  );
}
