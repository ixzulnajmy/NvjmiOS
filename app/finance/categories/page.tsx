'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Button3D } from '@/components/ui/button-3d';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/finance/CategoryForm';
import { formatCurrency } from '@/lib/utils';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PieChart as PieChartIcon,
  PlusCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { CategoryType, FinanceCategory } from '@/types/database.types';
import type { CategoryFormData } from '@/schemas/category.schema';

type ExpenseRecord = {
  amount: number;
  transaction_type: 'expense' | 'income' | 'transfer';
  category: string | null;
};

type CategorySummary = {
  id: string;
  name: string;
  category_type: CategoryType;
  icon?: string | null;
  color: string;
  total: number;
  percentage: number;
  sort_order: number;
  isVirtual: boolean;
  slug: string;
};

const DEFAULT_CATEGORY_COLOR = '#3b82f6';

const fallbackCategoryMeta: Record<string, { icon: string; color: string }> = {
  food: { icon: '🍜', color: '#f97316' },
  transport: { icon: '🛵', color: '#38bdf8' },
  girlfriend: { icon: '💝', color: '#ec4899' },
  shopping: { icon: '🛍️', color: '#a855f7' },
  bills: { icon: '🧾', color: '#facc15' },
  other: { icon: '🪄', color: '#94a3b8' },
  salary: { icon: '💼', color: '#22c55e' },
  investments: { icon: '📈', color: '#0ea5e9' },
  gifts: { icon: '🎁', color: '#ef4444' },
  subscriptions: { icon: '🔁', color: '#6366f1' },
  health: { icon: '💊', color: '#f43f5e' },
  entertainment: { icon: '🎬', color: '#22d3ee' },
  groceries: { icon: '🛒', color: '#16a34a' },
  travel: { icon: '✈️', color: '#a855f7' },
};

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
}

function toISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

function normalizeCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryPresentation(name: string, category?: FinanceCategory | null) {
  if (category) {
    return {
      icon: category.icon && category.icon.trim().length > 0 ? category.icon : undefined,
      color: category.color || DEFAULT_CATEGORY_COLOR,
    };
  }

  const meta = fallbackCategoryMeta[name.toLowerCase()];
  return {
    icon: meta?.icon,
    color: meta?.color ?? DEFAULT_CATEGORY_COLOR,
  };
}

function sortSummaries(a: CategorySummary, b: CategorySummary) {
  const totalDiff = b.total - a.total;
  if (totalDiff !== 0) return totalDiff;
  const orderDiff = (b.sort_order ?? 0) - (a.sort_order ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return a.name.localeCompare(b.name);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-md border border-white/10 bg-background/90 px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-white">{name}</p>
      <p className="text-text-secondary">{formatCurrency(value)}</p>
    </div>
  );
}

export default function CategoriesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<ExpenseRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [editingCategory, setEditingCategory] = useState<FinanceCategory | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    const { data, error } = await supabase
      .from('finance_categories')
      .select('*')
      .order('category_type', { ascending: true })
      .order('sort_order', { ascending: false })
      .order('name', { ascending: true });

    if (!error && data) {
      const mapped = (data as FinanceCategory[]).map((category) => ({
        ...category,
        slug: category.slug ?? normalizeCategoryName(category.name),
      }));
      const uniqueBySlug = Array.from(
        mapped.reduce((map, category) => map.set(category.slug ?? normalizeCategoryName(category.name), category), new Map<string, FinanceCategory>()).values()
      );
      setCategories(uniqueBySlug);
    } else if (error) {
      setCategories([]);
    }
    setLoadingCategories(false);
  }, [supabase]);

  const loadMonthly = useCallback(async () => {
    setLoadingMonthly(true);
    const { start, end } = getMonthBounds(selectedMonth);
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, transaction_type, category')
      .gte('date', toISODate(start))
      .lte('date', toISODate(end));

    if (!error && data) {
      setMonthlyRecords(
        (data as any[]).map((record) => ({
          amount: Number(record.amount) || 0,
          transaction_type: record.transaction_type,
          category: record.category,
        })) as ExpenseRecord[]
      );
    } else {
      setMonthlyRecords([]);
    }
    setLoadingMonthly(false);
  }, [selectedMonth, supabase]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadMonthly();
  }, [loadMonthly]);

  useEffect(() => {
    const resolveUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      setAuthChecked(true);
    };

    resolveUser();
  }, [supabase]);

  const breakdown = useMemo(() => {
    const totals = new Map<string, { expense: number; income: number; name: string }>();

    monthlyRecords.forEach((record) => {
      if (!record.category) return;
      if (record.transaction_type !== 'expense' && record.transaction_type !== 'income') return;

      const slug = normalizeCategoryName(record.category);
      if (!slug) return;

      const entry =
        totals.get(slug) ?? {
          expense: 0,
          income: 0,
          name: record.category,
        };
      if (record.transaction_type === 'income') {
        entry.income += record.amount;
      } else {
        entry.expense += record.amount;
      }
      if (!entry.name) {
        entry.name = record.category;
      }
      totals.set(slug, entry);
    });

    const totalExpense = Array.from(totals.values()).reduce((sum, entry) => sum + entry.expense, 0);
    const totalIncome = Array.from(totals.values()).reduce((sum, entry) => sum + entry.income, 0);
    const categoriesBySlug = new Map(
      categories.map((category) => [category.slug ?? normalizeCategoryName(category.name), category])
    );
    const uniqueCategories = Array.from(categoriesBySlug.entries()).map(([slug, category]) => ({
      slug,
      category,
    }));

    const expenseSummaries: CategorySummary[] = uniqueCategories
      .filter(({ category }) => category.category_type === 'expense')
      .map(({ slug, category }) => {
        const totalsForCategory = totals.get(slug) ?? { expense: 0, income: 0, name: category.name };
        const { icon, color } = getCategoryPresentation(category.name, category);
        const total = totalsForCategory.expense;
        const percentage = totalExpense > 0 ? (total / totalExpense) * 100 : 0;

        return {
          id: category.id,
          name: category.name,
          category_type: category.category_type,
          icon,
          color,
          total,
          percentage,
          sort_order: category.sort_order ?? 0,
          isVirtual: false,
          slug,
        };
      });

    const incomeSummaries: CategorySummary[] = uniqueCategories
      .filter(({ category }) => category.category_type === 'income')
      .map(({ slug, category }) => {
        const totalsForCategory = totals.get(slug) ?? { expense: 0, income: 0, name: category.name };
        const { icon, color } = getCategoryPresentation(category.name, category);
        const total = totalsForCategory.income;
        const percentage = totalIncome > 0 ? (total / totalIncome) * 100 : 0;

        return {
          id: category.id,
          name: category.name,
          category_type: category.category_type,
          icon,
          color,
          total,
          percentage,
          sort_order: category.sort_order ?? 0,
          isVirtual: false,
          slug,
        };
      });

    totals.forEach((entry, slug) => {
      if (!categoriesBySlug.has(slug)) {
        const displayName = entry.name;
        if (entry.expense > 0) {
          const { icon, color } = getCategoryPresentation(displayName);
          expenseSummaries.push({
            id: `virtual-expense-${slug}`,
            name: displayName,
            category_type: 'expense',
            icon,
          color,
          total: entry.expense,
          percentage: totalExpense > 0 ? (entry.expense / totalExpense) * 100 : 0,
          sort_order: 0,
          isVirtual: true,
          slug,
        });
      }
      if (entry.income > 0) {
        const { icon, color } = getCategoryPresentation(displayName);
        incomeSummaries.push({
            id: `virtual-income-${slug}`,
            name: displayName,
            category_type: 'income',
            icon,
          color,
          total: entry.income,
          percentage: totalIncome > 0 ? (entry.income / totalIncome) * 100 : 0,
          sort_order: 0,
          isVirtual: true,
          slug,
        });
      }
      }
    });

    expenseSummaries.sort(sortSummaries);
    incomeSummaries.sort(sortSummaries);

    return {
      expenseSummaries,
      incomeSummaries,
      totalExpense,
      totalIncome,
    };
  }, [monthlyRecords, categories]);

  const pieData = useMemo(() => {
    return breakdown.expenseSummaries
      .filter((summary) => summary.total > 0)
      .map((summary) => ({
        name: summary.name,
        value: Number(summary.total.toFixed(2)),
        color: summary.color,
      }));
  }, [breakdown.expenseSummaries]);

  const handleMonthChange = (direction: 'previous' | 'next') => {
    setSelectedMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
      return next;
    });
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingCategory(null);
    setSubmitError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (category: FinanceCategory) => {
    setDialogMode('edit');
    setEditingCategory(category);
    setSubmitError(null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (category: FinanceCategory) => {
    setDialogMode('delete');
    setEditingCategory(category);
    setSubmitError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setSubmitError(null);
    setSubmitting(false);
  };

  const handleSubmitCategory = async (values: CategoryFormData) => {
    if (!authChecked) {
      setSubmitError('Still verifying your session. Please try again.');
      return;
    }

    if (!userId) {
      setSubmitError('Sign in to manage your categories.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const payload = {
      name: values.name.trim(),
      category_type: values.category_type,
      icon: values.icon?.trim() ? values.icon.trim() : null,
      color: values.color || DEFAULT_CATEGORY_COLOR,
      sort_order: values.sort_order ?? 0,
    };

    if (dialogMode === 'edit' && editingCategory) {
      const { error } = await supabase
        .from('finance_categories')
        .update(payload)
        .eq('id', editingCategory.id);

      if (error) {
        setSubmitError(error.message);
        setSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('finance_categories')
        .insert({
          ...payload,
          user_id: userId,
        });

      if (error) {
        setSubmitError(error.message);
        setSubmitting(false);
        return;
      }
    }

    await loadCategories();
    setSubmitting(false);
    closeDialog();
  };

  const isLoading = loadingCategories || loadingMonthly;
  const showEmptyState = !isLoading && categories.length === 0 && pieData.length === 0;

  const handleDeleteCategory = async () => {
    if (!editingCategory) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('finance_categories').delete().eq('id', editingCategory.id);

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    await loadCategories();
    setSubmitting(false);
    closeDialog();
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CircleBackButton />
          <div>
            <h1 className="text-3xl font-bold text-white">Categories</h1>
            <p className="text-sm text-text-secondary">
              Track and organise where your money comes from and goes.
            </p>
          </div>
        </div>
        <Button3D variant="primary" onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button3D>
      </div>

      <GlassCard variant="strong" className="bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex items-center gap-2 pb-4">
              <PieChartIcon className="h-5 w-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Monthly Spending Split</h3>
            </div>
            <div className="h-64 w-full">
              {loadingMonthly ? (
                <div className="flex h-full items-center justify-center text-text-secondary">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : pieData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-text-secondary">
                  <AlertCircle className="h-6 w-6" />
                  <span>No expenses logged for {formatMonth(selectedMonth)} yet.</span>
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      stroke="transparent"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Selected Month</p>
                <p className="text-lg font-semibold text-white">{formatMonth(selectedMonth)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/5"
                  onClick={() => handleMonthChange('previous')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/5"
                  onClick={() => handleMonthChange('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3 pt-6">
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-text-secondary">Total Expenses</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(breakdown.totalExpense)}</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-text-secondary">Total Income</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(breakdown.totalIncome)}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {showEmptyState ? (
        <GlassCard variant="strong" className="p-10 text-center text-sm text-text-secondary" hover={false}>
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <PieChartIcon className="h-8 w-8 text-white" />
            <p>
              No categories yet. Start by adding one to keep your budgeting organised. Existing expenses
              will still show up under their categories automatically.
            </p>
            <Button3D variant="primary" onClick={openCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first category
            </Button3D>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard variant="strong">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">Expense Categories</h3>
              <span className="text-xs text-text-secondary">
                {breakdown.expenseSummaries.length} total
              </span>
            </div>
            <div className="space-y-3 pt-4">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-10 text-text-secondary">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : breakdown.expenseSummaries.length === 0 ? (
                <p className="text-sm text-text-secondary">No expense categories yet.</p>
              ) : (
                breakdown.expenseSummaries.map((summary) => {
                  const baseCategory = summary.isVirtual ? null : categories.find((item) => (item.slug ?? normalizeCategoryName(item.name)) === summary.slug) ?? null;

                  return (
                  <div
                    key={summary.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: `${summary.color}33`, color: summary.color }}
                      >
                        {summary.icon ?? '🗂️'}
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">{summary.name}</p>
                        <p className="text-xs text-text-secondary">
                          {formatCurrency(summary.total)} • {summary.percentage.toFixed(1)}%
                        </p>
                        {summary.isVirtual && (
                          <p className="text-xs text-orange-300">Auto-tracked from transactions</p>
                        )}
                      </div>
                    </div>
                    {!summary.isVirtual && baseCategory && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-secondary hover:text-white"
                          onClick={() => openEditDialog(baseCategory)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-secondary hover:text-error"
                          onClick={() => openDeleteDialog(baseCategory)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          </GlassCard>

          <GlassCard variant="strong">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">Income Categories</h3>
              <span className="text-xs text-text-secondary">
                {breakdown.incomeSummaries.length} total
              </span>
            </div>
            <div className="space-y-3 pt-4">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-10 text-text-secondary">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : breakdown.incomeSummaries.length === 0 ? (
                <p className="text-sm text-text-secondary">No income categories yet.</p>
              ) : (
                breakdown.incomeSummaries.map((summary) => {
                  const baseCategory = summary.isVirtual ? null : categories.find((item) => (item.slug ?? normalizeCategoryName(item.name)) === summary.slug) ?? null;

                  return (
                  <div
                    key={summary.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: `${summary.color}33`, color: summary.color }}
                      >
                        {summary.icon ?? '🗂️'}
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">{summary.name}</p>
                        <p className="text-xs text-text-secondary">
                          {formatCurrency(summary.total)} • {summary.percentage.toFixed(1)}%
                        </p>
                        {summary.isVirtual && (
                          <p className="text-xs text-orange-300">Auto-tracked from transactions</p>
                        )}
                      </div>
                    </div>
                    {!summary.isVirtual && baseCategory && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-secondary hover:text-white"
                          onClick={() => openEditDialog(baseCategory)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-secondary hover:text-error"
                          onClick={() => openDeleteDialog(baseCategory)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setDialogOpen(true);
          } else {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? 'Create Category'
                : dialogMode === 'edit'
                ? `Edit ${editingCategory?.name ?? 'Category'}`
                : `Delete ${editingCategory?.name ?? 'category'}?`}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === 'delete' && editingCategory ? (
            <div className="space-y-4">
              <DialogDescription className="text-text-secondary">
                This category will be removed from your list. Existing transactions that use
                it will keep their category name, but the category will become virtual until you
                add it again.
              </DialogDescription>
              {submitError && <p className="text-sm text-error">{submitError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={closeDialog} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCategory}
                  disabled={submitting}
                >
                  {submitting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>
          ) : (
            <CategoryForm
              mode={dialogMode === 'create' ? 'create' : 'edit'}
              initialValues={
                editingCategory
                  ? {
                      name: editingCategory.name,
                      category_type: editingCategory.category_type,
                      icon: editingCategory.icon,
                      color: editingCategory.color,
                      sort_order: editingCategory.sort_order,
                    }
                  : undefined
              }
              submitting={submitting}
              error={submitError}
              onSubmit={handleSubmitCategory}
              onCancel={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
