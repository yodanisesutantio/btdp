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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SheetsData } from "../page";

export default function ArchiveSheetsPage() {
  const [archivedSheets, setArchivedSheets] = useState<SheetsData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSheetsList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sheets/archived-list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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
      setArchivedSheets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetsList();
  }, []);

  const handleArchiveSheets = async (sheetUuid: string) => {
    setLoading(true);

    const res = await fetch("/api/sheets/archive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: sheetUuid,
        archive: false,
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
    setArchivedSheets((prev) => prev.filter((s) => s.uuid !== sheetUuid));
    toast.success("Sheet archived successfully", { position: "top-right" });
  };

  const handleDeleteSheets = async (sheetUuid: string) => {
    setLoading(true);
    const res = await fetch("/api/sheets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: sheetUuid }),
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
    setLoading(false);
    setArchivedSheets((prev) => prev.filter((s) => s.uuid !== sheetUuid));
    toast.success("Sheet deleted successfully", { position: "top-right" });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Archive Sheets!"
        pageDescription={
          <>
            Here you can view your archived sheets. For more information{" "}
            <Link className="underline hover:no-underline" href={`#`}>
              click here!
            </Link>
          </>
        }
      />

      <InBetweenSections className="gap-4">
        <div className="col-span-12">
          <div className="flex justify-end w-full mb-2">
            <Button
              onClick={fetchSheetsList}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Reload Archived Sheets"}
            </Button>
          </div>
        </div>
        {archivedSheets.length > 0 ? (
          archivedSheets.map((sheet, index) => (
            <Link
              key={index}
              href={`/sheets/editor?q=${sheet.slug}`}
              className="col-span-12 md:col-span-6 lg:col-span-4 w-full rounded-xl cursor-pointer"
            >
              <NotesPreviewCard
                key={index}
                data={{
                  title: sheet.title,
                  labels: sheet.labels,
                  slug: sheet.slug,
                  description: sheet.description,
                  createdBy: sheet.createdBy,
                  createdByFirstName: sheet.createdByFirstName,
                  createdByLastName: sheet.createdByLastName,
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
                            className={`cursor-pointer`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleArchiveSheets(sheet.uuid ?? "");
                            }}
                          >
                            Restore Sheets
                          </MenubarItem>
                          <MenubarItem
                            className={`cursor-pointer`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteSheets(sheet.uuid ?? "");
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
                              className={`cursor-pointer`}
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              Share
                            </MenubarSubTrigger>
                            <MenubarSubContent>
                              <MenubarGroup>
                                <MenubarItem
                                  className={`cursor-pointer`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  Copy Link
                                </MenubarItem>
                                <MenubarItem
                                  className={`cursor-pointer`}
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
              <EmptyTitle>No Archived Sheets Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t archived any sheets yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Link href="/sheets">
                <Button type="button" className="px-2.5 cursor-pointer">
                  <ArrowLeft /> <p>Return to Sheets</p>
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
