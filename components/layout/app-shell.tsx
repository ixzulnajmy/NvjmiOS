// file: components/layout/app-shell.tsx
"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  detail?: React.ReactNode;
  showDetail?: boolean;
}

export function AppShell({ children, detail, showDetail = true }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      <TopNav onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-background/95 h-[calc(100vh-3.5rem)] sticky top-14">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <main className="flex-1 flex">
          {/* Middle Section - List/Content */}
          <div className={cn("flex-1 overflow-auto", showDetail && "lg:border-r")}>
            {children}
          </div>

          {/* Right Section - Detail/Insights */}
          {showDetail && detail && (
            <aside className="hidden lg:block w-96 xl:w-[420px] bg-muted/20 overflow-auto h-[calc(100vh-3.5rem)] sticky top-14">
              {detail}
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
