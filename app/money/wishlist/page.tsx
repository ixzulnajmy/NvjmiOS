// file: app/money/wishlist/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockWishlistItems } from "@/lib/mock-data";
import { WishlistItem } from "@/lib/types";
import { Plus, Search, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { InsightCard } from "@/components/shared/insight-card";

export default function WishlistPage() {
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(mockWishlistItems[0]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredItems = mockWishlistItems.filter((item) =>
    statusFilter ? item.status === statusFilter : true
  );

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedItem && (
          <DetailPanel
            title={selectedItem.name}
            subtitle={selectedItem.category}
            sections={[
              {
                title: "Details",
                content: (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.description || "No description"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estimated Cost</label>
                        <p className="text-lg font-semibold">RM {selectedItem.estimatedCost.toFixed(2)}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Saved Amount</label>
                        <p className="text-lg font-semibold text-green-500">
                          RM {(selectedItem.savedAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Savings Progress</label>
                      <Progress
                        value={((selectedItem.savedAmount || 0) / selectedItem.estimatedCost) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(((selectedItem.savedAmount || 0) / selectedItem.estimatedCost) * 100).toFixed(1)}% saved
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i <= selectedItem.priority
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Badge variant="secondary">{selectedItem.status.replace("_", " ")}</Badge>
                    </div>

                    {selectedItem.url && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product URL</label>
                        <a
                          href={selectedItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View Product <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {selectedItem.targetDate && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Date</label>
                        <p className="text-sm">{new Date(selectedItem.targetDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags</label>
                      <TagList tags={selectedItem.tags} />
                    </div>

                    {selectedItem.notes && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <p className="text-sm text-muted-foreground">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Insights",
                content: (
                  <InsightCard
                    insight={[
                      `You need RM ${(selectedItem.estimatedCost - (selectedItem.savedAmount || 0)).toFixed(2)} more to reach your goal.`,
                      selectedItem.savedAmount && selectedItem.savedAmount > 0
                        ? `At your current rate, you'll reach your goal in ${Math.ceil(
                            (selectedItem.estimatedCost - selectedItem.savedAmount) / 500
                          )} months.`
                        : "Start saving to track your progress!",
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
          title="Wishlist"
          description="Track things you want to buy and save for them"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          }
        />

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search wishlist..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "wishlist" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("wishlist")}
            >
              Wishlist
            </Button>
            <Button
              variant={statusFilter === "researching" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("researching")}
            >
              Researching
            </Button>
            <Button
              variant={statusFilter === "saved_for" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("saved_for")}
            >
              Saved For
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer",
                    selectedItem?.id === item.id && "bg-muted"
                  )}
                  onClick={() => setSelectedItem(item)}
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i <= item.priority ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress
                        value={((item.savedAmount || 0) / item.estimatedCost) * 100}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {(((item.savedAmount || 0) / item.estimatedCost) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    RM {item.estimatedCost.toFixed(2)}
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
