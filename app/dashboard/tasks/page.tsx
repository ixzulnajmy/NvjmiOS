import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import { CheckSquare, ListTodo, Target, Zap } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-text-secondary">Manage your to-dos</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <GlassCard variant="strong" className="bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <ListTodo className="h-20 w-20 text-white/20" />
            <CheckSquare className="h-10 w-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">Task Management Coming Soon</h3>
            <p className="text-sm text-text-secondary max-w-md">
              Create, organize, and complete your tasks with powerful productivity features and smart reminders.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Future Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard variant="strong" hover={false}>
          <div className="flex flex-col items-center text-center space-y-2 py-4">
            <Target className="h-8 w-8 text-white" />
            <h4 className="text-sm font-semibold text-white">Goals</h4>
            <p className="text-xs text-text-secondary">Set objectives</p>
          </div>
        </GlassCard>

        <GlassCard variant="strong" hover={false}>
          <div className="flex flex-col items-center text-center space-y-2 py-4">
            <Zap className="h-8 w-8 text-white" />
            <h4 className="text-sm font-semibold text-white">Quick Add</h4>
            <p className="text-xs text-text-secondary">Fast entry</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
