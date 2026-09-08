import { AuthGate } from "@/components/auth-gate";

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
