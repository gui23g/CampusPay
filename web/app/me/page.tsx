import { BuyerAccountOverview } from "@/components/buyer-account-overview";
import { PageFrame } from "@/components/navigation";

export default function BuyerAccountPage() {
  return (
    <PageFrame active="me" audience="buyer">
      <BuyerAccountOverview />
    </PageFrame>
  );
}
