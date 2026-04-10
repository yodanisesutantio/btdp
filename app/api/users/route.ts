import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("first_name, last_name, username, date_of_birth")
      .is("deleted_at", null)
      .order("username", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const sortedData = data?.sort((a, b) => {
      if (a.username === "administrator") return -1;
      if (b.username === "administrator") return 1;
      return 0;
    });

    return NextResponse.json({
      success: true,
      data: sortedData,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { username } = await req.json();

    if (username === "administrator") {
      return NextResponse.json(
        { error: "Cannot delete administrator" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("users")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("username", username);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
