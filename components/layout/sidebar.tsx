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
import { ScrollArea } from "@/components/ui/scroll-area";
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
            <div className="px-3 py-1.5">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-8 px-2 font-medium text-sm",
                  depth === 0 && "text-muted-foreground"
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
              <div className="ml-2 space-y-0.5">
                {module.subModules?.map((subModule) => (
                  <Link key={subModule.id} href={subModule.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 h-8 px-3 text-sm font-normal",
                        pathname === subModule.path &&
                          "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      {subModule.name}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          // Single module without sub-modules
          <div className="px-3 py-1.5">
            <Link href={module.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-8 px-2 font-medium text-sm",
                  isActive && "bg-accent text-accent-foreground"
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
    <div className={cn("pb-12 w-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
            NVJMIOS
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">{moduleTree.map((module) => renderModule(module))}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
