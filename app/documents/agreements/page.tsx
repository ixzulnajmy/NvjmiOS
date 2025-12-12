// file: app/documents/agreements/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FileCheck } from "lucide-react";

export default function AgreementsPage() {
  return (
    <AppShell showDetail={false}>
      <div className="p-6">
        <PageHeader
          title="Agreements"
          description="Store and manage your legal agreements"
        />
        <EmptyState
          icon={FileCheck}
          title="Agreements coming soon"
          description="Upload and track rental agreements, contracts, and legal documents."
        />
      </div>
    </AppShell>
  );
}
