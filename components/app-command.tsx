"use client";

import {
  User,
  LayoutPanelLeft,
  Sheet,
  Blocks,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./ui/command";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";
import Link from "next/link";
export interface AppCommandProps {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AppCommand(props: AppCommandProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (props.setOpen) props.setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.setOpen]);

  return (
    <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2">
          <Command className="max-w-sm rounded-lg border">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Features">
                <Link
                  href="/tasks"
                  className="flex flex-row items-center gap-2"
                >
                  <CommandItem className="w-full cursor-pointer">
                    <LayoutPanelLeft />
                    <span>Tasks Board</span>
                  </CommandItem>
                </Link>
                <Link
                  href="/sheets"
                  className="flex flex-row items-center gap-2"
                >
                  <CommandItem className="w-full cursor-pointer">
                    <Sheet />
                    <span>Sheets</span>
                  </CommandItem>
                </Link>
                <Link
                  href="/timelines"
                  className="flex flex-row items-center gap-2"
                >
                  <CommandItem className="w-full cursor-pointer">
                    <Blocks />
                    <span>Timelines</span>
                  </CommandItem>
                </Link>
                <Link
                  href="/notes"
                  className="flex flex-row items-center gap-2"
                >
                  <CommandItem className="w-full cursor-pointer">
                    <FileText />
                    <span>Notes</span>
                  </CommandItem>
                </Link>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Others">
                <Link
                  href="/profile"
                  className="flex flex-row items-center gap-2"
                >
                  <CommandItem className="w-full cursor-pointer">
                    <User />
                    <span>Profile</span>
                  </CommandItem>
                </Link>
                <Link
                  href="/help"
                  className="w-full flex flex-row items-center gap-2"
                >
                  <CommandItem className="w-full cursor-pointer">
                    <div className="w-full flex flex-row justify-between">
                      <div className="flex flex-row gap-2">
                        <HelpCircle />
                        <span>Help</span>
                      </div>
                      <CommandShortcut>F1</CommandShortcut>
                    </div>
                  </CommandItem>
                </Link>
              </CommandGroup>
            </CommandList>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
