import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userUuid = searchParams.get("user_uuid");

    let query = supabase
      .from("workspaces_data")
      .select(
        `
        *,
        user:created_by (
          username,
          first_name,
          last_name
        ),
        workspaces_users (
          user_uuid,
          role,
          users (
            uuid,
            username,
            first_name,
            last_name
          )
        )
      `,
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (userUuid) {
      const { data: memberships, error: membershipError } = await supabase
        .from("workspaces_users")
        .select("workspace_uuid")
        .eq("user_uuid", userUuid);

      if (membershipError) {
        return NextResponse.json(
          { error: membershipError.message },
          { status: 400 },
        );
      }

      const workspaceIds =
        memberships?.map((item) => item.workspace_uuid) ?? [];

      query = query.in("uuid", workspaceIds);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const formattedData =
      data?.map((workspace) => ({
        ...workspace,
        workspaces_user:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          workspace.workspaces_users?.map((member: any) => ({
            uuid: member.users?.uuid,
            user_uuid: member.user_uuid,
            username: member.users?.username,
            user_full_name: member.users?.first_name,
            user_last_name: member.users?.last_name,
            role: member.role,
          })) ?? [],
      })) ?? [];

    return NextResponse.json({
      data: formattedData,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { uuid, title, slug, description, created_by } = body;

    const { data, error } = await supabase
      .from("workspaces_data")
      .upsert(
        {
          uuid,
          title,
          slug,
          description,
          created_by,
        },
        {
          onConflict: "uuid",
        },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error: workspaceError } = await supabase
      .from("workspaces_data")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("uuid", uuid);

    if (workspaceError) {
      return NextResponse.json(
        { error: workspaceError.message },
        { status: 400 },
      );
    }

    const { error: usersError } = await supabase
      .from("workspaces_users")
      .delete()
      .eq("workspace_uuid", uuid);

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
