import { PageFrame } from "@/components/navigation";
import { PublicReportViewer } from "@/components/public-report-viewer";
import { ReportActions } from "@/components/report-actions";
import { Section } from "@/components/ui";

export default async function ManagementReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageFrame active="reports" audience="management">
      <Section title="Fechamento persistido" eyebrow="Supabase">
        <ReportActions />
      </Section>

      {id !== "latest" ? <PublicReportViewer publicId={id} /> : null}
    </PageFrame>
  );
}
