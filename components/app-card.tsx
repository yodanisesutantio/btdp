"use client";

import { NotesData } from "@/app/notes/page";
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

export interface NotesPreviewCardProps extends AppCardProps {
  notes?: NotesData;
  cardMenubar?: React.ReactElement;
}

export function NotesPreviewCard(props: NotesPreviewCardProps) {
  return (
    <>
      {props.notes && (
        <Card
          key={props.notes.slug}
          className={`group relative mx-auto w-full pt-0 ${props.className ?? ""}`}
        >
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          {props.cardMenubar && (
            <div className="absolute opacity-0 group-hover:opacity-100 top-4 right-4 z-40 transition-all duration-300">
              {props.cardMenubar}
            </div>
          )}
          <Image
            src={props.notes.imagePreview ?? "https://avatar.vercel.sh/shadcn1"}
            alt="Event cover"
            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            width={800}
            height={450}
          />
          <CardHeader className={`${props.cardHeaderClassName ?? ""}`}>
            <CardAction>
              <Badge variant="secondary">
                {(() => {
                  const s = Array.isArray(props.notes.labels)
                    ? props.notes.labels.join(", ")
                    : String(props.notes.labels ?? "");
                  return s.length > 16 ? `${s.slice(0, 16)}...` : s;
                })()}
              </Badge>
            </CardAction>
            <CardTitle className="w-full truncate">
              {props.notes.title}
            </CardTitle>
          </CardHeader>
          <CardDescription className="px-6"></CardDescription>
          <CardFooter
            className={`gap-3 text-xs ${props.cardFooterClassName ?? ""}`}
          >
            <div className="flex w-full justify-between">
              <div className="flex flex-col max-w-1/2 gap-1">
                <p>Created By:</p>
                <p className="w-full truncate">{props.notes.createdBy}</p>
              </div>
              <div className="flex flex-col max-w-1/2 gap-1 text-end">
                <p>Created At:</p>
                <p className="w-full truncate">
                  {props.notes.createdAt
                    ? new Date(props.notes.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )
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
