"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Blocks,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  LayoutPanelLeft,
  Search,
  Sheet,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "./ui/separator";

export interface AppSidebarProps {
  setOpenCommand?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AppSidebar(props: AppSidebarProps) {
  return (
    <>
      <Sidebar>
        {/* Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="flex gap-2 h-fit">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <SidebarMenuButton>
                    Select Workspace
                    <ChevronDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuItem>
                    <span>Acme Inc</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent("Random User")}`}
                alt="random user avatar"
                className="rounded-full w-8 h-8 shrink-0 object-cover cursor-pointer"
                width={24}
                height={24}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        {/* Content */}
        <SidebarContent className="flex flex-col gap-2 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton>
                  <Home /> Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup className="px-0">
            <SidebarGroupLabel>Features</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/tasks">
                  <SidebarMenuButton>
                    <LayoutPanelLeft /> Tasks Board
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/sheets">
                  <SidebarMenuButton>
                    <Sheet /> Sheets
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/timelines">
                  <SidebarMenuButton>
                    <Blocks /> Timelines
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/notes">
                  <SidebarMenuButton>
                    <FileText /> Notes
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="px-2">
          <Separator />
        </div>
        {/* Footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() =>
                  props.setOpenCommand && props.setOpenCommand(true)
                }
              >
                <Search /> Search
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/help">
                <SidebarMenuButton>
                  <HelpCircle /> Help
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        {/* Rail */}
        <SidebarRail />
      </Sidebar>
    </>
  );
}
