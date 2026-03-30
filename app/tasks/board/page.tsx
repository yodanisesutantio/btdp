"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { usePlateEditor } from "platejs/react";
import { EditorKit } from "@/components/editor/editor-kit";
import {
  borderColorMap,
  dummyTasksBoard,
  dummyTasksState,
  TasksBoardData,
  TasksState,
} from "../page";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Kanban, ListChecks, Maximize2, Minimize2, Plus } from "lucide-react";

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

  const [states, setStates] = useState<TasksState[] | undefined>(
    dummyTasksState,
  );

  const [notes, setNotesContent] = useState<TasksBoardData | undefined>(
    dummyTasksBoard?.find((n) => n.slug === slug),
  );

  return (
    <div className="relative flex flex-col gap-4 w-full justify-center font-sans pb-1 min-w-0 h-full bg-muted">
      <ButtonGroup className="fixed right-6 top-6">
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
                      11
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
                    <div
                      id="issue-aba4180e-569e-49b4-ac30-70d05e14f309"
                      className="group/kanban-block relative mb-2 bg-background"
                    >
                      <a
                        href="/widaya-inti-plasma/browse/TESTI-4/"
                        target="_blank"
                        id="issue_aba4180e-569e-49b4-ac30-70d05e14f309_007b380d-448f-43be-8e08-918a51d75066_null"
                        className="block rounded border-[1px] outline-[0.5px] outline-transparent w-full text-sm transition-all hover hover:cursor-pointer"
                        draggable="true"
                        data-drop-target-for-element="true"
                      >
                        <div className="space-y-2 px-3 py-2">
                          <div className="relative">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium line-clamp-1 text-xs">
                                TESTI-4
                              </span>
                            </div>
                            <div className="absolute -top-1 right-0 hidden group-hover/kanban-block:block">
                              <div
                                className="relative w-min text-left"
                                data-headlessui-state=""
                              >
                                <button
                                  type="button"
                                  className="relative grid place-items-center rounded p-1 outline-none cursor-pointer"
                                  id="headlessui-menu-button-:rpe:"
                                  aria-haspopup="menu"
                                  aria-expanded="false"
                                  data-headlessui-state=""
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-ellipsis h-3.5 w-3.5"
                                  >
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="h-full flex items-center">
                            <div className="w-full line-clamp-1 text-sm">
                              <span>Sketch</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 whitespace-nowrap pt-1.5">
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full outline-none cursor-pointer truncate max-w-40"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] rounded text-xs px-2 py-0.5">
                                      <svg
                                        height="12px"
                                        width="12px"
                                        viewBox="0 0 16 16"
                                        className="flex-shrink-0 size-4 flex-shrink-0"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <g>
                                          <g transform="translate(8 8) rotate(-90)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(-66)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(-42)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(-18)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(6)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(30)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(54)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(78)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(102)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(126)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(150)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(174)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(198)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(222)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                          <g transform="translate(8 8) rotate(246)">
                                            <line
                                              x1="5.75"
                                              y1="0"
                                              x2="6.5"
                                              y2="0"
                                              stroke="#60646C"
                                              stroke-width="1.21"
                                              stroke-linecap="round"
                                            ></line>
                                          </g>
                                        </g>
                                      </svg>
                                      <span className="flex-grow truncate text-left">
                                        Backlog
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full max-w-full outline-none cursor-pointer"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full flex items-center gap-1.5 rounded text-xs py-0.5 px-0.5 border">
                                      <div className="">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          className="lucide lucide-ban flex-shrink-0 flex-shrink-0 h-3.5 w-3.5"
                                        >
                                          <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                          ></circle>
                                          <path d="m4.9 4.9 14.2 14.2"></path>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full max-w-full outline-none cursor-pointer"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] rounded text-xs px-2 py-0.5">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-calendar-clock h-3 w-3 flex-shrink-0"
                                      >
                                        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                                        <path d="M16 2v4"></path>
                                        <path d="M8 2v4"></path>
                                        <path d="M3 10h5"></path>
                                        <path d="M17.5 17.5 16 16.3V14"></path>
                                        <circle cx="16" cy="16" r="6"></circle>
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full max-w-full outline-none cursor-pointer"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] rounded text-xs px-2 py-0.5">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-calendar-check2 h-3 w-3 flex-shrink-0"
                                      >
                                        <path d="M8 2v4"></path>
                                        <path d="M16 2v4"></path>
                                        <path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"></path>
                                        <path d="M3 10h18"></path>
                                        <path d="m16 20 2 2 4-4"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full max-w-full outline-none cursor-pointer"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] rounded px-2 py-0.5 text-xs">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-users h-3 w-3 mx-[4px] flex-shrink-0"
                                      >
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full outline-none cursor-pointer truncate max-w-40"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] rounded text-xs px-2 py-0.5">
                                      <div className="relative flex items-center max-w-full gap-1">
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="h-3 w-3 flex-shrink-0 stroke-2"
                                          stroke="currentColor"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                          ></path>
                                          <path
                                            d="M8.77778 7H7.22222C7.09949 7 7 7.09949 7 7.22222V8.77778C7 8.90051 7.09949 9 7.22222 9H8.77778C8.90051 9 9 8.90051 9 8.77778V7.22222C9 7.09949 8.90051 7 8.77778 7Z"
                                            fill="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                          ></path>
                                          <path
                                            d="M8.77778 15H7.22222C7.09949 15 7 15.0995 7 15.2222V16.7778C7 16.9005 7.09949 17 7.22222 17H8.77778C8.90051 17 9 16.9005 9 16.7778V15.2222C9 15.0995 8.90051 15 8.77778 15Z"
                                            fill="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                          ></path>
                                          <path
                                            d="M16.7778 7H15.2222C15.0995 7 15 7.09949 15 7.22222V8.77778C15 8.90051 15.0995 9 15.2222 9H16.7778C16.9005 9 17 8.90051 17 8.77778V7.22222C17 7.09949 16.9005 7 16.7778 7Z"
                                            fill="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                          ></path>
                                          <path
                                            d="M16.7778 15H15.2222C15.0995 15 15 15.0995 15 15.2222V16.7778C15 16.9005 15.0995 17 15.2222 17H16.7778C16.9005 17 17 16.9005 17 16.7778V15.2222C17 15.0995 16.9005 15 16.7778 15Z"
                                            fill="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                          ></path>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div className="h-full flex items-center">
                                <button
                                  type="button"
                                  className="clickable block h-full outline-none cursor-pointer truncate max-w-40"
                                >
                                  <div className="h-full flex items-center">
                                    <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] rounded text-xs px-2 py-0.5">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="h-3 w-3 flex-shrink-0 stroke-2"
                                        stroke="currentColor"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                        ></path>
                                        <path
                                          d="M12 18C13.5913 18 15.1174 17.3679 16.2426 16.2426C17.3679 15.1174 18 13.5913 18 12C18 10.4087 17.3679 8.88258 16.2426 7.75736C15.1174 6.63214 13.5913 6 12 6V18Z"
                                          fill="currentColor"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                        ></path>
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <div className="h-5">
                              <div
                                className="w-auto max-w-full h-full flex-shrink-0 text-left undefined"
                                data-headlessui-state=""
                              >
                                <button
                                  type="button"
                                  className="clickable flex w-full h-full items-center justify-center gap-1 text-xs false cursor-pointer"
                                  id="headlessui-combobox-button-:rpf:"
                                  aria-haspopup="listbox"
                                  aria-expanded="false"
                                  data-headlessui-state=""
                                >
                                  <div className="h-full flex items-center">
                                    <div className="flex h-full items-center justify-center gap-2 rounded px-2.5 py-1 text-xs border-[0.5px]">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-tags h-3.5 w-3.5"
                                      >
                                        <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path>
                                        <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path>
                                        <circle
                                          cx="6.5"
                                          cy="9.5"
                                          r=".5"
                                          fill="currentColor"
                                        ></circle>
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                    <div className="w-full py-0.5 sticky bottom-0">
                      <div className="">
                        <div className="flex w-full cursor-pointer items-center gap-2 py-1.5 hover">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="lucide lucide-plus h-3.5 w-3.5 stroke-2"
                          >
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                          </svg>
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
    </div>
  );
}
