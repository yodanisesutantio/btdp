"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8"></div>
  );
}
