import { CircleBackButton } from '@/components/ui/circle-back-button';
import { BNPLForm } from '@/components/finance/bnpl/BNPLForm';

export default function NewBNPLPage() {
  return (
    <div className="space-y-8 pb-24 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CircleBackButton />
          <div>
            <h1 className="text-3xl font-bold text-white">Add BNPL purchase</h1>
            <p className="text-sm text-text-secondary">
              Capture every installment promise so repayments stay effortless.
            </p>
          </div>
        </div>
      </div>

      <BNPLForm mode="create" />
    </div>
  );
}
