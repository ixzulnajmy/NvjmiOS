// file: app/work/projects/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockProjects } from "@/lib/mock-data";
import { Project } from "@/lib/types";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

const statusColors = {
  planning: "bg-gray-500/10 text-gray-500",
  active: "bg-green-500/10 text-green-500",
  on_hold: "bg-yellow-500/10 text-yellow-500",
  completed: "bg-blue-500/10 text-blue-500",
  archived: "bg-gray-500/10 text-gray-500",
};

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(mockProjects[0]);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedProject && (
          <DetailPanel
            title={selectedProject.name}
            subtitle={selectedProject.status}
            sections={[
              {
                title: "Project Details",
                content: (
                  <div className="space-y-4">
                    {selectedProject.description && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Description</label>
                        <p className="text-sm">{selectedProject.description}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{selectedProject.progress}%</span>
                      </div>
                      <Progress value={selectedProject.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedProject.startDate && (
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Start Date</label>
                          <p className="text-sm">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedProject.endDate && (
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">End Date</label>
                          <p className="text-sm">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {selectedProject.nextMilestone && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Next Milestone</label>
                        <p className="text-sm font-medium">{selectedProject.nextMilestone}</p>
                      </div>
                    )}

                    {selectedProject.team && selectedProject.team.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Team</label>
                        <div className="flex flex-wrap gap-1">
                          {selectedProject.team.map((member) => (
                            <Badge key={member} variant="secondary" className="text-xs">
                              {member}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedProject.tags} />
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
          title="Projects"
          description="Manage your work projects and initiatives"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent/50",
                selectedProject?.id === project.id && "border-primary bg-accent"
              )}
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge className={statusColors[project.status]}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                {project.nextMilestone && (
                  <p className="text-xs text-muted-foreground">
                    Next: {project.nextMilestone}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
