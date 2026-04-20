"use client";

import { SectionsWrapper } from "@/components/sections";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { NotesData } from "../page";
import { Separator } from "@/components/ui/separator";
import { Plate, usePlateEditor } from "platejs/react";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { EditorKit } from "@/components/editor/editor-kit";
import { normalizeContent, slugify } from "@/lib/helper";
import { CreatableSelect } from "@/components/app-creatable-select";

export default function NotesEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesEditorPageInnerContent />
    </Suspense>
  );
}

function NotesEditorPageInnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const uuid = searchParams.get("id");

  const [notes, setNotesContent] = useState<NotesData | undefined>();

  const editor = usePlateEditor({
    plugins: EditorKit,
  });

  useEffect(() => {
    if (!uuid) return;

    const fetchNotes = async () => {
      const res = await fetch(`/api/notes?id=${uuid}`);
      const json = await res.json();

      if (json?.data) {
        setNotesContent(json.data);
      }
    };

    fetchNotes();
  }, [uuid]);

  const handleTitleChange = (value: string) => {
    setNotesContent({ ...notes, title: value });

    const slug = slugify(value);

    if (slug) {
      router.replace(`/notes/editor?q=${slug}`);
    } else {
      router.replace(`/notes`);
    }
  };

  const lastSaved = useRef<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNotesChange = (data: any) => {
    const json = JSON.stringify(data);

    if (json === lastSaved.current) return;

    setNotesContent((prev) => (prev ? { ...prev, content: data } : prev));

    if (!uuid) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      console.log(data);
      try {
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid, content: data }),
        });

        lastSaved.current = json;
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!notes) return;

    const safeValue = normalizeContent(notes.content);

    editor.tf.setValue(safeValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes?.uuid]);

  if (!uuid) return <div>Invalid URL</div>;
  if (!notes) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <SectionsWrapper className="pt-8 pb-0">
        <CreatableSelect
          value={notes?.labels}
          onChange={(value) => setNotesContent({ ...notes, labels: value })}
          className="w-48"
        />

        <div className="relative flex flex-col">
          <span className="text-xs text-end text-muted-foreground">
            {notes?.title?.length ?? 0}/64
          </span>
          <Input
            type="text"
            value={notes?.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter note title..."
            className="w-full !border-0 !ring-0 !shadow-none focus:!ring-0 focus:!shadow-none focus-visible:!ring-0 focus-visible:!shadow-none outline-none !text-3xl font-bold bg-transparent p-0 h-auto"
            maxLength={64}
          />
        </div>
      </SectionsWrapper>

      <div className="flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24">
        <Separator />
      </div>

      <SectionsWrapper className="!py-0">
        <Plate
          editor={editor}
          onChange={({ value }) => {
            handleNotesChange(value);
          }}
        >
          <EditorContainer>
            <Editor
              placeholder="Type your amazing content here..."
              className="!px-4"
            />
          </EditorContainer>
        </Plate>
      </SectionsWrapper>
    </div>
  );
}
