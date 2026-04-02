"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { dummySheets, SheetsData } from "../page";

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

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8"></div>
  );
}
