import { CampaignBuilder } from "@/components/campaign-builder";
import { PageFrame } from "@/components/navigation";
import { Section } from "@/components/ui";

export default function NewCampaignPage() {
  return (
    <PageFrame active="campaign" audience="management">
      <Section title="Nova campanha" eyebrow="CRUD dono">
        <CampaignBuilder />
      </Section>
    </PageFrame>
  );
}
