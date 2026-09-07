import { PageFrame } from "@/components/navigation";
import { CheckoutCard } from "@/components/checkout-card";

export default async function CheckoutPage({
  params
}: {
  params: Promise<{ campaignSlug: string }>;
}) {
  const { campaignSlug } = await params;

  return (
    <PageFrame active="checkout" audience="buyer">
      <CheckoutCard campaignSlug={campaignSlug} />
    </PageFrame>
  );
}
