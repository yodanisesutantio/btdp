import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SheetsData } from "@/app/(main)/sheets/page";

export async function GET() {
  const { data: sheets, error } = await supabase
    .from("sheets_data")
    .select(
      `
      *,
      user:created_by (username, first_name, last_name)
    `,
    )
    .eq("archive", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const sheetUUIDs = sheets.map((s) => s.uuid);

  const { data: relations } = await supabase
    .from("label_relations")
    .select("*")
    .in("target_uuid", sheetUUIDs)
    .eq("target_type", "sheet");

  const labelUUIDs = relations?.map((r) => r.label_uuid);

  const { data: labels } = await supabase
    .from("labels")
    .select("*")
    .in("uuid", labelUUIDs ?? []);

  const mappedData: SheetsData[] = sheets.map((sheet) => {
    const relation = relations?.find((r) => r.target_uuid === sheet.uuid);

    const label = labels?.find((l) => l.uuid === relation?.label_uuid);

    return {
      uuid: sheet.uuid ?? "",
      imagePreview: "",
      title: sheet.title ?? "",
      labels: label?.label ?? "",
      slug: sheet.slug ?? "",
      content: sheet.content ?? "",
      public: sheet.public ?? false,
      description: sheet.description ?? "",
      createdBy: sheet.user?.username ?? "",
      createdByFirstName: sheet.user?.first_name ?? "",
      createdByLastName: sheet.user?.last_name ?? "",
      createdAt: sheet.created_at ?? "",
    };
  });

  return NextResponse.json({ data: mappedData });
}
