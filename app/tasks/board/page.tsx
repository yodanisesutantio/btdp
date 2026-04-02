"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Plate, usePlateEditor } from "platejs/react";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { EditorKit } from "@/components/editor/editor-kit";
import {
  borderColorMap,
  dummyTasksState,
  priorityData,
  TasksItem,
  TasksState,
} from "../page";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  Archive,
  CalendarCheck2,
  CalendarClock,
  Ellipsis,
  ExternalLink,
  Kanban,
  ListChecks,
  Maximize2,
  Minimize2,
  MoveRight,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function TasksBoardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksBoardPageInnerContent />
    </Suspense>
  );
}

function TasksBoardPageInnerContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("q");

  const editor = usePlateEditor({
    plugins: EditorKit,
  });

  const [layout, setLayout] = useState<"list" | "kanban">("kanban");
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const [states, setStates] = useState<TasksState[]>(dummyTasksState);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  const selectedTask = useMemo(() => {
    return (
      states
        .flatMap((col) => col.taskItem)
        .find((task) => task?.key === selectedKey) ?? null
    );
  }, [selectedKey, states]);

  const handleDrop = (targetColKey: string) => {
    if (!draggedKey) return;

    setStates((prev) => {
      let draggedTask: TasksItem | null = null;

      const next = prev.map((col) => {
        const found = col.taskItem?.find((t) => t.key === draggedKey);

        if (found) {
          draggedTask = found;
          return {
            ...col,
            taskItem: col.taskItem?.filter((t) => t.key !== draggedKey) ?? [],
          };
        }

        return col;
      });

      return next.map((col) => {
        if (col.key === targetColKey && draggedTask) {
          return {
            ...col,
            taskItem: [...(col.taskItem ?? []), draggedTask],
          };
        }
        return col;
      });
    });

    setDraggedKey(null);
  };

  return (
    <div className="relative flex flex-col gap-4 w-full justify-center font-sans pb-1 min-w-0 h-full bg-muted">
      <ButtonGroup className="fixed right-6 top-6 z-30">
        <Button
          variant={layout === "list" ? "default" : "outline"}
          className={`cursor-pointer`}
          onClick={() => setLayout("list")}
        >
          <ListChecks />
        </Button>
        <Button
          variant={layout === "kanban" ? "default" : "outline"}
          className={`cursor-pointer`}
          onClick={() => setLayout("kanban")}
        >
          <Kanban />
        </Button>
      </ButtonGroup>
      <div className="flex flex-row overflow-x-auto px-6 py-3 gap-4 min-w-0 h-full">
        <div className="flex gap-4 w-max">
          {states?.map((state) => (
            <div
              key={state.key}
              className={`group relative flex flex-shrink-0 flex-col ${state.collapsed ? "w-fit" : "w-[350px]"}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(state.key ?? "")}
            >
              <div className="sticky top-0 z-[2] w-full flex-shrink-0 mb-1">
                <div
                  className={`relative flex flex-shrink-0 gap-2 py-1.5 w-full ${state.collapsed ? "flex-col" : "flex-row"} items-center`}
                >
                  <div
                    className={`relative flex gap-3 w-full ${state.collapsed ? "flex-col" : "flex-row"} items-center overflow-hidden`}
                  >
                    <div
                      className={`flex ${state.collapsed ? "flex-col" : "flex-row"} items-center gap-2`}
                    >
                      <div
                        className={`${state.collapsed ? "border-t-2 w-6" : "border-l-2 h-6"} ${borderColorMap[state.color ?? "dark-gray"]}`}
                      ></div>
                      <div
                        className={`line-clamp-1 inline-block overflow-hidden truncate font-medium ${state.collapsed ? "vertical-lr" : ""}`}
                      >
                        {state.title}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground font-medium">
                      {state.taskItem?.length ?? 0}
                    </div>
                  </div>
                  <Button
                    variant={`ghost`}
                    className="flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all"
                    onClick={() => {
                      setStates((prevStates) =>
                        prevStates?.map((s) =>
                          s.key === state.key
                            ? { ...s, collapsed: !s.collapsed }
                            : s,
                        ),
                      );
                    }}
                  >
                    {state.collapsed ? <Maximize2 /> : <Minimize2 />}
                  </Button>
                  <Button
                    variant={`ghost`}
                    className="flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all"
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
              {!state.collapsed && (
                <div className="h-full min-h-[120px]">
                  <div className="relative h-full transition-all min-h-[120px] vertical-scrollbar scrollbar-md">
                    <div className="absolute top-0 left-0 h-full w-full items-center text-sm font-medium rounded justify-center hidden">
                      <div className="p-3 my-8 flex flex-col rounded items-center">
                        <span>
                          This layout is ordered by{" "}
                          <span className="font-semibold">Last created</span>.
                        </span>
                        <span>Drop here to move the work item</span>
                      </div>
                    </div>
                    <div className="block relative h-[2px] w-full before:left-0 before:relative before:block before:top-[-2px] before:h-[6px] before:w-[6px] before:rounded after:left-[calc(100%-6px)] after:relative after:block after:top-[-8px] after:h-[6px] after:w-[6px] after:rounded"></div>
                    {state.taskItem?.map((item) => (
                      <div
                        key={item.key}
                        className="group/kanban-block relative mb-2 bg-background"
                      >
                        <a
                          href={`/tasks/board/detail?q=${item.key}`}
                          target="_blank"
                          onClick={(e) => {
                            const isModifiedClick =
                              e.ctrlKey || e.metaKey || e.button === 1;

                            if (!isModifiedClick) {
                              e.preventDefault();

                              setSelectedKey(item.key ?? null);
                              setOpen(true);
                            }
                          }}
                          className="block rounded border-[1px] outline-[0.5px] outline-transparent w-full text-sm transition-all hover hover:cursor-pointer hover:bg-muted/40 hover:border-foreground/30"
                          draggable="true"
                          data-drop-target-for-element="true"
                          onDragStart={() => {
                            setDraggedKey(item.key ?? null);
                          }}
                        >
                          <div className="space-y-2 px-3 py-2">
                            <div className="relative">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium line-clamp-1 text-xs">
                                  {item.slug ?? ""}
                                </span>
                              </div>
                              <div className="absolute -top-1 -right-2 hidden group-hover/kanban-block:block">
                                <div
                                  className="relative w-min text-left"
                                  data-headlessui-state=""
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="relative w-7 h-7 grid place-items-center rounded p-1 outline-none cursor-pointer hover:bg-muted hover:border-foreground"
                                  >
                                    <Ellipsis />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="h-full flex items-center">
                              <div className="w-full line-clamp-1 text-sm">
                                <span>{item.title ?? ""}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap pt-1.5">
                              <div className="h-5">
                                <div className="h-full flex items-center">
                                  <Button
                                    variant="outline"
                                    type="button"
                                    className="clickable block h-full bg-transparent rounded outline-none cursor-pointer hover:bg-muted hover:border-foreground truncate max-w-40"
                                  >
                                    <div className="h-full flex items-center">
                                      <div className="h-full w-full flex items-center gap-1.5 rounded text-xs">
                                        <div
                                          className={`border-l-2 h-3 ${borderColorMap[state.color ?? "dark-gray"]}`}
                                        ></div>
                                        <span className="flex-grow truncate text-left">
                                          {state.title ?? ""}
                                        </span>
                                      </div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                              <div className="h-5">
                                <div className="h-full flex items-center">
                                  <Button
                                    variant="outline"
                                    type="button"
                                    className="clickable block h-full bg-transparent rounded outline-none cursor-pointer hover:bg-muted hover:border-foreground truncate max-w-40"
                                  >
                                    <div className="h-full flex items-center">
                                      <div className="h-full flex items-center gap-1.5 rounded text-xs">
                                        <div className="">
                                          {priorityData.find(
                                            (p) => p.key === item.priority,
                                          )?.icon ??
                                            priorityData.find(
                                              (p) => p.key === "none",
                                            )?.icon}
                                        </div>
                                      </div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                              <div className="h-5">
                                <div className="h-full flex items-center">
                                  <Button
                                    variant="outline"
                                    type="button"
                                    className="clickable block h-full bg-transparent rounded outline-none cursor-pointer hover:bg-muted hover:border-foreground truncate max-w-40"
                                  >
                                    <div className="h-full flex items-center">
                                      <div className="h-full w-full flex items-center gap-1.5 rounded text-xs">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                      </div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                              <div className="h-5">
                                <div className="h-full flex items-center">
                                  <Button
                                    variant="outline"
                                    type="button"
                                    className="clickable block h-full bg-transparent rounded outline-none cursor-pointer hover:bg-muted hover:border-foreground truncate max-w-40"
                                  >
                                    <div className="h-full flex items-center">
                                      <div className="h-full w-full flex items-center gap-1.5 rounded text-xs">
                                        <CalendarCheck2 className="h-3.5 w-3.5" />
                                      </div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                              <div className="h-5">
                                <div
                                  className="w-auto max-w-full h-full flex-shrink-0 text-left undefined"
                                  data-headlessui-state=""
                                >
                                  <Button
                                    variant="outline"
                                    type="button"
                                    className="clickable block h-full bg-transparent rounded outline-none cursor-pointer hover:bg-muted hover:border-foreground truncate max-w-40"
                                  >
                                    <div className="h-full flex items-center">
                                      <div className="flex h-full items-center justify-center gap-2 rounded text-xs">
                                        <Tags className="h-3.5 w-3.5" />
                                      </div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    ))}
                    <div className="w-full py-0.5 sticky bottom-0">
                      <div className="">
                        <div className="flex w-full cursor-pointer items-center gap-2 py-1.5 hover">
                          <Plus className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">
                            New Work item
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={side}
          className={`[&>button]:hidden !w-full md:!w-3/5 lg:!w-2/5 !max-w-none`}
        >
          <SheetHeader className="p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <Button
                  className={`cursor-pointer`}
                  variant="ghost"
                  size="icon"
                >
                  <MoveRight className="h-4 w-4" />
                </Button>
                <Button
                  className={`cursor-pointer`}
                  variant="ghost"
                  size="icon"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  className={`cursor-pointer`}
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSide((prev) => (prev === "right" ? "left" : "right"))
                  }
                >
                  {side === "left" ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  className={`cursor-pointer`}
                  variant="ghost"
                  size="icon"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  className={`cursor-pointer`}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="relative flex flex-col px-4">
            <Input
              type="text"
              value={selectedTask?.title ?? ""}
              onChange={(e) => {
                const value = e.target.value;

                setStates((prev) =>
                  prev.map((col) => ({
                    ...col,
                    taskItem: col.taskItem?.map((task) =>
                      task.key === selectedKey
                        ? { ...task, title: value }
                        : task,
                    ),
                  })),
                );
              }}
              placeholder="Enter note title..."
              className="w-full !border-0 !ring-0 !shadow-none focus:!ring-0 focus:!shadow-none focus-visible:!ring-0 focus-visible:!shadow-none outline-none !text-3xl font-bold bg-transparent p-0 h-auto"
              maxLength={64}
            />
            <span className="text-xs text-end text-muted-foreground">
              {selectedTask?.title?.length ?? 0}/64
            </span>

            <div className="flex flex-col gap-2 w-full mt-2">
              <Separator />
            </div>

            <Plate
              editor={editor}
              onChange={({ value }) => {
                console.log(value);
              }}
            >
              <EditorContainer>
                <Editor
                  placeholder="Type your amazing content here..."
                  className="!px-4"
                />
              </EditorContainer>
            </Plate>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
