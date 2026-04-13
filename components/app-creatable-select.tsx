"use client";

import { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  label: string;
  value: string;
  groups?: string;
};

export interface CreatableSelectProps {
  value?: string;
  onChange: (val: string) => void;
  className?: string;
  required?: boolean;
}

export function CreatableSelect(props: CreatableSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([
    { label: "Work", value: "Work" },
    { label: "Private", value: "Private" },
    { label: "Personal", value: "Personal" },
  ]);
  const [input, setInput] = useState("");

  const selected = options.find((o) => o.value === props.value);

  const handleCreate = () => {
    const newOption = {
      label: input,
      value: input.toLowerCase().replace(/\s+/g, "-"),
    };
    setOptions((prev) => [...prev, newOption]);
    props.onChange(newOption.value);
    setInput("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={`${props.className ?? ""}`}>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between cursor-pointer`}
        >
          {selected ? selected.label : "Select or create..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search or create..."
            value={input}
            onValueChange={setInput}
          />

          <CommandEmpty className="py-0 p-1 rounded-sm overflow-hidden">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-3 py-2 text-sm w-full cursor-pointer hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
              Create &ldquo;{input}&rdquo;
            </button>
          </CommandEmpty>

          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  props.onChange(option.value);
                  setOpen(false);
                }}
                className={`${selected?.value === option.value ? "bg-foreground text-background hover:bg-foreground hover:text-background" : ""}`}
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
