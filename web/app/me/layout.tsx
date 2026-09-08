import { AuthGate } from "@/components/auth-gate";

export default function BuyerAccountLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
