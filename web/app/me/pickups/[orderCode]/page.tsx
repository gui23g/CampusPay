import { BuyerPickupDetails } from "@/components/buyer-pickup-details";
import { PageFrame } from "@/components/navigation";

export default async function BuyerPickupPage({
  params,
  searchParams
}: {
  params: Promise<{ orderCode: string }>;
  searchParams: Promise<{ pin?: string }>;
}) {
  const [{ orderCode }, query] = await Promise.all([params, searchParams]);

  return (
    <PageFrame active="my-orders" audience="buyer">
      <BuyerPickupDetails orderCode={orderCode} pickupPin={query.pin} />
    </PageFrame>
  );
}
