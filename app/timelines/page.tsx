"use client";

import { PageTitleSections } from "@/components/sections";

export default function TimelinesPage() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <PageTitleSections
        pageTitle="Welcome to Timelines!"
        pageDescription={`Check out what the others has been doing!`}
      />
    </div>
  );
}
