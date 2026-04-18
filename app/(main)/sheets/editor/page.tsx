"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import SheetEditor from "@/components/sheet-editor";
import { SheetsData } from "../page";
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
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const uuid = searchParams.get("id");

  const [sheets, setSheetsContent] = useState<SheetsData | undefined>();

  useEffect(() => {
    if (!uuid) return;

    const fetchSheet = async () => {
      const res = await fetch(`/api/sheets?id=${uuid}`);
      const json = await res.json();

      if (json?.data) {
        setSheetsContent(json.data);
      }
    };

    fetchSheet();
  }, [uuid]);

  const workbookData: IWorkbookData | undefined = (() => {
    try {
      return sheets?.content ? JSON.parse(sheets.content) : undefined;
    } catch {
      return undefined;
    }
  })();

  const handleWorkbookChange = (data: IWorkbookData) => {
    setSheetsContent((prev) => (prev ? { ...prev, content: data } : prev));

    if (!uuid) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        await fetch("/api/sheets", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uuid,
            content: data,
          }),
        });
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

  if (!uuid) return <div>Invalid URL</div>;
  if (!sheets) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans">
      <div className="w-full h-[calc(100vh-40px)]">
        <SheetEditor value={workbookData} onChange={handleWorkbookChange} />
      </div>
    </div>
  );
}
