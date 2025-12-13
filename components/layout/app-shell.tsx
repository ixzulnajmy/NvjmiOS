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
    <div className="h-screen bg-background text-foreground">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* FIXED TOPBAR */}
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b bg-background/80 backdrop-blur">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
      </header>

      {/* FIXED SIDEBAR */}
      <aside className="hidden lg:block fixed left-0 top-14 bottom-0 z-30 w-64 border-r bg-card/80 backdrop-blur">
        <Sidebar />
      </aside>

      {/* SCROLLABLE CONTENT AREA ONLY */}
      <main className="absolute inset-x-0 bottom-0 top-14 lg:ml-64 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          {/* Middle Section - List/Content */}
          <div className={cn("flex-1 overflow-y-auto", showDetail && "lg:border-r")}>
            {children}
          </div>

          {/* Right Section - Detail/Insights */}
          {showDetail && detail && (
            <aside className="hidden lg:block w-96 xl:w-[420px] bg-muted/20 overflow-y-auto">
              {detail}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
