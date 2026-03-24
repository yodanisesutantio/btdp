"use client";

import { ItemSections } from "@/components/item-sections";
import { Separator } from "@/components/ui/separator";
import {
  BadgeQuestionMark,
  Blocks,
  FileText,
  FlagTriangleRight,
  Headset,
  LayoutPanelLeft,
  Proportions,
  Sheet,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <section className="flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24 py-4 md:py-8 lg:py-12">
        <h1 className="text-3xl font-bold">To-Do App</h1>
        <p className="text-sm text-muted-foreground">
          Every major task can be split into a smaller task, start your task
          management here.
        </p>
      </section>

      <div className="flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24">
        <Separator />
      </div>

      <section className="w-full grid grid-cols-12 gap-2 px-6 md:px-12 lg:px-24 py-4">
        <ItemSections
          sectionHeader="Getting Started"
          sectionDescription="A quick guide to get you started with our product"
          items={[
            {
              href: "#",
              icons: <FlagTriangleRight className="size-9" />,
              title: "Quick Start",
              description:
                "A short guide to get you started and getting a hang of our product",
              disabled: true,
            },
          ]}
        />
      </section>

      <section className="w-full grid grid-cols-12 gap-2 px-6 md:px-12 lg:px-24 py-4">
        <ItemSections
          sectionHeader="Features"
          sectionDescription="Some of our features that you can use to manage and make your
            projects come true"
          items={[
            {
              href: "/tasks",
              icons: <LayoutPanelLeft className="size-9" />,
              title: "Tasks Board",
              description:
                "Manage your tasks and brainstorm with your partner in one place",
            },
            {
              href: "/sheets",
              icons: <Sheet className="size-9" />,
              title: "Sheets",
              description: "Manage your budget preparation and adjust smartly",
            },
            {
              href: "/timelines",
              icons: <Blocks className="size-9" />,
              title: "Timelines",
              description: "Share your preparation with families/friends",
            },
            {
              href: "/notes",
              icons: <FileText className="size-9" />,
              title: "Notes",
              description:
                "Sometimes, big idea comes from an array of a small ideas",
            },
          ]}
        />
      </section>

      <section className="w-full grid grid-cols-12 gap-2 px-6 md:px-12 lg:px-24 py-4">
        <ItemSections
          sectionHeader="Others"
          sectionDescription="Other features that you might want to check out!"
          items={[
            {
              href: "#",
              icons: <Proportions className="size-9" />,
              title: "Reports",
              description: "Get the summary of your projects progress",
              disabled: true,
            },
            {
              href: "#",
              icons: <BadgeQuestionMark className="size-9" />,
              title: "FAQ",
              description:
                "Find answers to your questions and to help you getting things around",
              disabled: true,
            },
            {
              href: "#",
              icons: <Headset className="size-9" />,
              title: "Contact Devs",
              description:
                "Do you need any help to use the application? Feel free to reach me out.",
              disabled: true,
            },
          ]}
        />
      </section>
    </div>
  );
}
