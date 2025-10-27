'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, DollarSign, Calendar, Save } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    monthly_budget: '',
    payday: '25',
    next_payday_override: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('budget_settings')
      .eq('user_id', user.id)
      .single();

    if (data?.budget_settings) {
      setSettings({
        monthly_budget: data.budget_settings.monthly_budget?.toString() || '',
        payday: data.budget_settings.payday?.toString() || '25',
        next_payday_override: data.budget_settings.next_payday_override || '',
      });
    }

    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in');
      setSaving(false);
      return;
    }

    const budgetSettings = {
      monthly_budget: settings.monthly_budget ? parseFloat(settings.monthly_budget) : null,
      payday: parseInt(settings.payday),
      next_payday_override: settings.next_payday_override || null,
    };

    // Check if user_settings exists
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('user_settings')
        .update({ budget_settings: budgetSettings })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating settings:', error);
        alert('Failed to save settings');
      } else {
        alert('Settings saved successfully!');
        router.push('/finance');
        router.refresh();
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          budget_settings: budgetSettings,
        });

      if (error) {
        console.error('Error inserting settings:', error);
        alert('Failed to save settings');
      } else {
        alert('Settings saved successfully!');
        router.push('/finance');
        router.refresh();
      }
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Finance Settings</h1>
          <p className="text-muted-foreground">Configure your budget and payday</p>
        </div>
      </div>

      {/* Monthly Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthly_budget">Monthly Budget (RM)</Label>
            <Input
              id="monthly_budget"
              type="number"
              step="0.01"
              placeholder="e.g., 3000"
              value={settings.monthly_budget}
              onChange={(e) => setSettings({ ...settings, monthly_budget: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Your target spending limit for the month. Used in "Available to Spend" calculation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payday Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payday Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payday">Default Payday (Day of Month)</Label>
            <Select
              value={settings.payday}
              onValueChange={(value) => setSettings({ ...settings, payday: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your regular payday. Used to calculate "Available to Spend" by excluding bills due before next payday.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_payday_override">Override Next Payday (Optional)</Label>
            <Input
              id="next_payday_override"
              type="date"
              value={settings.next_payday_override}
              onChange={(e) => setSettings({ ...settings, next_payday_override: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Use this if your next payday is different from your regular schedule (e.g., holidays, bonus payments).
              Leave empty to use default payday.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How Available to Spend Works */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 text-base">How "Available to Spend" Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-medium">Formula:</p>
            <p className="pl-4">
              (Total in savings/checking accounts)<br />
              - (BNPL installments due before next payday)<br />
              - (Credit card minimum payments due before next payday)<br />
              = Available to Spend
            </p>
            <p className="mt-4">
              <strong>Example:</strong> If you have RM 5,000 in accounts, but RM 500 in bills due before next payday,
              your available to spend is RM 4,500. This helps you avoid overspending.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/finance">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
