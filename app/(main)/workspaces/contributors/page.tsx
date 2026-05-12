"use client";

import { InBetweenSections, PageTitleSections } from "@/components/sections";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserData } from "../../users/page";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface WorkspaceContributors {
  uuid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export default function WorkspaceContributorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkspaceContributorsPageInnerContent />
    </Suspense>
  );
}

function WorkspaceContributorsPageInnerContent() {
  const [openTransferOwnership, setOpenTransferOwnership] = useState(false);
  const [workspaceContributors, setWorkspaceContributors] = useState<
    WorkspaceContributors[]
  >([]);
  const [openContributorSearch, setOpenContributorSearch] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<WorkspaceContributors | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);

  const searchParams = useSearchParams();
  const workspaceUuid = searchParams.get("uuid");

  const fetchWorkspaceContributors = async () => {
    setLoading(true);

    try {
      if (!workspaceUuid) {
        toast.error("Workspace uuid is required", {
          position: "top-right",
        });

        return;
      }

      const res = await fetch(
        `/api/workspaces/contributors?q=${workspaceUuid}`,
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error("Operation Failed!", {
          description: json.error,
          position: "top-right",
        });

        return;
      }

      setWorkspaceContributors(json.data ?? []);
    } catch (err) {
      console.error(err);

      toast.error("Operation Failed!", {
        description: "Something went wrong",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    contributor: WorkspaceContributors,
    value: string,
  ) => {
    if (value === "Owner") {
      setSelectedUser(contributor);
      setSelectedRole(value);
      setOpenTransferOwnership(true);
      return;
    }
    const res = await fetch("/api/workspaces/contributors", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspace_uuid: workspaceUuid,
        user_uuid: contributor.uuid,
        role: value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }

    fetchWorkspaceContributors();
    toast.success("Contributor's Role is changed successfully", {
      position: "top-right",
    });
  };

  const handleAddContributor = async (user: UserData) => {
    const res = await fetch("/api/workspaces/contributors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspace_uuid: workspaceUuid,
        user_uuid: user.uuid,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });

      return;
    }

    toast.success("Contributor added successfully", {
      position: "top-right",
    });

    fetchWorkspaceContributors();

    setQuery("");
    setUsers([]);
    setOpenContributorSearch(false);
  };

  const handleDeleteContributor = async (
    contributor: WorkspaceContributors,
  ) => {
    try {
      const res = await fetch("/api/workspaces/contributors", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspace_uuid: workspaceUuid,
          user_uuid: contributor.uuid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Operation Failed!", {
          description: data.error,
          position: "top-right",
        });

        return;
      }

      fetchWorkspaceContributors();

      toast.success("Contributor removed successfully", {
        position: "top-right",
      });

      setOpenDelete(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);

      toast.error("Something went wrong", {
        position: "top-right",
      });
    }
  };

  const handleTransferOwnership = async (
    selectedUser: WorkspaceContributors,
    selectedRole: string,
  ) => {
    if (!selectedUser) return;

    const res = await fetch("/api/workspaces/contributors", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspace_uuid: workspaceUuid,
        user_uuid: selectedUser.uuid,
        role: selectedRole,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });

      return;
    }

    toast.success("Workspace ownership transferred successfully", {
      position: "top-right",
    });

    setOpenTransferOwnership(false);
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) {
        setUsers([]);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(`/api/users/search?q=${query}`);

        const data = await res.json();

        if (res.ok) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    fetchWorkspaceContributors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Workspace Contributors Page!"
        pageDescription={`Manage your workspace contributors effectively.`}
      />

      <InBetweenSections>
        <div className="col-span-12">
          <div className="flex justify-end gap-2 w-full mb-2">
            <Popover
              open={openContributorSearch}
              onOpenChange={setOpenContributorSearch}
            >
              <PopoverTrigger>
                <Button size="sm" className={`cursor-pointer`}>
                  Add Contributor
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[350px] p-0" align="end">
                <Command className="rounded-lg border-0">
                  <CommandInput
                    placeholder="Search users..."
                    value={query}
                    onValueChange={setQuery}
                  />

                  <CommandList>
                    <CommandEmpty>
                      {loading ? "Searching..." : "No users found."}
                    </CommandEmpty>

                    <CommandGroup>
                      {users.map((user) => (
                        <CommandItem
                          key={user.uuid}
                          value={user.username}
                          onSelect={async () => {
                            handleAddContributor(user);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-start">
                            <span>
                              {user.first_name} {user.last_name}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              @{user.username}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              onClick={fetchWorkspaceContributors}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Refetch Contributors"}
            </Button>
          </div>
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="!w-[39%]">Full Name</TableHead>
                <TableHead className="!w-[33%]">Username</TableHead>
                <TableHead className="!w-[20%]">Role</TableHead>
                <TableHead className="text-center !w-[8%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaceContributors.map((contributor, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium !w-[39%]">
                    <div className="truncate">
                      {`${contributor.first_name} ${contributor.last_name}`}
                    </div>
                  </TableCell>
                  <TableCell className="!w-[33%]">
                    <div className="truncate">{contributor.username}</div>
                  </TableCell>
                  <TableCell className="!w-[20%]">
                    {contributor.role === "Owner" ? (
                      <div className="truncate">{contributor.role}</div>
                    ) : (
                      <Select
                        value={contributor.role}
                        onValueChange={async (value) => {
                          await handleRoleChange(contributor, value ?? "");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Owner">
                            <div className="flex flex-col">
                              <span>Owner</span>
                              <span className="text-xs text-muted-foreground">
                                Full control
                              </span>
                            </div>
                          </SelectItem>

                          <SelectItem value="Admin">
                            <div className="flex flex-col">
                              <span>Admin</span>
                              <span className="text-xs text-muted-foreground">
                                Workspace management
                              </span>
                            </div>
                          </SelectItem>

                          <SelectItem value="Editor">
                            <div className="flex flex-col">
                              <span>Editor</span>
                              <span className="text-xs text-muted-foreground">
                                Full collaboration
                              </span>
                            </div>
                          </SelectItem>

                          <SelectItem value="Contributor">
                            <div className="flex flex-col">
                              <span>Contributor</span>
                              <span className="text-xs text-muted-foreground">
                                Limited collaboration
                              </span>
                            </div>
                          </SelectItem>

                          <SelectItem value="Viewer">
                            <div className="flex flex-col">
                              <span>Viewer</span>
                              <span className="text-xs text-muted-foreground">
                                Read only
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-center !w-[8%]">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={`cursor-pointer`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 cursor-pointer"
                        >
                          <MoreHorizontal />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={`w-40`}>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(contributor);
                            setOpenDelete(true);
                          }}
                          className={`cursor-pointer`}
                        >
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </InBetweenSections>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contributor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contributor?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className={`cursor-pointer`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedUser) {
                  await handleDeleteContributor(selectedUser);
                }
                setOpenDelete(false);
              }}
              className={`cursor-pointer`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={openTransferOwnership}
        onOpenChange={setOpenTransferOwnership}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Workspace Ownership?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will transfer full workspace ownership to{" "}
              <span className="font-semibold">{selectedUser?.username}</span>
              .
              <br />
              <br />
              The selected user will gain complete control over this workspace,
              including member management, workspace settings, and permissions.
              Your current role may also be downgraded automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className={`cursor-pointer`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={() =>
                handleTransferOwnership(
                  selectedUser ?? { uuid: "" },
                  selectedRole,
                )
              }
            >
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
