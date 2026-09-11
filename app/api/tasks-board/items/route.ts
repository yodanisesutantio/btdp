import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateBoardPrefix } from "@/lib/helper";

async function generateTaskKey(boardUuid: string) {
  const { data: board, error: boardError } = await supabase
    .from("tasks_board_data")
    .select("title")
    .eq("uuid", boardUuid)
    .single();

  if (boardError) {
    throw new Error(boardError.message);
  }

  const prefix = generateBoardPrefix(board.title ?? "Task");

  const { data: items, error: itemsError } = await supabase
    .from("tasks_board_items_data")
    .select("key")
    .eq("board_uuid", boardUuid)
    .like("key", `${prefix}-%`)
    .is("deleted_at", null);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  let highestNumber = 0;

  for (const item of items ?? []) {
    const match = item.key?.match(
      new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`),
    );

    if (!match) continue;

    const number = Number(match[1]);

    if (number > highestNumber) {
      highestNumber = number;
    }
  }

  return `${prefix}-${String(highestNumber + 1).padStart(3, "0")}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const stateUuid = searchParams.get("state_uuid");
    const boardUuid = searchParams.get("board_uuid");
    const uuid = searchParams.get("uuid");
    const includeArchived = searchParams.get("include_archived") === "true";

    let query = supabase
      .from("tasks_board_items_data")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (uuid) {
      query = query.eq("uuid", uuid);
    }

    if (stateUuid) {
      query = query.eq("state_uuid", stateUuid);
    }

    if (boardUuid) {
      query = query.eq("board_uuid", boardUuid);
    }

    if (!includeArchived) {
      query = query.eq("archive", false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const parsedData = (data ?? []).map((item) => ({
      ...item,
      content: item.content
        ? (() => {
            try {
              return JSON.parse(item.content);
            } catch {
              return item.content;
            }
          })()
        : [],
      labels:
        typeof item.labels === "string"
          ? (() => {
              try {
                return JSON.parse(item.labels);
              } catch {
                return item.labels;
              }
            })()
          : item.labels,
    }));

    return NextResponse.json({ data: parsedData });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      workspace_uuid,
      board_uuid,
      state_uuid,
      title,
      content,
      priority,
      start_date,
      end_date,
      labels,
      created_by,
    } = body;

    if (!workspace_uuid) {
      return NextResponse.json(
        { error: "workspace_uuid is required" },
        { status: 400 },
      );
    }

    if (!board_uuid) {
      return NextResponse.json(
        { error: "board_uuid is required" },
        { status: 400 },
      );
    }

    if (!state_uuid) {
      return NextResponse.json(
        { error: "state_uuid is required" },
        { status: 400 },
      );
    }

    const taskKey = await generateTaskKey(board_uuid);

    const taskTitle = title?.trim() || "Untitled task";

    const { data, error } = await supabase
      .from("tasks_board_items_data")
      .insert({
        workspace_uuid,
        board_uuid,
        state_uuid,
        key: taskKey,
        title: taskTitle,
        content: JSON.stringify(content ?? []),
        priority: priority ?? "none",
        start_date: start_date || null,
        end_date: end_date || null,
        labels:
          labels === undefined || labels === null
            ? null
            : typeof labels === "string"
              ? labels
              : JSON.stringify(labels),
        created_by: created_by || null,
        archive: false,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...data,
          content: content ?? [],
          labels,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { uuid } = body;

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.content !== undefined) {
      updateData.content = JSON.stringify(body.content);
    }

    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }

    if (body.start_date !== undefined) {
      updateData.start_date = body.start_date || null;
    }

    if (body.end_date !== undefined) {
      updateData.end_date = body.end_date || null;
    }

    if (body.labels !== undefined) {
      updateData.labels =
        body.labels === null
          ? null
          : typeof body.labels === "string"
            ? body.labels
            : JSON.stringify(body.labels);
    }

    if (body.state_uuid !== undefined) {
      updateData.state_uuid = body.state_uuid;
    }

    if (body.archive !== undefined) {
      updateData.archive = body.archive;
    }

    const { data, error } = await supabase
      .from("tasks_board_items_data")
      .update(updateData)
      .eq("uuid", uuid)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
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

export async function DELETE(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("tasks_board_items_data")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("uuid", uuid)
      .is("deleted_at", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
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
