"use client";

import { PageTitleSections } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SheetsPage() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Sheets!"
        pageDescription={`Create your own spreadsheet!`}
        pageCta={
          <div className="flex gap-2">
            <Button type="button" className="px-2.5 cursor-pointer">
              <Plus /> <p>Add Sheets</p>
            </Button>
          </div>
        }
      />
    </div>
  );
}
