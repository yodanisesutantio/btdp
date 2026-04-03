"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import SheetEditor from "@/components/sheet-editor";
import { dummySheets, SheetsData } from "../page";
import type { IWorkbookData } from "@univerjs/presets";

export default function SheetsEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SheetsEditorPageInnerContent />
    </Suspense>
  );
}

function SheetsEditorPageInnerContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("q");

  const [sheets, setSheetsContent] = useState<SheetsData | undefined>(
    dummySheets?.find((s) => s.slug === slug),
  );

  const workbookData: IWorkbookData | undefined = sheets?.content;

  const handleWorkbookChange = (data: IWorkbookData) => {
    console.log("Workbook updated:", data);

    setSheetsContent((prev) => (prev ? { ...prev, content: data } : prev));
  };

  if (!sheets) return <div>Sheet not found</div>;

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans">
      <div className="w-full h-[calc(100vh-40px)]">
        <SheetEditor value={workbookData} onChange={handleWorkbookChange} />
      </div>
    </div>
  );
}
