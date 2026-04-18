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
  Power,
  Search,
  Sheet,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface AppSidebarProps {
  setOpenCommand?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AppSidebar(props: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  const user = localStorage.getItem("user");

  const handleSignOut = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("/api/signout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch (err) {
        toast.error("Failed to sign out.", {
          description: "Please try again later. Or contact support.",
        });
        console.error(err);
      }
    }

    localStorage.clear();
    router.replace("/signin");
  };

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
              {(() => {
                const userObj = user ? JSON.parse(user) : null;

                return (
                  <Tooltip>
                    <TooltipTrigger className={`shrink-0`}>
                      <Link href={`/profile`}>
                        <Image
                          src={`https://ui-avatars.com/api/?name=${`${userObj?.first_name || ""} ${userObj?.last_name || ""}`.trim()}`}
                          alt={`${userObj?.username || ""}`}
                          className="rounded-full w-8 h-8 shrink-0 object-cover cursor-pointer"
                          width={24}
                          height={24}
                          unoptimized
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      {userObj?.first_name} {userObj?.last_name}
                    </TooltipContent>
                  </Tooltip>
                );
              })()}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        {/* Content */}
        <SidebarContent className="flex flex-col gap-2 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/home">
                <SidebarMenuButton
                  className={isActive("/home") ? "bg-muted font-semibold" : ""}
                >
                  <Home /> Home
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup className="px-0">
            <SidebarGroupLabel>Features</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/tasks">
                  <SidebarMenuButton
                    className={
                      isActive("/tasks") ? "bg-muted font-semibold" : ""
                    }
                  >
                    <LayoutPanelLeft
                      strokeWidth={isActive("/tasks") ? 2.5 : 2}
                    />{" "}
                    Tasks Board
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/sheets">
                  <SidebarMenuButton
                    className={
                      isActive("/sheets") ? "bg-muted font-semibold" : ""
                    }
                  >
                    <Sheet strokeWidth={isActive("/sheets") ? 2.5 : 2} /> Sheets
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/timelines">
                  <SidebarMenuButton
                    className={
                      isActive("/timelines") ? "bg-muted font-semibold" : ""
                    }
                  >
                    <Blocks strokeWidth={isActive("/timelines") ? 2.5 : 2} />{" "}
                    Timelines
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/notes">
                  <SidebarMenuButton
                    className={
                      isActive("/notes") ? "bg-muted font-semibold" : ""
                    }
                  >
                    <FileText strokeWidth={isActive("/notes") ? 2.5 : 2} />
                    Notes
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {(() => {
            const userObj = user ? JSON.parse(user) : null;
            return (
              userObj?.username === "administrator" && (
                <>
                  <Separator />
                  <SidebarGroup className="px-0">
                    <SidebarGroupLabel>For Administrators</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Link href="/users">
                          <SidebarMenuButton
                            className={
                              isActive("/users") ? "bg-muted font-semibold" : ""
                            }
                          >
                            <Users strokeWidth={isActive("/users") ? 2.5 : 2} />
                            Users
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </>
              )
            );
          })()}
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
            <Separator />
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-red-500 font-semibold hover:bg-red-500/15 hover:text-red-500 duration-300"
                onClick={handleSignOut}
              >
                <Power strokeWidth={3} /> Sign Out
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        {/* Rail */}
        <SidebarRail />
      </Sidebar>
    </>
  );
}
