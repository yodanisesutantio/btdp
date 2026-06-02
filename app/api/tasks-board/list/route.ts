import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TasksBoardData } from "@/app/(main)/tasks/page";

export async function POST(req: Request) {
  const { workspaceUuid } = await req.json();

  let query = supabase
    .from("tasks_board_data")
    .select(
      `
      *,
      user:created_by (
        username,
        first_name,
        last_name
      )
    `,
    )
    .eq("archive", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (workspaceUuid) {
    query = query.eq("workspace_uuid", workspaceUuid);
  }

  const { data: boards, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const mappedData: TasksBoardData[] = boards.map((board) => ({
    uuid: board.uuid ?? "",
    title: board.title ?? "",
    slug: board.slug ?? "",
    public: board.public ?? false,
    description: board.description ?? "",
    archive: board.archive ?? false,
    createdBy: board.user?.username ?? "",
    createdByFirstName: board.user?.first_name ?? "",
    createdByLastName: board.user?.last_name ?? "",
    createdAt: board.created_at ?? "",
    updatedAt: board.updated_at ?? "",
  }));

  return NextResponse.json({
    data: mappedData,
  });
}
