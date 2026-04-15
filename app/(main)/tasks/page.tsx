"use client";

import { NotesPreviewCard } from "@/components/app-card";
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

export interface TasksBoardData {
  imagePreview?: string;
  title?: string;
  labels?: string;
  slug?: string;
  content?: string;
  createdBy?: string;
  createdAt?: string;
}

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

export const dummyTasksBoard: TasksBoardData[] = [
  {
    title: "My First Board",
    labels: "Personal",
    slug: "my-first-board",
    createdBy: "Random User",
    createdAt: "2023-01-01",
  },
];

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Tasks Board!"
        pageDescription={`Here you can manage and watch over the entire projects!`}
        pageCta={
          <div className="flex gap-2">
            <Button type="button" className="px-2.5 cursor-pointer">
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
        {dummyTasksBoard.length > 0 ? (
          dummyTasksBoard.map((board, index) => (
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
                            }}
                          >
                            Archive
                          </MenubarItem>
                          <MenubarItem
                            onClick={(e) => {
                              e.preventDefault();
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
              <Button type="button" className="px-2.5 cursor-pointer">
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
    </div>
  );
}
