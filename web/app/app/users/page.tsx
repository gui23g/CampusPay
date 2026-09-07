import { PageFrame } from "@/components/navigation";
import { OrganizationForm } from "@/components/organization-form";
import { InviteMemberForm } from "@/components/invite-member-form";
import { OrganizationMembersTable } from "@/components/organization-members-table";
import { Section } from "@/components/ui";
import { organization } from "@/lib/dashboard-data";

export default function UsersPage() {
  return (
    <PageFrame active="users" audience="management">
      <Section title="Equipe e permissões" eyebrow={organization.mandate}>
        <OrganizationMembersTable />
      </Section>

      <Section title="Convite" eyebrow="RBAC">
        <InviteMemberForm />
      </Section>

      <Section title="Organização real" eyebrow="Supabase">
        <OrganizationForm />
      </Section>
    </PageFrame>
  );
}
