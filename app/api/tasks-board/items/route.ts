import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function generateTaskKey(boardUuid: string) {
  const { data: board, error: boardError } = await supabase
    .from("tasks_board_data")
    .select("task_prefix")
    .eq("uuid", boardUuid)
    .is("deleted_at", null)
    .single();

  if (boardError) {
    throw new Error(boardError.message);
  }

  if (!board.task_prefix) {
    throw new Error("Board task prefix is not configured");
  }

  const { data: items, error: itemsError } = await supabase
    .from("tasks_board_items_data")
    .select("key")
    .eq("board_uuid", boardUuid)
    .like("key", `${board.task_prefix}-%`)
    .is("deleted_at", null);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  let highestNumber = 0;

  for (const item of items ?? []) {
    const match = item.key?.match(
      new RegExp(
        `^${board.task_prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`,
      ),
    );

    if (!match) continue;

    const number = Number(match[1]);

    if (number > highestNumber) {
      highestNumber = number;
    }
  }

  return `${board.task_prefix}-${String(highestNumber + 1).padStart(3, "0")}`;
}

async function getTaskAssignees(taskUuids: string[]) {
  if (taskUuids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("tasks_board_items_assignee_data")
    .select(
      `
        task_uuid,
        user_uuid,
        users (
          uuid,
          username,
          first_name,
          last_name
        )
      `,
    )
    .in("task_uuid", taskUuids)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const assigneesByTask = new Map<
    string,
    Array<{
      uuid: string;
      username?: string | null;
      first_name?: string | null;
      last_name?: string | null;
    }>
  >();

  for (const row of data ?? []) {
    if (!row.users) continue;

    const user = Array.isArray(row.users) ? row.users[0] : row.users;

    if (!user) continue;

    const existing = assigneesByTask.get(row.task_uuid) ?? [];

    existing.push({
      uuid: user.uuid,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    });

    assigneesByTask.set(row.task_uuid, existing);
  }

  return assigneesByTask;
}

async function syncTaskAssignees(
  taskUuid: string,
  workspaceUuid: string,
  boardUuid: string,
  assigneeUuids: string[],
) {
  const uniqueAssigneeUuids = [
    ...new Set(
      assigneeUuids.filter(
        (userUuid): userUuid is string =>
          typeof userUuid === "string" && userUuid.trim().length > 0,
      ),
    ),
  ];

  const now = new Date().toISOString();

  const { data: existingRows, error: existingError } = await supabase
    .from("tasks_board_items_assignee_data")
    .select("id, user_uuid, deleted_at")
    .eq("task_uuid", taskUuid);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingByUser = new Map(
    (existingRows ?? []).map((row) => [row.user_uuid, row]),
  );

  for (const userUuid of uniqueAssigneeUuids) {
    const existing = existingByUser.get(userUuid);

    if (existing) {
      if (existing.deleted_at !== null) {
        const { error } = await supabase
          .from("tasks_board_items_assignee_data")
          .update({
            deleted_at: null,
            updated_at: now,
          })
          .eq("id", existing.id);

        if (error) {
          throw new Error(error.message);
        }
      }

      continue;
    }

    const { error } = await supabase
      .from("tasks_board_items_assignee_data")
      .insert({
        workspace_uuid: workspaceUuid,
        board_uuid: boardUuid,
        task_uuid: taskUuid,
        user_uuid: userUuid,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  const selectedUsers = new Set(uniqueAssigneeUuids);

  const activeRows = (existingRows ?? []).filter(
    (row) => row.deleted_at === null && !selectedUsers.has(row.user_uuid),
  );

  for (const row of activeRows) {
    const { error } = await supabase
      .from("tasks_board_items_assignee_data")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("id", row.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

async function getTaskState(stateUuid: string | null) {
  if (!stateUuid) {
    return null;
  }

  const { data, error } = await supabase
    .from("tasks_board_states_data")
    .select("uuid, color, title")
    .eq("uuid", stateUuid)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTaskData(item: any, assignees: any[] = []) {
  return {
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
    assignees,
  };
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

    const taskUuids = (data ?? []).map((item) => item.uuid);

    const assigneesByTask = await getTaskAssignees(taskUuids);

    const parsedData = (data ?? []).map((item) =>
      parseTaskData(item, assigneesByTask.get(item.uuid) ?? []),
    );

    return NextResponse.json({
      data: parsedData,
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
      assignee_uuids,
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

    if (assignee_uuids !== undefined && !Array.isArray(assignee_uuids)) {
      return NextResponse.json(
        { error: "assignee_uuids must be an array" },
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

    if (Array.isArray(assignee_uuids)) {
      await syncTaskAssignees(
        data.uuid,
        workspace_uuid,
        board_uuid,
        assignee_uuids,
      );
    }

    const state = await getTaskState(data.state_uuid);

    const assigneesByTask = await getTaskAssignees([data.uuid]);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...parseTaskData(data, assigneesByTask.get(data.uuid) ?? []),
          state_name: state?.title ?? null,
          state_color: state?.color ?? null,
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

    if (
      body.assignee_uuids !== undefined &&
      !Array.isArray(body.assignee_uuids)
    ) {
      return NextResponse.json(
        { error: "assignee_uuids must be an array" },
        { status: 400 },
      );
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

    if (body.assignee_uuids !== undefined) {
      await syncTaskAssignees(
        data.uuid,
        data.workspace_uuid,
        data.board_uuid,
        body.assignee_uuids,
      );
    }

    const state = await getTaskState(data.state_uuid);

    const assigneesByTask = await getTaskAssignees([data.uuid]);

    return NextResponse.json({
      success: true,
      data: {
        ...parseTaskData(data, assigneesByTask.get(data.uuid) ?? []),
        state_name: state?.title ?? null,
        state_color: state?.color ?? null,
      },
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

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("tasks_board_items_data")
      .update({
        deleted_at: now,
        updated_at: now,
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
