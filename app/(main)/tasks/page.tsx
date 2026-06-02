"use client";

import { NotesPreviewCard } from "@/components/app-card";
import { CreatableSelect } from "@/components/app-creatable-select";
import { DialogStickyFooter } from "@/components/app-sticky-footer-dialog";
import { SwitchWithState } from "@/components/app-switch";
import { InBetweenSections, PageTitleSections } from "@/components/sections";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  Menubar,
} from "@/components/ui/menubar";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/hooks/workspace-context";
import { slugify } from "@/lib/helper";
import {
  ArrowUpRightIcon,
  Ban,
  Ellipsis,
  FolderCode,
  Plus,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface TasksBoardData {
  uuid?: string;
  imagePreview?: string;
  title?: string;
  labels?: string;
  slug?: string;
  public?: boolean;
  description?: string;
  content?: string;
  createdByFirstName?: string;
  createdByLastName?: string;
  createdBy?: string;
  createdAt?: string;
}

const emptyTasksBoard: TasksBoardData = {
  uuid: "",
  imagePreview: "",
  title: "",
  labels: "",
  slug: "",
  public: true,
  description: "",
  content: "",
  createdBy: "",
  createdByFirstName: "",
  createdByLastName: "",
  createdAt: "",
};

export interface TasksState {
  key?: string;
  title?: string;
  color?: string;
  collapsed?: boolean;
  taskItem?: TasksItem[];
}

export interface PriorityData {
  key?: string;
  name?: string;
  icon?: React.ReactElement;
}

export interface TasksItem {
  key?: string;
  title?: string;
  slug?: string;
  content?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  labels?: string;
  createdBy?: string;
  createdAt?: string;
}

export const dummyTasksState: TasksState[] = [
  {
    key: "backlog",
    title: "Backlog",
    color: "gray",
    collapsed: false,
    taskItem: [
      {
        key: "task-1",
        slug: "task-1",
        title: "Task 1",
        content: "This is the first backlog Task",
        createdBy: "Random User",
        createdAt: "2023-01-01",
      },
    ],
  },
  {
    key: "to-do",
    title: "To Do",
    color: "mauve",
    collapsed: false,
    taskItem: [
      {
        key: "task-2",
        slug: "task-2",
        title: "Task 2",
        content: "This is the first To Do Task",
        createdBy: "Random User",
        createdAt: "2023-01-01",
      },
    ],
  },
  {
    key: "in-progress",
    title: "In Progress",
    color: "blue",
    collapsed: false,
    taskItem: [
      {
        key: "task-3",
        slug: "task-3",
        title: "Task 3",
        content: "This is the first In Progress Task",
        createdBy: "Random User",
        createdAt: "2023-01-01",
      },
    ],
  },
  {
    key: "done",
    title: "Done",
    color: "green",
    collapsed: false,
    taskItem: [
      {
        key: "task-4",
        slug: "task-4",
        title: "Task 4",
        content: "This is the first Done Task",
        createdBy: "Random User",
        createdAt: "2023-01-01",
      },
    ],
  },
  {
    key: "cancelled",
    title: "Cancelled",
    color: "red",
    collapsed: false,
    taskItem: [
      {
        key: "task-5",
        slug: "task-5",
        title: "Task 5",
        content: "This is the first cancelled Task",
        createdBy: "Random User",
        createdAt: "2023-01-01",
      },
    ],
  },
];

export const borderColorMap: Record<string, string> = {
  gray: "border-slate-400",
  mauve: "border-mauve-400",
  blue: "border-blue-400",
  green: "border-green-400",
  red: "border-red-400",
};

export const priorityData: PriorityData[] = [
  {
    key: "none",
    name: "None",
    icon: <Ban className="text-black h-3.5 w-3.5" />,
  },
  {
    key: "low",
    name: "Low",
    icon: <SignalLow className="text-blue-500 h-3.5 w-3.5" />,
  },
  {
    key: "medium",
    name: "Medium",
    icon: <SignalMedium className="text-yellow-500 h-3.5 w-3.5" />,
  },
  {
    key: "high",
    name: "High",
    icon: <SignalHigh className="text-orange-500 h-3.5 w-3.5" />,
  },
  {
    key: "critical",
    name: "Critical",
    icon: <Signal className="text-red-500 h-3.5 w-3.5" />,
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TasksBoardData[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TasksBoardData | null>(
    emptyTasksBoard,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const { selectedWorkspace } = useWorkspace();

  const user = localStorage.getItem("user");
  const userObj = user ? JSON.parse(user) : null;

  const workspaceUuid = selectedWorkspace?.uuid;

  const openDialogCreateTasks = () => {
    setOpenDialog(true);
    setSelectedTasks(emptyTasksBoard);
  };

  const closeDialogCreateTasks = () => {
    setOpenDialog(false);
    setSelectedTasks(null);
  };

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

  const fetchTaskBoardsList = async () => {
    setLoading(true);

    try {
      if (userObj?.username !== "administrator" && !workspaceUuid) {
        toast.error("Please select a workspace first!", {
          description: "You must select a workspace to view its task boards.",
          position: "top-right",
        });

        return;
      }

      const res = await fetch("/api/tasks-board/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceUuid }),
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

      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskBoardsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveTaskBoard = async (selectedBoard: TasksBoardData) => {
    setLoading(true);

    if (userObj?.username !== "administrator") {
      if (!workspaceUuid) {
        toast.error("Please select a workspace first!", {
          description: "You must select a workspace to save task boards.",
          position: "top-right",
        });
      }
      return;
    }

    const res = await fetch("/api/tasks-board/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: selectedBoard.title,
        slug: selectedBoard.slug,
        description: selectedBoard.description ?? "",
        public: selectedBoard.public,
        created_by: userObj.uuid,
        workspaceUuid,
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

    setLoading(false);
    setOpenDialog(false);
    toast.success("Task board created successfully", {
      position: "top-right",
    });
    fetchTaskBoardsList();
  };

  const handleArchiveTaskBoard = async (boardUuid: string) => {
    setLoading(true);

    const res = await fetch("/api/tasks-board/archive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: boardUuid,
        archive: true,
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

    setLoading(false);
    setTasks((prev) => prev.filter((board) => board.uuid !== boardUuid));
    toast.success("Task board archived successfully", {
      position: "top-right",
    });
  };

  const handleDeleteTaskBoard = async (boardUuid: string) => {
    setLoading(true);

    const res = await fetch("/api/tasks-board", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: boardUuid,
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

    setLoading(false);
    setTasks((prev) => prev.filter((board) => board.uuid !== boardUuid));
    toast.success("Task board deleted successfully", {
      position: "top-right",
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Tasks Board!"
        pageDescription={`Here you can manage and watch over the entire projects!`}
        pageCta={
          <div className="flex gap-2">
            <Button
              type="button"
              className="px-2.5 cursor-pointer"
              onClick={openDialogCreateTasks}
            >
              <Plus /> <p>Add Tasks Board</p>
            </Button>
            <Button
              variant={`secondary`}
              type="button"
              className="px-2.5 cursor-pointer"
            >
              <Link href="/tasks/archive">
                <p>Open Archive</p>
              </Link>
            </Button>
          </div>
        }
      />

      <InBetweenSections className="gap-4">
        <div className="col-span-12">
          <div className="flex justify-end w-full mb-2">
            <Button
              onClick={fetchTaskBoardsList}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Reload Tasks"}
            </Button>
          </div>
        </div>
        {tasks.length > 0 ? (
          tasks.map((board, index) => (
            <Link
              key={index}
              href={`/tasks/board?q=${board.slug}`}
              className="col-span-12 md:col-span-6 lg:col-span-4 w-full rounded-xl cursor-pointer"
            >
              <NotesPreviewCard
                key={index}
                data={{
                  title: board.title,
                  labels: board.labels,
                  slug: board.slug,
                  createdBy: board.createdBy,
                  createdAt: board.createdAt,
                }}
                className="gap-2 hover:bg-muted hover:ring-foreground transition-all duration-300"
                cardMenubar={
                  <Menubar className="w-fit h-fit p-0">
                    <MenubarMenu>
                      <MenubarTrigger
                        className={`cursor-pointer text-accent hover:text-accent-foreground transition-all duration-300`}
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Ellipsis size={16} />
                      </MenubarTrigger>
                      <MenubarContent>
                        <MenubarGroup>
                          <Link
                            key={index}
                            href={`/tasks/setting?q=${board.slug}`}
                            className="col-span-12 md:col-span-6 lg:col-span-4 w-full rounded-xl cursor-pointer"
                          >
                            <MenubarItem
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              Setting
                            </MenubarItem>
                          </Link>
                        </MenubarGroup>
                        <MenubarSeparator />
                        <MenubarGroup>
                          <MenubarItem
                            onClick={(e) => {
                              e.preventDefault();
                              handleArchiveTaskBoard(board.uuid ?? "");
                            }}
                          >
                            Archive
                          </MenubarItem>
                          <MenubarItem
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteTaskBoard(board.uuid ?? "");
                            }}
                            variant="destructive"
                          >
                            Delete
                          </MenubarItem>
                        </MenubarGroup>
                        <MenubarSeparator />
                        <MenubarGroup>
                          <MenubarSub>
                            <MenubarSubTrigger
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              Share
                            </MenubarSubTrigger>
                            <MenubarSubContent>
                              <MenubarGroup>
                                <MenubarItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  Copy Link
                                </MenubarItem>
                                <MenubarItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  Manage...
                                </MenubarItem>
                              </MenubarGroup>
                            </MenubarSubContent>
                          </MenubarSub>
                        </MenubarGroup>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                }
                cardHeaderClassName="pt-2 px-4"
                cardFooterClassName="w-full px-4 text-muted-foreground"
              />
            </Link>
          ))
        ) : (
          <Empty className="col-span-12 w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderCode />
              </EmptyMedia>
              <EmptyTitle>No Boards Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any tasks board yet. Get started by
                creating your first board.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button
                type="button"
                className="px-2.5 cursor-pointer"
                onClick={openDialogCreateTasks}
              >
                <Plus /> <p>Create your first tasks board</p>
              </Button>
            </EmptyContent>
            <Button variant="link" className="text-muted-foreground" size="sm">
              <Link className="flex gap-2 items-center" href="#">
                Learn More <ArrowUpRightIcon />
              </Link>
            </Button>
          </Empty>
        )}
      </InBetweenSections>

      <DialogStickyFooter
        open={openDialog}
        onOpenChange={setOpenDialog}
        dialogTitle="Create New Tasks Board"
        content={
          <FieldSet>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                Tasks Board Title<span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="e.g. 2025 Company Workshop"
                value={selectedTasks?.title}
                onChange={(e) =>
                  setSelectedTasks({
                    ...selectedTasks,
                    title: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="description">
                Tasks Board Description
              </FieldLabel>
              <Textarea
                id="description"
                placeholder="e.g. Brief summary of the tasks board"
                value={selectedTasks?.description}
                onChange={(e) =>
                  setSelectedTasks({
                    ...selectedTasks,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-row gap-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="title">Labels</FieldLabel>
                <CreatableSelect
                  value={selectedTasks?.labels}
                  onChange={(value) =>
                    setSelectedTasks({ ...selectedTasks, labels: value })
                  }
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="title">Public</FieldLabel>
                <div className="flex items-center space-x-2 h-[36px]">
                  <SwitchWithState
                    id="tasks-board-public"
                    name="tasks-board-public"
                    size={`lg`}
                    checked={selectedTasks?.public ? true : false}
                    onChange={(val) =>
                      setSelectedTasks({ ...selectedTasks, public: val })
                    }
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </FieldSet>
        }
        dialogAction={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={closeDialogCreateTasks}
              className="cursor-pointer"
            >
              Discard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleSaveTaskBoard(selectedTasks ?? {});
              }}
            >
              {loading ? `Saving${dots}` : "Save"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
