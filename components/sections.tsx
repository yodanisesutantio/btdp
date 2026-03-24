"use client";

import { Separator } from "./ui/separator";

export interface SectionsProps {
  children?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string | React.ReactNode;
  pageCta?: React.ReactNode;
  className?: string;
}

export function PageTitleSections(props: SectionsProps) {
  return (
    <>
      <section
        className={`flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24 py-4 md:py-8 lg:py-12 ${props.className ?? ""}`}
      >
        <h1 className="text-3xl font-bold">{props.pageTitle ?? "To-Do App"}</h1>
        <p className="text-sm text-muted-foreground">
          {props.pageDescription ??
            "Every major task can be split into a smaller task, start your task management here."}
        </p>
        {props.pageCta && <div className="pt-4">{props.pageCta}</div>}
      </section>

      <div className="flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24">
        <Separator />
      </div>
    </>
  );
}

export function SectionsWrapper(props: SectionsProps) {
  return (
    <>
      <section
        className={`flex flex-col gap-2 w-full px-6 md:px-12 lg:px-24 py-4 ${props.className ?? ""}`}
      >
        {props.children}
      </section>
    </>
  );
}

export function InBetweenSections(props: SectionsProps) {
  return (
    <section
      className={`w-full grid grid-cols-12 gap-2 px-6 md:px-12 lg:px-24 py-4 ${props.className ?? ""}`}
    >
      {props.children}
    </section>
  );
}
