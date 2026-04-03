"use client";

import { NotesPreviewCard } from "@/components/app-card";
import { InBetweenSections, PageTitleSections } from "@/components/sections";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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
  ArrowLeft,
  ArrowUpRightIcon,
  Ellipsis,
  FolderCode,
} from "lucide-react";
import Link from "next/link";
import { TasksBoardData } from "../page";

export const tasks: TasksBoardData[] = [
  // {
  //   title: "My First Note",
  //   labels: "Personal",
  //   slug: "my-first-note",
  //   createdBy: "Random User",
  //   createdAt: "2023-01-01",
  // },
  // {
  //   title: "My Second Note",
  //   labels: "Private",
  //   slug: "my-second-note",
  //   createdBy: "John Doe",
  //   createdAt: "2023-01-02",
  // },
];

export default function ArchiveNotesPage() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Archive Tasks Board!"
        pageDescription={
          <>
            Here you can view your archived tasks board. For more information{" "}
            <Link className="underline hover:no-underline" href={`#`}>
              click here!
            </Link>
          </>
        }
      />

      <InBetweenSections className="gap-4">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <Link
              key={index}
              href={`/notes/editor?q=${task.slug}`}
              className="col-span-12 md:col-span-6 lg:col-span-4 w-full rounded-xl cursor-pointer"
            >
              <NotesPreviewCard
                key={index}
                notes={{
                  title: task.title,
                  labels: task.labels,
                  slug: task.slug,
                  createdBy: task.createdBy,
                  createdAt: task.createdAt,
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
                          <MenubarItem
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            Restore Notes
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
              <EmptyTitle>No Archived Tasks Board Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t archived any tasks board yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Link href="/tasks">
                <Button type="button" className="px-2.5 cursor-pointer">
                  <ArrowLeft /> <p>Return to Task Boards</p>
                </Button>
              </Link>
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
