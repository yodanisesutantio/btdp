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
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ArrowUpRightIcon, Ellipsis, FolderCode, Plus } from "lucide-react";
import Link from "next/link";

export interface SheetsData {
  imagePreview?: string;
  title?: string;
  labels?: string;
  slug?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  createdBy?: string;
  createdAt?: string;
}

export const dummySheets: SheetsData[] = [
  {
    title: "My First Sheet",
    labels: "Personal",
    slug: "my-first-sheet",
    createdBy: "Random User",
    createdAt: "2023-01-01",
  },
];

export default function SheetsPage() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Sheets!"
        pageDescription={`Create your own spreadsheet!`}
        pageCta={
          <div className="flex gap-2">
            <Button type="button" className="px-2.5 cursor-pointer">
              <Plus /> <p>Add Sheets</p>
            </Button>
            <Button
              variant={`secondary`}
              type="button"
              className="px-2.5 cursor-pointer"
            >
              <Link href="/sheets/archive">
                <p>Open Archive</p>
              </Link>
            </Button>
          </div>
        }
      />

      <InBetweenSections className="gap-4">
        {dummySheets.length > 0 ? (
          dummySheets.map((sheet, index) => (
            <Link
              key={index}
              href={`/sheets/editor?q=${sheet.slug}`}
              className="col-span-12 md:col-span-6 lg:col-span-4 w-full rounded-xl cursor-pointer"
            >
              <NotesPreviewCard
                key={index}
                notes={{
                  title: sheet.title,
                  labels: sheet.labels,
                  slug: sheet.slug,
                  createdBy: sheet.createdBy,
                  createdAt: sheet.createdAt,
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
              <EmptyTitle>No Sheets Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any sheets yet. Get started by creating
                your first sheet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button type="button" className="px-2.5 cursor-pointer">
                <Plus /> <p>Create your first sheet</p>
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
