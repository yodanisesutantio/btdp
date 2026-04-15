import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) return NextResponse.json({ valid: false });

  const { data, error } = await supabase
    .from("login_info")
    .select("id, active_until")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ valid: false });

  const now = Date.now();

  const activeUntil = data.active_until
    ? new Date(data.active_until.replace(" ", "T") + "Z").getTime()
    : null;

  const valid = !activeUntil || activeUntil > now;

  return NextResponse.json({ valid });
}
