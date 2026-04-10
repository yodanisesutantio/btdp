import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { firstName, lastName, username, password, dateOfBirth } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (username === "administrator") {
      return NextResponse.json(
        { error: "The username 'administrator' is not allowed." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("users").insert({
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
      date_of_birth: dateOfBirth,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
