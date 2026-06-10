"use client";

import { TasksState } from "@/app/(main)/tasks/page";
import { TableCell, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function SortableTaskStateRow({ state }: { state: TasksState }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: state.uuid ?? "",
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="!w-[7%]">
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

      <TableCell className="!w-[65%]">{state.title}</TableCell>
      <TableCell className="!w-[18%]">{state.color}</TableCell>
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
            <DropdownMenuItem className={`cursor-pointer`}>
              Set As Default State
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => {}}
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
