"use client";

import { InBetweenSections } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { dummyTasksState, emptyTasksBoard, TasksBoardData } from "../page";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/hooks/workspace-context";
import { toast } from "sonner";
import { slugify } from "@/lib/helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableTaskStateRow from "@/components/app-sortable-row";

export default function TasksBoardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksBoardSettingPageInnerContent />
    </Suspense>
  );
}

function TasksBoardSettingPageInnerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uuid = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const { selectedWorkspace } = useWorkspace();
  const [taskBoard, setTaskBoard] = useState<TasksBoardData | null>(
    emptyTasksBoard,
  );

  const user = localStorage.getItem("user");
  const userObj = user ? JSON.parse(user) : null;

  const workspaceUuid = selectedWorkspace?.uuid;

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

  const fetchTaskBoard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks-board?id=${uuid}`);
      const json = await res.json();

      if (json?.data) {
        setTaskBoard(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!uuid) return;

    fetchTaskBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !taskBoard) return;

    const oldIndex = taskBoard?.states?.findIndex(
      (state) => state.uuid === active.id,
    );

    const newIndex = taskBoard?.states?.findIndex(
      (state) => state.uuid === over.id,
    );

    const reorderedStates = arrayMove(
      taskBoard?.states ?? [],
      oldIndex ?? 0,
      newIndex ?? 0,
    );

    setTaskBoard({
      ...taskBoard,
      states: reorderedStates,
    });
  };

  const handleTitleChange = (value: string) => {
    setTaskBoard({ ...taskBoard, title: value });

    const slug = slugify(value);

    if (slug) {
      router.replace(`/tasks/setting?q=${slug}&id=${taskBoard?.uuid}`);
    } else {
      router.replace(`/notes`);
    }
  };

  const handleSaveTaskBoard = async (selectedBoard: TasksBoardData) => {
    setLoading(true);
    console.log(selectedBoard);

    if (userObj?.username !== "administrator" && !workspaceUuid) {
      toast.error("Please select a workspace first!", {
        description: "You must select a workspace to save task boards.",
        position: "top-right",
      });
      return;
    }

    const res = await fetch("/api/tasks-board", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid,
        title: selectedBoard.title,
        slug: selectedBoard.title,
        description: selectedBoard.description,
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
    toast.success("Task board updated successfully", {
      position: "top-right",
    });
    fetchTaskBoard();
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <Tabs
        defaultValue="general"
        className={`w-full px-6 md:px-12 lg:px-24 py-4`}
      >
        <TabsList variant="line">
          <TabsTrigger value="general" className="cursor-pointer">
            General
          </TabsTrigger>
          <TabsTrigger value="states" className="cursor-pointer">
            States
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <InBetweenSections className="gap-4 !px-1">
            <div className="col-span-12">
              <h1 className="text-xl font-bold">General Board Information</h1>
              <p className="text-sm text-muted-foreground">
                Manage your board information
              </p>
            </div>
            <div className="col-span-12">
              <FieldSet>
                <div className="flex flex-row gap-5">
                  <div className="w-1/2 flex flex-col gap-2">
                    <FieldLabel htmlFor="title" className="gap-0">
                      Title<span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g. December Budget"
                      value={taskBoard?.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-1/2 flex flex-col gap-2">
                    <FieldLabel htmlFor="description" className="gap-0">
                      Description<span className="text-red-500">*</span>
                    </FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="e.g. Brief summary of the tasks board"
                      value={taskBoard?.description}
                      onChange={(e) =>
                        setTaskBoard({
                          ...taskBoard,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end w-full mb-2">
                  <Button
                    className="cursor-pointer px-6"
                    onClick={() => {
                      handleSaveTaskBoard(taskBoard ?? {});
                    }}
                  >
                    {loading ? `Saving${dots}` : "Save"}
                  </Button>
                </div>
              </FieldSet>
            </div>
          </InBetweenSections>
        </TabsContent>
        <TabsContent value="states">
          <InBetweenSections className="gap-4 !px-1">
            <div className="col-span-12">
              <h1 className="text-xl font-bold">Task Board State Setup</h1>
              <p className="text-sm text-muted-foreground">
                Manage your available States for your Board
              </p>
            </div>
            <div className="col-span-12">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="!w-[7%] text-center">#</TableHead>
                    <TableHead className="!w-[65%]">Title</TableHead>
                    <TableHead className="!w-[18%]">Color</TableHead>
                    <TableHead className="!w-[10%] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      // items={(taskBoard?.states ?? [])
                      //   .filter(
                      //     (s): s is { uuid: string } =>
                      //       typeof s.uuid === "string",
                      //   )
                      //   .map((state) => state.uuid)}
                      items={(dummyTasksState ?? [])
                        .filter(
                          (s): s is { uuid: string } =>
                            typeof s.uuid === "string",
                        )
                        .map((state) => state.uuid)}
                      strategy={verticalListSortingStrategy}
                    >
                      {/* {taskBoard?.states?.map((state) => (
                        <SortableTaskStateRow key={state.uuid} state={state} />
                      ))} */}
                      {dummyTasksState?.map((state) => (
                        <SortableTaskStateRow key={state.uuid} state={state} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </TableBody>
              </Table>

              <div className="flex gap-2 justify-end w-full mt-6 mb-2">
                <Button
                  variant="outline"
                  onClick={() => {}}
                  className="cursor-pointer"
                >
                  Discard
                </Button>

                <Button
                  className="cursor-pointer px-6"
                  onClick={() => {
                    handleSaveTaskBoard(taskBoard ?? {});
                  }}
                >
                  {loading ? `Saving${dots}` : "Save"}
                </Button>
              </div>
            </div>
          </InBetweenSections>
        </TabsContent>
      </Tabs>
    </div>
  );
}
