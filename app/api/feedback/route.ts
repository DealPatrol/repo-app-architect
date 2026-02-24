import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Feedback is not available" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { target, feedbackType, rating } = body as {
      target?: string;
      feedbackType?: string;
      rating?: number;
    };

    if (typeof rating !== "number" || (rating !== 1 && rating !== -1)) {
      return NextResponse.json({ error: "Rating must be 1 or -1" }, { status: 400 });
    }

    const type = String(feedbackType || "analysis").slice(0, 50);

    const { error } = await supabase.from("repo_feedback").insert({
      target: target?.trim().slice(0, 128) || null,
      feedback_type: type,
      rating,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Feedback failed" },
      { status: 500 }
    );
  }
}
