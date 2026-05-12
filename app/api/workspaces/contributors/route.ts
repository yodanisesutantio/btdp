import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const workspaceUuid = searchParams.get("q");

    if (!workspaceUuid) {
      return NextResponse.json(
        { error: "Workspace uuid is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("workspaces_users")
      .select(
        `
        workspace_uuid,
        user_uuid,
        role,

        users (
          uuid,
          username,
          first_name,
          last_name
        ),

        workspaces_data (
          uuid,
          slug,
          title,
          description
        )
      `,
      )
      .eq("workspace_uuid", workspaceUuid);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const roleOrder: Record<string, number> = {
      Owner: 1,
      Admin: 2,
      Editor: 3,
      Contributor: 4,
      Viewer: 5,
    };

    const formattedData = data
      .map((item) => ({
        ...item.users,
        role: item.role,
      }))
      .sort((a, b) => {
        return roleOrder[a.role] - roleOrder[b.role];
      });

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { workspace_uuid, user_uuid, role } = body;

    if (!workspace_uuid || !user_uuid || !role) {
      return NextResponse.json(
        {
          error: "workspace_uuid, user_uuid, and role are required",
        },
        { status: 400 },
      );
    }

    if (role === "Owner") {
      const { data: currentOwner, error: currentOwnerError } = await supabase
        .from("workspaces_users")
        .select("*")
        .eq("workspace_uuid", workspace_uuid)
        .eq("role", "Owner")
        .single();

      if (currentOwnerError) {
        return NextResponse.json(
          {
            error: currentOwnerError.message,
          },
          { status: 400 },
        );
      }

      const { error: downgradeError } = await supabase
        .from("workspaces_users")
        .update({
          role: "Admin",
        })
        .eq("workspace_uuid", workspace_uuid)
        .eq("user_uuid", currentOwner.user_uuid);

      if (downgradeError) {
        return NextResponse.json(
          {
            error: downgradeError.message,
          },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabase
      .from("workspaces_users")
      .update({
        role,
      })
      .eq("workspace_uuid", workspace_uuid)
      .eq("user_uuid", user_uuid)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { workspace_uuid, user_uuid } = body;

    if (!workspace_uuid || !user_uuid) {
      return NextResponse.json(
        {
          error: "workspace_uuid and user_uuid are required",
        },
        { status: 400 },
      );
    }

    const { data: existingContributor } = await supabase
      .from("workspaces_users")
      .select("*")
      .eq("workspace_uuid", workspace_uuid)
      .eq("user_uuid", user_uuid)
      .single();

    if (existingContributor) {
      return NextResponse.json(
        {
          error: "User already exists in this workspace",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("workspaces_users")
      .insert({
        workspace_uuid,
        user_uuid,
        role: "Viewer",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    const { workspace_uuid, user_uuid } = body;

    if (!workspace_uuid || !user_uuid) {
      return NextResponse.json(
        {
          error: "workspace_uuid and user_uuid are required",
        },
        { status: 400 },
      );
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from("workspaces_users")
      .select("*")
      .eq("workspace_uuid", workspace_uuid)
      .eq("user_uuid", user_uuid)
      .single();

    if (existingUserError) {
      return NextResponse.json(
        {
          error: existingUserError.message,
        },
        { status: 400 },
      );
    }

    if (existingUser.role === "Owner") {
      return NextResponse.json(
        {
          error: "Workspace owner cannot be removed. Transfer ownership first.",
        },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("workspaces_users")
      .delete()
      .eq("workspace_uuid", workspace_uuid)
      .eq("user_uuid", user_uuid);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 },
    );
  }
}
