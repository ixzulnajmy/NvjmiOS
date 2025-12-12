// file: app/work/tasks/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockTasks } from "@/lib/mock-data";
import { Task } from "@/lib/types";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

const statusColors = {
  todo: "bg-gray-500/10 text-gray-500",
  in_progress: "bg-blue-500/10 text-blue-500",
  blocked: "bg-red-500/10 text-red-500",
  done: "bg-green-500/10 text-green-500",
};

const priorityColors = {
  low: "text-gray-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(mockTasks[0]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredTasks = mockTasks.filter((task) =>
    statusFilter ? task.status === statusFilter : true
  );

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedTask && (
          <DetailPanel
            title={selectedTask.title}
            subtitle={selectedTask.project}
            sections={[
              {
                title: "Task Details",
                content: (
                  <div className="space-y-4">
                    {selectedTask.description && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Description</label>
                        <p className="text-sm">{selectedTask.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Status</label>
                        <Badge className={statusColors[selectedTask.status]}>
                          {selectedTask.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Priority</label>
                        <Badge className={priorityColors[selectedTask.priority]}>
                          {selectedTask.priority}
                        </Badge>
                      </div>
                    </div>

                    {selectedTask.dueDate && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Due Date</label>
                        <p className="text-sm">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    {selectedTask.project && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Project</label>
                        <Badge variant="secondary">{selectedTask.project}</Badge>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedTask.tags} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Created</label>
                        <p className="text-sm">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Updated</label>
                        <p className="text-sm">{new Date(selectedTask.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Tasks"
          description="Manage your work tasks and projects"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          }
        />

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-9" />
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
              variant={statusFilter === "todo" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("todo")}
            >
              To Do
            </Button>
            <Button
              variant={statusFilter === "in_progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("in_progress")}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === "done" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("done")}
            >
              Done
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={cn(
                    "cursor-pointer",
                    selectedTask?.id === task.id && "bg-muted"
                  )}
                  onClick={() => setSelectedTask(task)}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    {task.project && (
                      <Badge variant="secondary" className="text-xs">
                        {task.project}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", statusColors[task.status])}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", priorityColors[task.priority])}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
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
