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
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/helper";
import { ArrowUpRightIcon, Ellipsis, FolderCode, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface SheetsData {
  imagePreview?: string;
  title?: string;
  labels?: string;
  slug?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  public?: boolean;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}

const emptySheets: SheetsData = {
  imagePreview: "",
  title: "",
  labels: "",
  slug: "",
  public: true,
  description: "",
  content: "",
  createdBy: "",
  createdAt: "",
};

// export const dummySheets: SheetsData[] = [
//   {
//     title: "My First Sheet",
//     labels: "Personal",
//     slug: "my-first-sheet",
//     createdBy: "Random User",
//     createdAt: "2023-01-01",
//   },
// ];

export default function SheetsPage() {
  const [sheets, setSheets] = useState<SheetsData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<SheetsData | null>(
    emptySheets,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  const user = localStorage.getItem("user");

  const openDialogCreateSheet = () => {
    setOpenDialog(true);
    setSelectedSheet(emptySheets);
  };

  const closeDialogCreateSheet = () => {
    setOpenDialog(false);
    setSelectedSheet(null);
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

  const fetchSheetsList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sheets/list", {
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
      setSheets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetsList();
  }, []);

  const handleSaveSheets = async (selectedSheet: SheetsData) => {
    setLoading(true);
    const userObj = user ? JSON.parse(user) : null;

    const res = await fetch("/api/sheets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: selectedSheet.title,
        slug: selectedSheet.slug,
        description: selectedSheet.description ?? "",
        public: selectedSheet.public,
        labels: selectedSheet.labels ?? "",
        content: {},
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
    setLoading(false);
    setOpenDialog(false);
    toast.success("Sheet created successfully", { position: "top-right" });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Sheets!"
        pageDescription={`Create your own spreadsheet!`}
        pageCta={
          <div className="flex gap-2">
            <Button
              type="button"
              className="px-2.5 cursor-pointer"
              onClick={openDialogCreateSheet}
            >
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
        <div className="col-span-12">
          <div className="flex justify-end w-full mb-2">
            <Button
              onClick={fetchSheetsList}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Refetch Sheets"}
            </Button>
          </div>
        </div>
        {sheets.length > 0 ? (
          sheets.map((sheet, index) => (
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
              <Button
                type="button"
                className="px-2.5 cursor-pointer"
                onClick={openDialogCreateSheet}
              >
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

      <DialogStickyFooter
        open={openDialog}
        onOpenChange={setOpenDialog}
        dialogTitle="Create New Sheet"
        content={
          <FieldSet>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                Sheets Title<span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="e.g. December Budget"
                value={selectedSheet?.title}
                onChange={(e) =>
                  setSelectedSheet({
                    ...selectedSheet,
                    title: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="description">Sheets Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="e.g. December Budget"
                value={selectedSheet?.description}
                onChange={(e) =>
                  setSelectedSheet({
                    ...selectedSheet,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-row gap-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="title">Labels</FieldLabel>
                <CreatableSelect
                  value={selectedSheet?.labels}
                  onChange={(value) =>
                    setSelectedSheet({ ...selectedSheet, labels: value })
                  }
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="title">Public</FieldLabel>
                <div className="flex items-center space-x-2 h-[36px]">
                  <SwitchWithState
                    id="sheet-public"
                    name="sheet-public"
                    size={`lg`}
                    checked={selectedSheet?.public ? true : false}
                    onChange={(val) =>
                      setSelectedSheet({ ...selectedSheet, public: val })
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
              onClick={closeDialogCreateSheet}
              className="cursor-pointer"
            >
              Discard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleSaveSheets(selectedSheet ?? {});
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
