import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request) {
  try {
    const { username, date_of_birth } = await req.json();

    const hashedPassword = await bcrypt.hash(date_of_birth, 10);

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
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
