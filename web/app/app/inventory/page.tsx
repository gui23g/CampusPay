import { InventoryDashboard } from "@/components/inventory-dashboard";
import { PageFrame } from "@/components/navigation";

export default function InventoryPage() {
  return (
    <PageFrame active="inventory" audience="management">
      <InventoryDashboard />
    </PageFrame>
  );
}
