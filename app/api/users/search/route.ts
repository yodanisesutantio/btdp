import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        uuid,
        username,
        first_name,
        last_name
      `,
      )
      .or(
        `username.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`,
      )
      .limit(10);

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
