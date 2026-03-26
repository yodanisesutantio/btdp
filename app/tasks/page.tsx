"use client";

import { PageTitleSections } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Tasks Board!"
        pageDescription={`Here you can manage and watch over the entire projects!`}
        pageCta={
          <div className="flex gap-2">
            <Button type="button" className="px-2.5 cursor-pointer">
              <Plus /> <p>Add Tasks</p>
            </Button>
          </div>
        }
      />
    </div>
  );
}
