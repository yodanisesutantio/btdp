"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/workspace-context";
import { emptyWorkspace, WorkspaceData } from "@/app/(main)/workspaces/page";
import { DialogStickyFooter } from "./app-sticky-footer-dialog";
import { FieldLabel, FieldSet } from "./ui/field";
import { slugify } from "@/lib/helper";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface WorkspaceSelectorDialogProps {
  open: boolean;
  onSelect: (workspace: WorkspaceData) => void;
  onCreateWorkspace: () => void;
}

export function WorkspaceSelectorDialog({
  open,
  onSelect,
  onCreateWorkspace,
}: WorkspaceSelectorDialogProps) {
  const user = localStorage.getItem("user");
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();
  const userObj = user ? JSON.parse(user) : null;

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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState<WorkspaceData | null>(
    emptyWorkspace,
  );

  const handleWorkspaceSelect = (workspace: WorkspaceData) => {
    setSelectedWorkspace(workspace);
    onSelect(workspace);
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
    if (open && userObj?.uuid) {
      fetchWorkspaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userObj?.uuid]);

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const keyword = workspaceSearch.toLowerCase();

    return (
      (workspace.title ?? "").toLowerCase().includes(keyword) ||
      (workspace.description ?? "").toLowerCase().includes(keyword)
    );
  });

  const handleCreateWorkspace = async (newWorkspace: WorkspaceData) => {
    if (!newWorkspace?.title?.trim()) {
      toast.error("Workspace title is required", {
        position: "top-right",
      });

      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(newWorkspace?.uuid ? { uuid: newWorkspace?.uuid } : {}),
          title: newWorkspace?.title,
          slug: newWorkspace?.slug,
          description: newWorkspace?.description ?? "",
          created_by: userObj.uuid,
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

      const workspace = data.data;

      const ownerRes = await fetch("/api/workspaces/contributors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspace_uuid: workspace.uuid,
          user_uuid: userObj.uuid,
          role: "Owner",
        }),
      });

      const ownerData = await ownerRes.json();

      if (!ownerRes.ok) {
        toast.error("Workspace created but owner assignment failed", {
          description: ownerData.error,
          position: "top-right",
        });

        return;
      }

      toast.success("Workspace created successfully", {
        position: "top-right",
      });

      await fetchWorkspaces();

      setSelectedWorkspace(workspace);
      onSelect(workspace);

      setNewWorkspace(emptyWorkspace);
      setCreateWorkspaceOpen(false);
    } catch (err) {
      console.error(err);

      toast.error("Operation Failed!", {
        description: "Something went wrong",
        position: "top-right",
      });
    } finally {
      setLoading(false);
      onCreateWorkspace();
    }
  };

  const updateShadows = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopShadow(scrollTop > 5);
    setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 5);
  };

  useEffect(() => {
    updateShadows();
  }, [filteredWorkspaces]);

  if (!open) return;

  return (
    <>
      <Dialog open={open}>
        <DialogContent
          className="!w-[calc(100vw-6rem)] !max-w-[calc(100vw-6rem)] max-h-[calc(100vh-64px)] [&>button]:hidden gap-2"
          showCloseButton={false}
        >
          <DialogHeader className="p-2">
            <DialogTitle>Select Workspace</DialogTitle>

            <DialogDescription>
              Choose a workspace before continuing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative p-2 mb-0">
              <Search className="text-muted-foreground absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />

              <Input
                placeholder="Search workspace..."
                value={workspaceSearch}
                onChange={(e) => setWorkspaceSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="relative">
              {showTopShadow && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background to-transparent" />
              )}

              {showBottomShadow && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-background to-transparent" />
              )}

              <div
                ref={scrollRef}
                onScroll={updateShadows}
                className="h-[calc(100vh-16rem)] overflow-y-auto p-2"
              >
                <div>
                  {loading ? (
                    <div className="flex h-[300px] items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Loading workspaces...
                      </p>
                    </div>
                  ) : filteredWorkspaces.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center gap-2">
                      <Card
                        className="border-dashed w-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                        onClick={() => setCreateWorkspaceOpen(true)}
                      >
                        <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border">
                            <Plus className="h-6 w-6" />
                          </div>

                          <div className="text-center">
                            <h3 className="font-semibold">Create Workspace</h3>

                            <p className="text-muted-foreground text-sm">
                              Start a new workspace
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredWorkspaces.map((workspace) => (
                        <Card
                          key={workspace.uuid}
                          className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${
                            selectedWorkspace?.uuid === workspace.uuid
                              ? "border-primary ring-primary/20 ring-2"
                              : ""
                          }`}
                          onClick={() => {
                            handleWorkspaceSelect(workspace);
                          }}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg border">
                                <Building2 className="h-6 w-6" />
                              </div>

                              {workspace.slug && (
                                <Badge variant="secondary">
                                  {workspace.slug}
                                </Badge>
                              )}
                            </div>

                            <CardTitle className="mt-3">
                              {workspace.title}
                            </CardTitle>

                            <CardDescription>
                              {workspace.description || "No description"}
                            </CardDescription>
                          </CardHeader>

                          <CardContent>
                            <p className="text-muted-foreground text-sm">
                              {workspace.workspaces_user?.length ?? 0} members
                            </p>
                          </CardContent>
                        </Card>
                      ))}

                      <Card
                        className="border-dashed cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                        onClick={() => setCreateWorkspaceOpen(true)}
                      >
                        <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border">
                            <Plus className="h-6 w-6" />
                          </div>

                          <div className="text-center">
                            <h3 className="font-semibold">Create Workspace</h3>

                            <p className="text-muted-foreground text-sm">
                              Start a new workspace
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DialogStickyFooter
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
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
                value={newWorkspace?.title}
                onChange={(e) =>
                  setNewWorkspace({
                    ...newWorkspace,
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
                value={newWorkspace?.description}
                onChange={(e) =>
                  setNewWorkspace({
                    ...newWorkspace,
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
              onClick={() => {
                setCreateWorkspaceOpen(false);
                setNewWorkspace(emptyWorkspace);
              }}
              className="cursor-pointer"
            >
              Discard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleCreateWorkspace(newWorkspace ?? {});
              }}
            >
              {loading ? `Saving${dots}` : "Save"}
            </Button>
          </div>
        }
      />
    </>
  );
}
