"use client";

import { WorkspaceData } from "@/app/(main)/workspaces/page";
import { createContext, useContext, useEffect, useState } from "react";

interface WorkspaceContextType {
  selectedWorkspace: WorkspaceData | null;
  setSelectedWorkspace: (workspace: WorkspaceData | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedWorkspace, setSelectedWorkspaceState] =
    useState<WorkspaceData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selected-workspace-data");

    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedWorkspaceState(JSON.parse(saved));
      } catch {
        localStorage.removeItem("selected-workspace-data");
      }
    }
  }, []);

  const setSelectedWorkspace = (workspace: WorkspaceData | null) => {
    setSelectedWorkspaceState(workspace);

    if (workspace) {
      localStorage.setItem(
        "selected-workspace-data",
        JSON.stringify(workspace),
      );
    } else {
      localStorage.removeItem("selected-workspace-data");
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspace,
        setSelectedWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}
