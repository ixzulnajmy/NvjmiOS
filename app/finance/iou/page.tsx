import { GlassCard } from '@/components/ui/glass-card';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { Button3D } from '@/components/ui/button-3d';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default async function IOUPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all IOUs
  const { data: ious } = await supabase
    .from('iou_debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Calculate totals
  const theyOweMe = ious?.filter(iou => iou.direction === 'they_owe_me' && iou.status === 'active')
    .reduce((sum, iou) => sum + iou.amount, 0) || 0;

  const iOweThem = ious?.filter(iou => iou.direction === 'i_owe_them' && iou.status === 'active')
    .reduce((sum, iou) => sum + iou.amount, 0) || 0;

  const netPosition = theyOweMe - iOweThem;

  // Group IOUs
  const activeTheyOweMe = ious?.filter(iou => iou.direction === 'they_owe_me' && iou.status === 'active') || [];
  const activeIOweThem = ious?.filter(iou => iou.direction === 'i_owe_them' && iou.status === 'active') || [];
  const settledIOUs = ious?.filter(iou => iou.status === 'paid') || [];

  // Check for overdue
  const today = new Date();
  const checkOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < today;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">IOU Tracker</h1>
          <p className="text-sm text-text-secondary">Track money lent and borrowed</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard variant="strong" className="bg-gradient-to-br from-green-900/20 to-emerald-900/20">
          <div className="text-center">
            <ArrowDownCircle className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-xs text-text-secondary mb-1">They Owe Me</p>
            <p className="text-xl font-bold text-success">
              {formatCurrency(theyOweMe)}
            </p>
          </div>
        </GlassCard>

        <GlassCard variant="strong" className="bg-gradient-to-br from-red-900/20 to-orange-900/20">
          <div className="text-center">
            <ArrowUpCircle className="h-6 w-6 text-error mx-auto mb-2" />
            <p className="text-xs text-text-secondary mb-1">I Owe Them</p>
            <p className="text-xl font-bold text-error">
              {formatCurrency(iOweThem)}
            </p>
          </div>
        </GlassCard>

        <GlassCard variant="strong" className={`bg-gradient-to-br ${netPosition >= 0 ? 'from-green-900/20 to-blue-900/20' : 'from-red-900/20 to-pink-900/20'}`}>
          <div className="text-center">
            <Users className="h-6 w-6 text-white mx-auto mb-2" />
            <p className="text-xs text-text-secondary mb-1">Net Position</p>
            <p className={`text-xl font-bold ${netPosition >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(Math.abs(netPosition))}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Add IOU Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/finance/iou/new?direction=they_owe_me">
          <Button3D variant="primary" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            They Owe Me
          </Button3D>
        </Link>
        <Link href="/finance/iou/new?direction=i_owe_them">
          <Button3D variant="secondary" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            I Owe Them
          </Button3D>
        </Link>
      </div>

      {/* They Owe Me Section */}
      {activeTheyOweMe.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white px-1 flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-success" />
            They Owe Me
          </h3>
          <GlassCard variant="strong">
            <div className="space-y-2">
              {activeTheyOweMe.map((iou) => {
                const isOverdue = checkOverdue(iou.due_date);
                return (
                  <Link key={iou.id} href={`/finance/iou/${iou.id}`}>
                    <div className="glass-light rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">{iou.person_name}</p>
                          <p className="text-sm text-text-secondary">{iou.description || 'No description'}</p>
                        </div>
                        <p className="text-xl font-bold text-success">
                          {formatCurrency(iou.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(iou.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {iou.due_date && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-error' : ''}`}>
                            <Clock className="h-3 w-3" />
                            Due: {new Date(iou.due_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                            {isOverdue && ' (Overdue)'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* I Owe Them Section */}
      {activeIOweThem.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white px-1 flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-error" />
            I Owe Them
          </h3>
          <GlassCard variant="strong">
            <div className="space-y-2">
              {activeIOweThem.map((iou) => {
                const isOverdue = checkOverdue(iou.due_date);
                return (
                  <Link key={iou.id} href={`/finance/iou/${iou.id}`}>
                    <div className="glass-light rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">{iou.person_name}</p>
                          <p className="text-sm text-text-secondary">{iou.description || 'No description'}</p>
                        </div>
                        <p className="text-xl font-bold text-error">
                          {formatCurrency(iou.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(iou.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {iou.due_date && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-error' : ''}`}>
                            <Clock className="h-3 w-3" />
                            Due: {new Date(iou.due_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                            {isOverdue && ' (Overdue)'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Empty State */}
      {activeTheyOweMe.length === 0 && activeIOweThem.length === 0 && (
        <GlassCard variant="strong">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Active IOUs</h3>
            <p className="text-text-secondary mb-6">Start tracking money you&apos;ve lent or borrowed</p>
            <div className="flex gap-3 justify-center">
              <Link href="/finance/iou/new?direction=they_owe_me">
                <Button3D variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  They Owe Me
                </Button3D>
              </Link>
              <Link href="/finance/iou/new?direction=i_owe_them">
                <Button3D variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  I Owe Them
                </Button3D>
              </Link>
            </div>
          </div>
        </GlassCard>
      )}

      {/* History Section - Collapsible */}
      {settledIOUs.length > 0 && (
        <details className="space-y-3">
          <summary className="text-lg font-semibold text-white px-1 cursor-pointer flex items-center gap-2 hover:text-success transition-colors">
            <CheckCircle className="h-5 w-5" />
            Settled IOUs ({settledIOUs.length})
          </summary>
          <GlassCard variant="strong" className="mt-3">
            <div className="space-y-2">
              {settledIOUs.map((iou) => (
                <div key={iou.id} className="glass-light rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-white">{iou.person_name}</p>
                      <p className="text-xs text-text-secondary">{iou.description || 'No description'}</p>
                    </div>
                    <p className={`font-bold ${iou.direction === 'they_owe_me' ? 'text-success' : 'text-error'}`}>
                      {formatCurrency(iou.amount)}
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {iou.direction === 'they_owe_me' ? 'They owed me' : 'I owed them'} • Settled
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </details>
      )}
    </div>
  );
}
