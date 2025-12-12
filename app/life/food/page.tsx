// file: app/life/food/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockFoodLog } from "@/lib/mock-data";
import { FoodLogEntry } from "@/lib/types";
import { Plus, Search, Utensils, ImageIcon, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { InsightCard } from "@/components/shared/insight-card";

export default function FoodLogPage() {
  const [selectedEntry, setSelectedEntry] = useState<FoodLogEntry | null>(mockFoodLog[0] || null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case "great":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "satisfied":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "neutral":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "bad":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "lunch":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "dinner":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "snack":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedEntry && (
          <DetailPanel
            title={selectedEntry.description}
            subtitle={`${new Date(selectedEntry.date).toLocaleDateString()} at ${selectedEntry.time}`}
            sections={[
              {
                title: "Meal Image",
                icon: <ImageIcon className="h-4 w-4" />,
                content: (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                ),
              },
              {
                title: "Nutrition",
                icon: <Utensils className="h-4 w-4" />,
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Calories</span>
                        <span className="font-medium">{selectedEntry.calories} kcal</span>
                      </div>
                    </div>
                    {selectedEntry.protein !== undefined && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Protein</p>
                          <p className="text-sm font-medium">{selectedEntry.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="text-sm font-medium">{selectedEntry.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Fats</p>
                          <p className="text-sm font-medium">{selectedEntry.fats}g</p>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Details",
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Meal Type</label>
                      <Badge variant="secondary" className={cn("capitalize", getMealTypeColor(selectedEntry.mealType))}>
                        {selectedEntry.mealType}
                      </Badge>
                    </div>
                    {selectedEntry.location && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Location</label>
                        <p className="text-sm">{selectedEntry.location}</p>
                      </div>
                    )}
                    {selectedEntry.mood && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Mood</label>
                        <Badge variant="secondary" className={cn("capitalize", getMoodColor(selectedEntry.mood))}>
                          {selectedEntry.mood}
                        </Badge>
                      </div>
                    )}
                    {selectedEntry.waterIntake !== undefined && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Droplet className="h-3 w-3" />
                          Water Intake
                        </label>
                        <p className="text-sm">{selectedEntry.waterIntake}L</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Tags",
                content: <TagList tags={selectedEntry.tags} />,
              },
              ...(selectedEntry.notes
                ? [
                    {
                      title: "Notes",
                      content: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedEntry.notes}
                        </p>
                      ),
                    },
                  ]
                : []),
              {
                title: "Insights",
                content: (
                  <InsightCard
                    insight={[
                      "AI-powered meal analysis and nutritional recommendations will appear here.",
                      "Track patterns in eating habits and identify healthy meal combinations.",
                      "Monitor calorie distribution throughout the day.",
                    ]}
                  />
                ),
              },
            ]}
          />
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Food Log"
          description="Track your meals and nutrition"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Meal Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Meal Entry</DialogTitle>
                  <DialogDescription>
                    Log a new meal with nutritional information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="meal-description">Meal Description</Label>
                    <Input id="meal-description" placeholder="e.g., Chicken salad with avocado" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meal-date">Date</Label>
                      <Input id="meal-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meal-time">Time</Label>
                      <Input id="meal-time" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select>
                      <SelectTrigger id="meal-type">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., Home, Restaurant name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input id="calories" type="number" placeholder="e.g., 450" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input id="protein" type="number" placeholder="e.g., 25" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input id="carbs" type="number" placeholder="e.g., 40" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fats">Fats (g)</Label>
                      <Input id="fats" type="number" placeholder="e.g., 15" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="water">Water Intake (L)</Label>
                    <Input id="water" type="number" step="0.1" placeholder="e.g., 0.5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood</Label>
                    <Select>
                      <SelectTrigger id="mood">
                        <SelectValue placeholder="How did you feel?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="great">Great</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="satisfied">Satisfied</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="bad">Bad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Any additional notes about this meal..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="e.g., healthy, home-cooked, quick" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Save Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search meals..." className="pl-9" />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Mood</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFoodLog.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={cn(
                    "cursor-pointer",
                    selectedEntry?.id === entry.id && "bg-muted"
                  )}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.time}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{entry.description}</p>
                      <Badge variant="secondary" className={cn("text-xs capitalize", getMealTypeColor(entry.mealType))}>
                        {entry.mealType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{entry.calories}</span>
                    <span className="text-xs text-muted-foreground ml-1">kcal</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{entry.location || "-"}</span>
                  </TableCell>
                  <TableCell>
                    {entry.mood ? (
                      <Badge variant="secondary" className={cn("text-xs capitalize", getMoodColor(entry.mood))}>
                        {entry.mood}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
