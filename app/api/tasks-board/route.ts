import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TasksState } from "@/app/(main)/tasks/page";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { data: board, error } = await supabase
      .from("tasks_board_data")
      .select("*")
      .eq("uuid", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!board) {
      return NextResponse.json(
        { error: "Task board not found" },
        { status: 404 },
      );
    }

    const { data: states, error: statesError } = await supabase
      .from("tasks_board_states_data")
      .select("*")
      .eq("task_board_uuid", id)
      .is("deleted_at", null)
      .order("state_order");

    if (statesError) {
      return NextResponse.json({ error: statesError.message }, { status: 400 });
    }

    const mappedStates =
      states?.map((state) => ({
        key: state.key,
        task_board_uuid: state.task_board_uuid,
        uuid: state.uuid,
        title: state.title,
        color: state.color,
        default: state.is_default,
        archived: state.archived,
        order: state.state_order,
      })) ?? [];

    return NextResponse.json({
      data: {
        ...board,
        states: mappedStates,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { uuid, title, slug, description, states } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks_board_data")
      .update({
        title,
        slug,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("uuid", uuid)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Task board not found" },
        { status: 404 },
      );
    }

    if (Array.isArray(states)) {
      const { data: existingStates, error: existingStatesError } =
        await supabase
          .from("tasks_board_states_data")
          .select("uuid")
          .eq("task_board_uuid", uuid)
          .is("deleted_at", null);

      if (existingStatesError) {
        return NextResponse.json(
          { error: existingStatesError.message },
          { status: 400 },
        );
      }

      const incomingUuids = new Set(
        states.map((s: { uuid: string }) => s.uuid).filter(Boolean),
      );

      const deletedUuids =
        existingStates
          ?.filter((s) => !incomingUuids.has(s.uuid))
          .map((s) => s.uuid) ?? [];

      if (deletedUuids.length) {
        const { error: deletedStateError } = await supabase
          .from("tasks_board_states_data")
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in("uuid", deletedUuids);

        if (deletedStateError) {
          return NextResponse.json(
            { error: deletedStateError.message },
            { status: 400 },
          );
        }
      }

      const { error: upsertedStateError } = await supabase
        .from("tasks_board_states_data")
        .upsert(
          states.map((state: TasksState) => ({
            uuid: state.uuid,
            key: state.key,
            title: state.title,
            color: state.color,
            is_default: state.default,
            archived: state.archived,
            state_order: state.order,
            task_board_uuid: uuid,
            updated_at: new Date().toISOString(),
          })),
          {
            onConflict: "uuid",
          },
        );

      if (upsertedStateError) {
        return NextResponse.json(
          { error: upsertedStateError.message },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "UUID is required" }, { status: 400 });
  }

  const { error: statesError } = await supabase
    .from("tasks_board_states_data")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("task_board_uuid", uuid);

  if (statesError) {
    return NextResponse.json({ error: statesError.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks_board_data")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("uuid", uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Task board not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
