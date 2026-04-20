"use client";

import { NotesPreviewCard } from "@/components/app-card";
import { CreatableSelect } from "@/components/app-creatable-select";
import { DialogStickyFooter } from "@/components/app-sticky-footer-dialog";
import { SwitchWithState } from "@/components/app-switch";
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
import { slugify } from "@/lib/helper";
import { ArrowUpRightIcon, Ellipsis, FolderCode, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface NotesData {
  imagePreview?: string;
  uuid?: string;
  title?: string;
  labels?: string;
  slug?: string;
  public?: boolean;
  description?: string;
  content?: string;
  createdBy?: string;
  createdByFirstName?: string;
  createdByLastName?: string;
  createdAt?: string;
}

const emptyNotes: NotesData = {
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

export default function NotesPage() {
  const [notes, setNotes] = useState<NotesData[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<NotesData | null>(
    emptyNotes,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  const user = localStorage.getItem("user");

  const openDialogCreateNotes = () => {
    setOpenDialog(true);
    setSelectedNotes(emptyNotes);
  };

  const closeDialogCreateNotes = () => {
    setOpenDialog(false);
    setSelectedNotes(null);
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

  const fetchNotesList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes/list", {
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
      setNotes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesList();
  }, []);

  const handleSaveNotes = async (selectedNotes: NotesData) => {
    setLoading(true);
    const userObj = user ? JSON.parse(user) : null;

    const res = await fetch("/api/notes/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: selectedNotes.title,
        slug: selectedNotes.slug,
        description: selectedNotes.description ?? "",
        public: selectedNotes.public,
        labels: selectedNotes.labels ?? "",
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
    toast.success("Notes created successfully", { position: "top-right" });
  };

  const handleArchiveNotes = async (noteUuid: string) => {
    setLoading(true);

    const res = await fetch("/api/notes/archive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: noteUuid,
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
    setNotes((prev) => prev.filter((s) => s.uuid !== noteUuid));
    toast.success("Notes archived successfully", { position: "top-right" });
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
    setNotes((prev) => prev.filter((s) => s.uuid !== noteUuid));
    toast.success("Notes deleted successfully", { position: "top-right" });
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Notes!"
        pageDescription={
          <>
            Here you can write and/or brainstorm about your upcoming projects.
            Try to invite other participant to contribute to your notes. For
            more information{" "}
            <Link className="underline hover:no-underline" href={`#`}>
              click here!
            </Link>
          </>
        }
        pageCta={
          <div className="flex gap-2">
            <Button
              type="button"
              className="px-2.5 cursor-pointer"
              onClick={openDialogCreateNotes}
            >
              <Plus /> <p>Add Notes</p>
            </Button>
            <Button
              variant={`secondary`}
              type="button"
              className="px-2.5 cursor-pointer"
            >
              <Link href="/notes/archive">
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
              onClick={fetchNotesList}
              disabled={loading}
              size="sm"
              className={`cursor-pointer`}
              variant={`outline`}
            >
              {loading ? "Refreshing..." : "Reload Notes"}
            </Button>
          </div>
        </div>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <Link
              key={index}
              href={`/notes/editor?q=${note.slug}&id=${note.uuid}`}
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
                              handleArchiveNotes(note?.uuid ?? "");
                            }}
                          >
                            Archive
                          </MenubarItem>
                          <MenubarItem
                            className={`cursor-pointer`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteNotes(note?.uuid ?? "");
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
              <EmptyTitle>No Notes Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any notes yet. Get started by creating
                your first note.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button
                type="button"
                className="px-2.5 cursor-pointer"
                onClick={openDialogCreateNotes}
              >
                <Plus /> <p>Create your first note</p>
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
        dialogTitle="Create New Note"
        content={
          <FieldSet>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="title" className="gap-0">
                Note Title<span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="e.g. 18th April Meeting Notes"
                value={selectedNotes?.title}
                onChange={(e) =>
                  setSelectedNotes({
                    ...selectedNotes,
                    title: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="description">Note Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="e.g. Brief summary of the note"
                value={selectedNotes?.description}
                onChange={(e) =>
                  setSelectedNotes({
                    ...selectedNotes,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-row gap-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="title">Labels</FieldLabel>
                <CreatableSelect
                  value={selectedNotes?.labels}
                  onChange={(value) =>
                    setSelectedNotes({ ...selectedNotes, labels: value })
                  }
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="title">Public</FieldLabel>
                <div className="flex items-center space-x-2 h-[36px]">
                  <SwitchWithState
                    id="note-public"
                    name="note-public"
                    size={`lg`}
                    checked={selectedNotes?.public ? true : false}
                    onChange={(val) =>
                      setSelectedNotes({ ...selectedNotes, public: val })
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
              onClick={closeDialogCreateNotes}
              className="cursor-pointer"
            >
              Discard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleSaveNotes(selectedNotes ?? {});
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
