import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const {
    title,
    slug,
    description,
    public: isPublic,
    workspaceUuid,
    created_by,
  } = await req.json();

  const { data, error } = await supabase
    .from("tasks_board_data")
    .insert([
      {
        title,
        slug,
        description,
        public: isPublic,
        archive: false,
        workspace_uuid: workspaceUuid,
        created_by,
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
}
