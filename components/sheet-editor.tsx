"use client";

import { useEffect, useRef } from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import type { IWorkbookData } from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";

interface SheetEditorProps {
  value?: IWorkbookData;
  onChange?: (data: IWorkbookData) => void;
}

export default function SheetEditor({ value, onChange }: SheetEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const univerAPIRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    univerAPIRef.current = univerAPI;

    univerAPI.createWorkbook(value ?? {});

    const disposable = univerAPI.addEvent(
      univerAPI.Event.SheetValueChanged,
      () => {
        const wb = univerAPI.getActiveWorkbook();
        const snapshot = wb?.getSnapshot();
        if (snapshot && onChange) onChange(snapshot);
      },
    );

    return () => {
      disposable.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const univerAPI = univerAPIRef.current;
    if (!univerAPI || !value) return;

    const wb = univerAPI.getActiveWorkbook();
    wb?.endEditingAsync(true).then(() => {
      wb?.setWorkbookData?.(value);
    });
  }, [value]);

  return <div ref={containerRef} className="w-full h-full" />;
}
