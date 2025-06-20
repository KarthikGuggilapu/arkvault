import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  let { to, subject, text, password_id, password_title, password_username, password_url, password_category, password_notes, shared_by_email, shared_by_user_id } = await req.json();

  // If entry is undefined, return an error
  

  // If shared_by_email or shared_by_user_id are undefined, get them from the session
  if (!shared_by_email || !shared_by_user_id) {
    const supabaseServerClient = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabaseServerClient.auth.getUser();
    if (user) {
      shared_by_user_id = user.id;
      shared_by_email = user.email;
    } else {
      return NextResponse.json({ success: false, error: "User not authenticated. Please log in." }, { status: 401 });
    }
  }

  console.log('POST /api/share-password body:', { to, subject, text, password_id, password_title, password_username, password_url, password_category, password_notes, shared_by_email, shared_by_user_id });

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
    if (to && shared_by_email && shared_by_user_id) {
      await supabase.from("shared_passwords").insert([
        {
          password_id: password_id || null,
          password_title,
          password_username,
          password_url,
          password_category,
          password_notes: password_notes || null,
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
          title: `Shared password '${password_title}' with ${to}`,
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

