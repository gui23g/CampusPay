import { ManagementCampaignDetail } from "@/components/management-campaign-detail";
import { PageFrame } from "@/components/navigation";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageFrame active="campaign" audience="management">
      <ManagementCampaignDetail campaignId={id} />
    </PageFrame>
  );
}
