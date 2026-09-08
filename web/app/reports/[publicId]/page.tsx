import { PageFrame } from "@/components/navigation";
import { PublicReportViewer } from "@/components/public-report-viewer";

export default async function PublicReportPage({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  return (
    <PageFrame active="reports" audience="public">
      <PublicReportViewer publicId={publicId} />
    </PageFrame>
  );
}
