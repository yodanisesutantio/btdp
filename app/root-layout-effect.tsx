"use client";

import { AppCommand } from "@/components/app-command";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export interface RootLayoutEffectProps {
  children: React.ReactNode;
}

export function RootLayoutEffect({ children }: RootLayoutEffectProps) {
  const [openCommand, setOpenCommand] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar setOpenCommand={setOpenCommand} />

        <main className="flex flex-1 flex-col">
          <SidebarTrigger />
          {children}
        </main>
      </div>

      <AppCommand open={openCommand} setOpen={setOpenCommand} />
    </SidebarProvider>
  );
}
