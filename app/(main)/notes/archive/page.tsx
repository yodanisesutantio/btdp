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
import { NotesData } from "../page";
import { toast } from "sonner";

export default function ArchiveNotesPage() {
  const [archivedNotes, setArchivedNotes] = useState<NotesData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotesList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes/archived-list", {
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
      setArchivedNotes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesList();
  }, []);

  const handleArchiveNotes = async (noteUuid: string) => {
    setLoading(true);

    const res = await fetch("/api/notes/archive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: noteUuid,
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
    setArchivedNotes((prev) => prev.filter((s) => s.uuid !== noteUuid));
    toast.success("Note archived successfully", { position: "top-right" });
  };

  const handleDeleteNotes = async (noteUuid: string) => {
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: noteUuid }),
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
    setArchivedNotes((prev) => prev.filter((s) => s.uuid !== noteUuid));
    toast.success("Note deleted successfully", { position: "top-right" });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Archive Notes!"
        pageDescription={
          <>
            Here you can view your archived notes. For more information{" "}
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
              onClick={fetchNotesList}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Reload Archived Notes"}
            </Button>
          </div>
        </div>
        {archivedNotes.length > 0 ? (
          archivedNotes.map((note, index) => (
            <Link
              key={index}
              href={`/notes/editor?q=${note.slug}`}
              className="col-span-12 md:col-span-6 lg:col-span-4 w-full rounded-xl cursor-pointer"
            >
              <NotesPreviewCard
                key={index}
                data={{
                  title: note.title,
                  labels: note.labels,
                  slug: note.slug,
                  createdBy: note.createdBy,
                  createdAt: note.createdAt,
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
                              handleArchiveNotes(note.uuid ?? "");
                            }}
                          >
                            Restore Notes
                          </MenubarItem>
                          <MenubarItem
                            className={`cursor-pointer`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteNotes(note.uuid ?? "");
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
              <EmptyTitle>No Archived Notes Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t archived any notes yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Link href="/notes">
                <Button type="button" className="px-2.5 cursor-pointer">
                  <ArrowLeft /> <p>Return to Notes</p>
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
