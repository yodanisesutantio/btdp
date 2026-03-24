"use client";

import { AppCommand } from "@/components/app-command";
import { AppSidebar } from "@/components/app-sidebar";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface RootLayoutEffectProps {
  children: React.ReactNode;
}

export function RootLayoutEffect({ children }: RootLayoutEffectProps) {
  const [openCommand, setOpenCommand] = useState(false);
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar setOpenCommand={setOpenCommand} />

        <main className="flex flex-1 flex-col">
          <div className="flex border-b">
            <SidebarTrigger />
            {pathname !== "/" && (
              <>
                <div className="py-2 ps-2 pe-4">
                  <Separator orientation="vertical" className="h-full" />
                </div>
                <PageBreadcrumbs />
              </>
            )}
          </div>
          {children}
        </main>
      </div>

      <AppCommand open={openCommand} setOpen={setOpenCommand} />
    </SidebarProvider>
  );
}
