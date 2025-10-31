'use client';

import { useEffect, useState } from 'react';
import { categorySchema, categoryTypes, type CategoryFormData } from '@/schemas/category.schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button3D } from '@/components/ui/button-3d';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FormState = {
  name: string;
  category_type: CategoryFormData['category_type'];
  icon: string;
  color: string;
  sort_order: string;
};

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialValues?: {
    name?: string;
    category_type?: CategoryFormData['category_type'];
    icon?: string | null;
    color?: string | null;
    sort_order?: number | null;
  };
  submitting: boolean;
  error?: string | null;
  onSubmit: (values: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_COLOR = '#3b82f6';

export function CategoryForm({
  mode,
  initialValues,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [formState, setFormState] = useState<FormState>(() => ({
    name: initialValues?.name ?? '',
    category_type: initialValues?.category_type ?? 'expense',
    icon: initialValues?.icon ?? '',
    color: initialValues?.color ?? DEFAULT_COLOR,
    sort_order: initialValues?.sort_order !== undefined && initialValues?.sort_order !== null
      ? String(initialValues.sort_order)
      : '0',
  }));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFormState({
      name: initialValues?.name ?? '',
      category_type: initialValues?.category_type ?? 'expense',
      icon: initialValues?.icon ?? '',
      color: initialValues?.color ?? DEFAULT_COLOR,
      sort_order:
        initialValues?.sort_order !== undefined && initialValues?.sort_order !== null
          ? String(initialValues.sort_order)
          : '0',
    });
    setValidationError(null);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const parsed = categorySchema.safeParse({
      name: formState.name.trim(),
      category_type: formState.category_type,
      icon: formState.icon.trim(),
      color: formState.color || DEFAULT_COLOR,
      sort_order: Number.parseInt(formState.sort_order, 10) || 0,
    });

    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Unable to save category.');
      return;
    }

    const payload = {
      ...parsed.data,
      icon: parsed.data.icon?.trim() || '',
      color: parsed.data.color || DEFAULT_COLOR,
      sort_order: parsed.data.sort_order ?? 0,
    };

    await onSubmit(payload);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          value={formState.name}
          onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="E.g. Groceries"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-type">Type</Label>
        <Select
          value={formState.category_type}
          onValueChange={(value) => setFormState((prev) => ({ ...prev, category_type: value as FormState['category_type'] }))}
        >
          <SelectTrigger id="category-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {categoryTypes.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-icon">Icon / Emoji</Label>
          <Input
            id="category-icon"
            value={formState.icon}
            onChange={(event) => setFormState((prev) => ({ ...prev, icon: event.target.value }))}
            placeholder="Optional emoji"
            maxLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-color">Color</Label>
          <Input
            id="category-color"
            type="color"
            value={formState.color}
            onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value || DEFAULT_COLOR }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-sort">Sort Order</Label>
        <Input
          id="category-sort"
          type="number"
          value={formState.sort_order}
          onChange={(event) => setFormState((prev) => ({ ...prev, sort_order: event.target.value }))}
        />
      </div>

      {(validationError || error) && (
        <p className="text-sm text-error">
          {validationError || error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button3D type="submit" variant="primary" disabled={submitting}>
          {submitting ? (mode === 'create' ? 'Saving…' : 'Updating…') : mode === 'create' ? 'Create Category' : 'Save Changes'}
        </Button3D>
      </div>
    </form>
  );
}
