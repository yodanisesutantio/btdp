import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const stateUuid = searchParams.get("uuid");
    const boardUuid = searchParams.get("board_uuid");

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

    const { data: items, error: itemsError } = await supabase
      .from("tasks_board_items_data")
      .select("*")
      .eq("state_uuid", stateUuid)
      .eq("board_uuid", boardUuid)
      .eq("archive", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    const { data: state, error: stateError } = await supabase
      .from("tasks_board_states_data")
      .select("color")
      .eq("uuid", stateUuid)
      .is("deleted_at", null)
      .single();

    if (stateError) {
      return NextResponse.json({ error: stateError.message }, { status: 400 });
    }

    const mappedItems =
      items?.map((item) => ({
        ...item,
        state_color: state?.color ?? "dark-gray",
      })) ?? [];

    return NextResponse.json({
      data: mappedItems,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
