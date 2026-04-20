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

  const { data: note, error: noteError } = await supabase
    .from("notes_data")
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

  if (noteError) {
    return NextResponse.json({ error: noteError.message }, { status: 400 });
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
      target_uuid: note.uuid,
      target_type: "note",
    });
  }

  return NextResponse.json({ data: note });
}
