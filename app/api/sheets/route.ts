import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("sheets_data")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("uuid", uuid);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
