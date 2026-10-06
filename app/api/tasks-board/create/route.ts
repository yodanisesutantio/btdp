import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateBoardPrefix } from "@/lib/helper";

export async function POST(req: Request) {
  try {
    const {
      title,
      slug,
      description,
      public: isPublic,
      workspaceUuid,
      created_by,
    } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    if (!workspaceUuid) {
      return NextResponse.json(
        { error: "workspaceUuid is required" },
        { status: 400 },
      );
    }

    const taskPrefix = generateBoardPrefix(title.trim());

    const { data, error } = await supabase
      .from("tasks_board_data")
      .insert([
        {
          title: title.trim(),
          slug,
          description,
          public: isPublic,
          archive: false,
          workspace_uuid: workspaceUuid,
          created_by,
          task_prefix: taskPrefix,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
