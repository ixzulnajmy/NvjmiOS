// file: components/layout/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  HeartPulse,
  Briefcase,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Calendar,
  Home,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { moduleTree } from "@/lib/mock-data";
import type { Module } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  today: <Home className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  inbox: <Inbox className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  money: <Wallet className="h-4 w-4" />,
  life: <HeartPulse className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(["money", "life", "work", "documents"])
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const renderModule = (module: Module, depth = 0) => {
    const hasSubModules = module.subModules && module.subModules.length > 0;
    const isExpanded = expandedModules.has(module.id);
    const isActive = pathname === module.path;

    return (
      <div key={module.id}>
        {hasSubModules ? (
          <>
            {/* Parent module with expand/collapse */}
            <div className="px-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-8 px-3 py-2 rounded-md font-medium text-sm transition-colors",
                  depth === 0 && "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                onClick={() => toggleModule(module.id)}
              >
                {iconMap[module.id]}
                <span className="flex-1 text-left">{module.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Sub-modules */}
            {isExpanded && (
              <div className="space-y-0.5">
                {module.subModules?.map((subModule) => (
                  <div key={subModule.id} className="px-2 pl-4">
                    <Link href={subModule.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-8 px-3 py-2 rounded-md text-sm font-normal transition-colors",
                          pathname === subModule.path
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent/60 hover:text-foreground"
                        )}
                      >
                        {subModule.name}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Single module without sub-modules
          <div className="px-2">
            <Link href={module.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-8 px-3 py-2 rounded-md font-medium text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {iconMap[module.id]}
                <span>{module.name}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      <div className="flex-1 overflow-y-auto px-0">
        <div className="space-y-1 pt-4 pb-4">
          {moduleTree.map((module) => renderModule(module))}
        </div>
      </div>
    </div>
  );
}
