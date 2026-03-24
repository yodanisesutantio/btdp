"use client";

import { SectionsWrapper } from "@/components/sections";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NotesData } from "../page";
import { Separator } from "@/components/ui/separator";

export default function NotesEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesEditorPageInnerContent />
    </Suspense>
  );
}

function NotesEditorPageInnerContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [notes, setNotes] = useState<NotesData>();
  console.log(notes);

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <SectionsWrapper className="pt-8 pb-0">
        <div className="relative flex flex-col">
          <Input
            type="text"
            value={notes?.title}
            onChange={(e) => setNotes({ ...notes, title: e.target.value })}
            placeholder="Enter note title..."
            className="w-full !border-0 !ring-0 !shadow-none focus:!ring-0 focus:!shadow-none focus-visible:!ring-0 focus-visible:!shadow-none outline-none !text-3xl font-bold bg-transparent p-0 h-auto"
            maxLength={64}
          />
          <span className="text-xs text-end text-muted-foreground">
            {notes?.title?.length ?? 0}/64
          </span>
        </div>
      </SectionsWrapper>

      <div className="flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24">
        <Separator />
      </div>
    </div>
  );
}
