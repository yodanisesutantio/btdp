"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { Suspense } from "react";

export interface PageBreadcrumbsProps {
  className?: string;
}

export default function PageBreadcrumbs(props: PageBreadcrumbsProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageBreadcrumbsInnerContent {...props} />
    </Suspense>
  );
}

function PageBreadcrumbsInnerContent(props: PageBreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const searchParams = useSearchParams();
  const queryTitle = searchParams.get("q");

  const formatLabel = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Breadcrumb className={`${props.className} flex items-center`}>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          const label =
            isLast && queryTitle
              ? formatLabel(queryTitle)
              : formatLabel(segment);

          return (
            <div key={href} className="flex items-center gap-1.5 sm:gap-2">
              {index !== 0 && <BreadcrumbSeparator />}

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
