import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const stateUuid = searchParams.get("uuid");
    const boardUuid = searchParams.get("board_uuid");

    const cursorCreatedAt = searchParams.get("cursor_created_at");
    const cursorUuid = searchParams.get("cursor_uuid");

    const limitParam = Number(searchParams.get("limit") ?? "10");
    const limit = Math.min(Math.max(limitParam, 1), 50);

    if (!stateUuid) {
      return NextResponse.json(
        { error: "State UUID is required" },
        { status: 400 },
      );
    }

    if (!boardUuid) {
      return NextResponse.json(
        { error: "Board UUID is required" },
        { status: 400 },
      );
    }

    let itemsQuery = supabase
      .from("tasks_board_items_data")
      .select("*")
      .eq("state_uuid", stateUuid)
      .eq("board_uuid", boardUuid)
      .eq("archive", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursorCreatedAt && cursorUuid) {
      itemsQuery = itemsQuery.or(
        `created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},uuid.lt.${cursorUuid})`,
      );
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    const { count: total, error: countError } = await supabase
      .from("tasks_board_items_data")
      .select("uuid", {
        count: "exact",
        head: true,
      })
      .eq("state_uuid", stateUuid)
      .eq("board_uuid", boardUuid)
      .eq("archive", false)
      .is("deleted_at", null);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    const hasMore = (items?.length ?? 0) > limit;

    const paginatedItems = hasMore ? items?.slice(0, limit) : (items ?? []);

    const { data: state, error: stateError } = await supabase
      .from("tasks_board_states_data")
      .select("color, title")
      .eq("uuid", stateUuid)
      .is("deleted_at", null)
      .single();

    if (stateError) {
      return NextResponse.json({ error: stateError.message }, { status: 400 });
    }

    const mappedItems =
      paginatedItems?.map((item) => ({
        ...item,
        state_color: state?.color ?? "dark-gray",
        state_name: state?.title ?? "Backlog",
      })) ?? [];

    const lastItem = mappedItems[mappedItems.length - 1];

    return NextResponse.json({
      data: mappedItems,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? {
              created_at: lastItem.created_at,
              uuid: lastItem.uuid,
            }
          : null,
      total: total ?? 0,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
