import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { NotesData } from "@/app/(main)/notes/page";

export async function GET() {
  const { data: notes, error } = await supabase
    .from("notes_data")
    .select(
      `
      *,
      user:created_by (username, first_name, last_name)
    `,
    )
    .eq("archive", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const noteUUIDs = notes.map((s) => s.uuid);

  const { data: relations } = await supabase
    .from("label_relations")
    .select("*")
    .in("target_uuid", noteUUIDs)
    .eq("target_type", "note");

  const labelUUIDs = relations?.map((r) => r.label_uuid);

  const { data: labels } = await supabase
    .from("labels")
    .select("*")
    .in("uuid", labelUUIDs ?? []);

  const mappedData: NotesData[] = notes.map((note) => {
    const relation = relations?.find((r) => r.target_uuid === note.uuid);

    const label = labels?.find((l) => l.uuid === relation?.label_uuid);

    return {
      uuid: note.uuid ?? "",
      imagePreview: "",
      title: note.title ?? "",
      labels: label?.label ?? "",
      slug: note.slug ?? "",
      content: note.content ?? "",
      public: note.public ?? false,
      description: note.description ?? "",
      createdBy: note.user?.username ?? "",
      createdByFirstName: note.user?.first_name ?? "",
      createdByLastName: note.user?.last_name ?? "",
      createdAt: note.created_at ?? "",
    };
  });

  return NextResponse.json({ data: mappedData });
}
