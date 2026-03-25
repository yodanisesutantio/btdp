"use client";

import { AIChatPlugin } from "@platejs/ai/react";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import { getPluginTypes, isHotkey, KEYS } from "platejs";

import { BlockSelection } from "@/components/ui/block-selection";

export const BlockSelectionKit = [
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BlockSelectionPlugin.configure(({ editor }: { editor: any }) => ({
    options: {
      enableContextMenu: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isSelectable: (element: any) =>
        !getPluginTypes(editor, [KEYS.column, KEYS.codeLine, KEYS.td]).includes(
          element.type,
        ),
      onKeyDownSelecting: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor: any,
        e: React.KeyboardEvent<HTMLDivElement>,
      ) => {
        if (isHotkey("mod+j")(e)) {
          editor.getApi(AIChatPlugin).aiChat.show();
        }
      },
    },
    render: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      belowRootNodes: (props: any) => {
        if (!props.attributes.className?.includes("slate-selectable"))
          return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <BlockSelection {...(props as any)} />;
      },
    },
  })),
];
