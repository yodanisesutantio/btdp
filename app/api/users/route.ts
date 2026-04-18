import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcrypt";

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

export async function PUT(req: Request) {
  try {
    const { first_name, last_name, username, date_of_birth } = await req.json();

    if (!first_name || !last_name || !username || !date_of_birth) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        username,
        date_of_birth,
        updated_at: new Date().toISOString(),
      })
      .eq("username", username)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { username, currentPassword, newPassword } = await req.json();

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("password")
      .eq("username", username)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedNewPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("username", username);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
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
