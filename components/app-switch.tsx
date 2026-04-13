"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export interface SwitchWithStateProps {
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean, checked: boolean) => void;
  name?: string;
  id?: string;
  size?: "sm" | "md" | "lg" | "default";
}

export function SwitchWithState(props: SwitchWithStateProps) {
  const [internalChecked, setInternalChecked] = useState(
    props.defaultChecked ?? false,
  );

  const isControlled = props.checked !== undefined;
  const currentChecked = isControlled ? props.checked : internalChecked;
  const handleChange = (val: boolean) => {
    if (!isControlled) setInternalChecked(val);
    props.onChange?.(val, val);
  };

  console.log(props.checked);

  return (
    <>
      <Switch
        id={props.id}
        size={props.size ?? "default"}
        className={props.className}
        checked={currentChecked}
        onCheckedChange={handleChange}
      />
      {props.name && (
        <input
          type="hidden"
          name={props.name}
          value={currentChecked ? "1" : "0"}
        />
      )}
    </>
  );
}
