"use client";

import { TasksState } from "@/app/(main)/tasks/page";
import { TableCell, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Check, GripVertical, MoreHorizontal, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { slugify } from "@/lib/helper";

function SortableTaskStateRow({
  state,
  onStateChange,
  onStateDefault,
  onStateDelete,
}: {
  state: TasksState;
  onStateChange: (state: TasksState) => void;
  onStateDefault: (uuid: string) => void;
  onStateDelete: (uuid: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: state.uuid ?? "",
    });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(state.title);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTitle = () => {
      setTitle(state.title);
    };
    updateTitle();
  }, [state.title]);

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditing]);

  const saveTitle = () => {
    setIsEditing(false);

    const trimmed = title && title.trim();

    if (!trimmed) {
      setTitle(state.title);
      return;
    }

    if (trimmed !== state.title) {
      onStateChange({
        ...state,
        title: trimmed,
        key: slugify(trimmed),
      });
    } else {
      setTitle(state.title);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="!w-[7%] text-center">
        <Button
          className={`cursor-pointer`}
          variant="ghost"
          size="icon"
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>
      </TableCell>

      <TableCell className="!w-[65%]">
        {isEditing ? (
          <div className="relative flex items-center">
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveTitle();
                }

                if (e.key === "Escape") {
                  setTitle(state.title);
                  setIsEditing(false);
                }
              }}
              className="h-8 pr-16"
            />

            <div className="absolute right-1 flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 cursor-pointer text-green-600 hover:text-green-700"
                onMouseDown={(e) => e.preventDefault()}
                onClick={saveTitle}
              >
                <Check className="size-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 cursor-pointer text-red-600 hover:text-red-700"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTitle(state.title);
                  setIsEditing(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-text"
            onClick={() => setIsEditing(true)}
          >
            <span>{state.title}</span>

            {!!state.default && <Badge variant="secondary">Default</Badge>}
          </div>
        )}
      </TableCell>
      <TableCell className="!w-[18%]">
        <div
          className="h-8 w-8 rounded-full border cursor-pointer"
          style={{ backgroundColor: state.color }}
          onClick={() => colorInputRef.current?.click()}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={state.color}
          onChange={(e) =>
            onStateChange({
              ...state,
              color: e.target.value,
            })
          }
          className="sr-only"
        />
      </TableCell>
      <TableCell className="!w-[10%] text-center">
        <DropdownMenu>
          <DropdownMenuTrigger className={`cursor-pointer`}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
            >
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-40`}>
            <DropdownMenuItem
              onClick={() => {
                onStateDefault(state.uuid ?? "");
              }}
              className={`cursor-pointer`}
            >
              Set As Default State
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                onStateDelete(state.uuid ?? "");
              }}
              className={`cursor-pointer`}
            >
              Delete State
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default SortableTaskStateRow;
