"use client";

import { Badge } from "./ui/badge";
import {
  Card,
  CardHeader,
  CardAction,
  CardTitle,
  CardFooter,
  CardDescription,
} from "./ui/card";
import Image from "next/image";

export interface AppCardProps {
  className?: string;
  cardHeaderClassName?: string;
  cardFooterClassName?: string;
}

export interface NotesPreviewCardProps<T> extends AppCardProps {
  data?: T;
  cardMenubar?: React.ReactElement;
}

export function NotesPreviewCard<T>(props: NotesPreviewCardProps<T>) {
  console.log(props?.data);
  return (
    <>
      {props.data && (
        <Card
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          key={(props.data as any).slug}
          className={`group relative mx-auto w-full pt-0 ${props.className ?? ""}`}
        >
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          {props.cardMenubar && (
            <div className="absolute opacity-0 group-hover:opacity-100 top-4 right-4 z-40 transition-all duration-300">
              {props.cardMenubar}
            </div>
          )}
          <Image
            src={
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (props.data as any).imagePreview ??
              "https://avatar.vercel.sh/shadcn1"
            }
            alt="Event cover"
            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            width={800}
            height={450}
          />
          <CardHeader className={`${props.cardHeaderClassName ?? ""}`}>
            <CardAction>
              <Badge variant="secondary">
                {(() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const s = Array.isArray((props.data as any).labels)
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (props.data as any).labels.join(", ")
                    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      String((props.data as any).labels ?? "");
                  return s.length > 16 ? `${s.slice(0, 16)}...` : s;
                })()}
              </Badge>
            </CardAction>
            <CardTitle className="w-full truncate">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(props.data as any).title}
            </CardTitle>
          </CardHeader>
          <CardDescription className="px-4 line-clamp-3 text-xs">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(props.data as any).description}
          </CardDescription>
          <CardFooter
            className={`gap-3 text-xs ${props.cardFooterClassName ?? ""}`}
          >
            <div className="flex w-full justify-between">
              <div className="flex flex-col max-w-1/2 gap-1">
                <p>Created By:</p>
                <p className="w-full flex flex-row items-center gap-2 truncate">
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    src={`https://ui-avatars.com/api/?name=${`${(props.data as any).createdByFirstName || ""} ${(props.data as any).createdByLastName || ""}`.trim()}`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    alt={(props.data as any).createdBy}
                    className="rounded-full w-6 h-6 shrink-0 object-cover cursor-pointer"
                    width={12}
                    height={12}
                    unoptimized
                  />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(props.data as any).createdBy}
                </p>
              </div>
              <div className="flex flex-col max-w-1/2 gap-1 text-end">
                <p>Created At:</p>
                <p className="w-full truncate">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(props.data as any).createdAt
                    ? new Date(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (props.data as any).createdAt,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
