// file: app/documents/receipts/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

export default function ReceiptsPage() {
  return (
    <AppShell showDetail={false}>
      <div className="p-6">
        <PageHeader
          title="Receipts"
          description="Organize your purchase receipts"
        />
        <EmptyState
          icon={Receipt}
          title="Receipts coming soon"
          description="Scan and organize receipts from purchases."
        />
      </div>
    </AppShell>
  );
}
