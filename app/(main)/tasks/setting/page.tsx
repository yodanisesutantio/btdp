"use client";

import { InBetweenSections } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { emptyTasksBoard, TasksBoardData } from "../page";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/hooks/workspace-context";
import { toast } from "sonner";
import { slugify } from "@/lib/helper";

export default function TasksBoardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksBoardSettingPageInnerContent />
    </Suspense>
  );
}

function TasksBoardSettingPageInnerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uuid = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const { selectedWorkspace } = useWorkspace();
  const [taskBoard, setTaskBoard] = useState<TasksBoardData | null>(
    emptyTasksBoard,
  );

  const user = localStorage.getItem("user");
  const userObj = user ? JSON.parse(user) : null;

  const workspaceUuid = selectedWorkspace?.uuid;

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  const fetchTaskBoard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks-board?id=${uuid}`);
      const json = await res.json();

      if (json?.data) {
        setTaskBoard(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!uuid) return;

    fetchTaskBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const handleTitleChange = (value: string) => {
    setTaskBoard({ ...taskBoard, title: value });

    const slug = slugify(value);

    if (slug) {
      router.replace(`/tasks/setting?q=${slug}&id=${taskBoard?.uuid}`);
    } else {
      router.replace(`/notes`);
    }
  };

  const handleSaveTaskBoard = async (selectedBoard: TasksBoardData) => {
    setLoading(true);
    console.log(selectedBoard);

    if (userObj?.username !== "administrator" && !workspaceUuid) {
      toast.error("Please select a workspace first!", {
        description: "You must select a workspace to save task boards.",
        position: "top-right",
      });
      return;
    }

    const res = await fetch("/api/tasks-board", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid,
        title: selectedBoard.title,
        slug: selectedBoard.title,
        description: selectedBoard.description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      toast.error("Operation Failed!", {
        description: data.error,
        position: "top-right",
      });
      console.error(data.error);
      return;
    }

    setLoading(false);
    toast.success("Task board updated successfully", {
      position: "top-right",
    });
    fetchTaskBoard();
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center font-sans pb-8">
      <InBetweenSections className="gap-4">
        <div className="col-span-12">
          <h1 className="text-xl font-bold">General Board Information</h1>
          <p className="text-sm text-muted-foreground">
            Manage your board information
          </p>
        </div>
        <div className="col-span-12">
          <FieldSet>
            <div className="flex flex-row gap-5">
              <div className="w-1/2 flex flex-col gap-2">
                <FieldLabel htmlFor="title" className="gap-0">
                  Title<span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. December Budget"
                  value={taskBoard?.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <FieldLabel htmlFor="description" className="gap-0">
                  Description<span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="e.g. Brief summary of the tasks board"
                  value={taskBoard?.description}
                  onChange={(e) =>
                    setTaskBoard({
                      ...taskBoard,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end w-full mb-2">
              <Button
                className="cursor-pointer px-6"
                onClick={() => {
                  handleSaveTaskBoard(taskBoard ?? {});
                }}
              >
                {loading ? `Saving${dots}` : "Save"}
              </Button>
            </div>
          </FieldSet>
        </div>
      </InBetweenSections>
    </div>
  );
}
