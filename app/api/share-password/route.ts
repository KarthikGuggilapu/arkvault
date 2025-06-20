import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { to, subject, text, entry, shared_by_email, shared_by_user_id } = await req.json();

  // Directly configure your Gmail SMTP transporter (for demo/testing only)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465
    auth: {
      user: "webservice2630@gmail.com", // <-- replace with your Gmail address
      pass: "xilrrdnanpmelsgs", // <-- replace with your Gmail app password
    },
  });

  try {
    await transporter.sendMail({
      from: '"ArkVault" <webservice2630@gmail.com>',
      to,
      subject,
      text,
    });

    // Log the share event in the database
    if (entry && to && shared_by_email && shared_by_user_id) {
      await supabase.from("shared_passwords").insert([
        {
          password_id: entry.id || null,
          password_title: entry.title,
          password_username: entry.username,
          password_url: entry.url,
          password_category: entry.category,
          password_notes: entry.notes || null,
          shared_with_email: to,
          shared_by_email,
          shared_by_user_id,
          sent_at: new Date().toISOString(),
        },
      ]);

      // Log the activity in user_activity
      await supabase.from("user_activity").insert([
        {
          user_id: shared_by_user_id,
          activity_type: "shared",
          title: `Shared password '${entry.title}' with ${to}`,
          icon: "Share",
          color: "text-blue-500",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("shared_passwords")
    .select("*")
    .order("sent_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
