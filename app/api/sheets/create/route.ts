import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/helper";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    title,
    slug,
    description,
    public: isPublic,
    labels,
    content,
    created_by,
  } = body;

  const { data: sheet, error: sheetError } = await supabase
    .from("sheets_data")
    .insert({
      title,
      slug,
      description,
      public: isPublic,
      content,
      created_by,
    })
    .select()
    .single();

  if (sheetError) {
    return NextResponse.json({ error: sheetError.message }, { status: 400 });
  }

  const labelsArray = Array.isArray(labels) ? labels : labels ? [labels] : [];

  for (const labelName of labelsArray.slice(0, 1)) {
    const labelSlug = slugify(labelName);

    let { data: label } = await supabase
      .from("labels")
      .select("*")
      .eq("slug", labelSlug)
      .single();

    if (!label) {
      const { data: newLabel } = await supabase
        .from("labels")
        .insert({
          label: labelName,
          slug: labelSlug,
        })
        .select()
        .single();

      label = newLabel;
    }

    await supabase.from("label_relations").insert({
      label_uuid: label.uuid,
      target_uuid: sheet.uuid,
      target_type: "sheet",
    });
  }

  return NextResponse.json({ data: sheet });
}
