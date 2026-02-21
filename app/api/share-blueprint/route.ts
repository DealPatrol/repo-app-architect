import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Configure SUPABASE_URL and SUPABASE_ANON_KEY for sharing" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { title, type, data } = body;
    if (!title || !type || !data) {
      return NextResponse.json({ error: "Missing title, type, or data" }, { status: 400 });
    }

    const slug = randomBytes(8).toString("hex");

    const { error } = await supabase.from("repo_blueprints").insert({
      title: String(title).slice(0, 200),
      type: String(type),
      data,
      is_shared: true,
      share_slug: slug,
    });

    if (error) throw error;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const url = `${baseUrl}/share/${slug}`;
    return NextResponse.json({ url, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Share failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "Sharing not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("repo_blueprints")
    .select("title, type, data")
    .eq("share_slug", slug)
    .eq("is_shared", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
