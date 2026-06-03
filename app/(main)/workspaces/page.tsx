"use client";

import { InBetweenSections, PageTitleSections } from "@/components/sections";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DialogStickyFooter } from "@/components/app-sticky-footer-dialog";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/helper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
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

export interface WorkspaceData {
  uuid?: string;
  title?: string;
  slug?: string;
  description?: string;
  workspaces_user?: {
    uuid: string;
    user_uuid?: string;
    username?: string;
    user_full_name?: string;
    user_last_name?: string;
    role?: string;
  }[];
}

export const emptyWorkspace: WorkspaceData = {
  uuid: "",
  title: "",
  slug: "",
  description: "",
};

export default function WorkspacesPage() {
  const user = localStorage.getItem("user");
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceData | null>(emptyWorkspace);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  const userObj = user ? JSON.parse(user) : null;

  const openDialogCreateWorkspace = () => {
    setOpenDialog(true);
    setSelectedWorkspace(emptyWorkspace);
  };

  const closeDialogCreateWorkspace = () => {
    setOpenDialog(false);
    setSelectedWorkspace(null);
  };

  const fetchWorkspaces = async () => {
    if (!userObj?.uuid) return;
    setLoading(true);
    try {
      const url =
        userObj.username === "administrator"
          ? "/api/workspaces"
          : `/api/workspaces?user_uuid=${encodeURIComponent(userObj.uuid)}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        toast.error("Operation Failed!", {
          description: json.error,
          position: "top-right",
        });
        return;
      }

      setWorkspaces(json.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userObj && userObj.username !== "administrator") {
      router.replace("/home?message=not-authorized");
    }
  }, [userObj, router]);

  useEffect(() => {
    if (userObj?.uuid) {
      fetchWorkspaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userObj?.uuid]);

  const handleSaveWorkspaces = async (selectedWorkspace: WorkspaceData) => {
    setLoading(true);
    const userObj = user ? JSON.parse(user) : null;

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: selectedWorkspace.uuid,
        title: selectedWorkspace.title,
        slug: selectedWorkspace.slug,
        description: selectedWorkspace.description ?? "",
        created_by: userObj.uuid,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }

    fetchWorkspaces();

    setLoading(false);
    setOpenDialog(false);
    toast.success("Workspace created successfully", { position: "top-right" });
  };

  const handleDeleteWorkspace = async (workspace: WorkspaceData) => {
    const res = await fetch("/api/workspaces", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: workspace.uuid }),
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
    setWorkspaces((prev) => prev.filter((u) => u.uuid !== workspace.uuid));
    toast.success("Workspace deleted successfully", { position: "top-right" });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Workspaces Page!"
        pageDescription={`Manage your workspaces effectively.`}
      />

      <InBetweenSections>
        <div className="col-span-12">
          <div className="flex justify-end gap-2 w-full mb-2">
            <Button
              onClick={openDialogCreateWorkspace}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
            >
              Add Workspace
            </Button>
            <Button
              onClick={fetchWorkspaces}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Refetch Workspaces"}
            </Button>
          </div>
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="!w-[35%]">Title</TableHead>
                <TableHead className="!w-[30%]">Description</TableHead>
                <TableHead className="!w-[25%]">Peoples</TableHead>
                <TableHead className="text-center !w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(workspaces ?? []).map((workspace, index) => (
                <TableRow key={index}>
                  <TableCell className="!w-[35%]">
                    <div className="truncate">{workspace.title}</div>
                  </TableCell>
                  <TableCell className="!w-[30%]">
                    <div className="truncate">{workspace.description}</div>
                  </TableCell>
                  <TableCell className="!w-[25%]"></TableCell>
                  <TableCell className="text-center !w-[10%]">
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
                      <DropdownMenuContent align="end" className={`w-48`}>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setOpenDialog(true);
                          }}
                          className={`cursor-pointer`}
                        >
                          Edit Workspace
                        </DropdownMenuItem>
                        <Link
                          href={`/workspaces/contributors?q=${workspace.slug}&uuid=${workspace.uuid}`}
                        >
                          <DropdownMenuItem
                            onClick={() => {}}
                            className={`cursor-pointer`}
                          >
                            Manage Contributors...
                          </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setOpenDelete(true);
                          }}
                          className={`cursor-pointer`}
                        >
                          Delete Workspace
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

      <DialogStickyFooter
        open={openDialog}
        onOpenChange={setOpenDialog}
        dialogTitle="Workspace Details"
        content={
          <FieldSet>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                Workspace Title<span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Homecoming Party"
                value={selectedWorkspace?.title}
                onChange={(e) =>
                  setSelectedWorkspace({
                    ...selectedWorkspace,
                    title: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="description">
                Workspace Description
              </FieldLabel>
              <Textarea
                id="description"
                placeholder="e.g. A simple text to describe your future projects"
                value={selectedWorkspace?.description}
                onChange={(e) =>
                  setSelectedWorkspace({
                    ...selectedWorkspace,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </FieldSet>
        }
        dialogAction={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={closeDialogCreateWorkspace}
              className="cursor-pointer"
            >
              Discard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleSaveWorkspaces(selectedWorkspace ?? {});
              }}
            >
              {loading ? `Saving${dots}` : "Save"}
            </Button>
          </div>
        }
      />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className={`cursor-pointer`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedWorkspace) {
                  await handleDeleteWorkspace(selectedWorkspace);
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
    </div>
  );
}
