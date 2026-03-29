import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email: string };

    if (!email?.trim()) {
      return NextResponse.json({ exists: false });
    }

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .limit(1);

    return NextResponse.json({ exists: !!(data && data.length > 0) });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
