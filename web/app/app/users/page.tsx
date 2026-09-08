import { PageFrame } from "@/components/navigation";
import { OrganizationForm } from "@/components/organization-form";
import { InviteMemberForm } from "@/components/invite-member-form";
import { OrganizationMembersTable } from "@/components/organization-members-table";
import { Section } from "@/components/ui";

export default function UsersPage() {
  return (
    <PageFrame active="users" audience="management">
      <Section title="Equipe e permissões" eyebrow="RBAC">
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
