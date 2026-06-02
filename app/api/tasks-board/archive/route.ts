import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { uuid, archive } = await req.json();

  const { error } = await supabase
    .from("tasks_board_data")
    .update({
      archive,
      updated_at: new Date().toISOString(),
    })
    .eq("uuid", uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
  });
}
