import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and Password are required." },
        { status: 400 },
      );
    }

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!userData.active) {
      return NextResponse.json(
        {
          error:
            "You are not allowed to sign in. Please contact devs to admit you to sign in.",
        },
        { status: 403 },
      );
    }

    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = randomUUID();
    const activeUntil = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const { error: loginError } = await supabase.from("login_info").insert({
      user_uuid: userData.uuid,
      active_until: activeUntil.toISOString(),
      token,
    });

    if (loginError) {
      return NextResponse.json({ error: loginError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, token, user: userData });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
