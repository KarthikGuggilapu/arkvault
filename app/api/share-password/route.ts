import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';
import { decrypt } from "@/lib/utils";

// Helper function to read the email template
function getEmailHtml(templatePath: string, replacements: Record<string, string>): string {
  try {
    const template = fs.readFileSync(path.resolve(process.cwd(), templatePath), 'utf-8');
    let html = template;
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }
    return html;
  } catch (error) {
    console.error("Error reading email template:", error);
    return `Hi, a password has been shared with you. Please check your ArkVault account.`;
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { to, subject, entry, shared_by_email, shared_by_user_id } = await req.json();

  // Fetch mailer configuration for the user
  const { data: mailerConfig, error: configError } = await supabase
    .from('mailer_configuration')
    .select('*')
    .eq('user_id', shared_by_user_id)
    .single();

  if (configError || !mailerConfig) {
    return NextResponse.json({ success: false, error: "Mailer configuration not found." }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: mailerConfig.host,
    port: mailerConfig.port,
    secure: mailerConfig.secure,
    auth: {
      user: mailerConfig.email,
      pass: decrypt(mailerConfig.password),
    },
  });

  try {
    const emailHtml = getEmailHtml('templates/share-password-email.html', {
      app_logo_url: `${process.env.NEXT_PUBLIC_APP_URL}/arkvault-logo.png`,
      sharer_email: shared_by_email,
      website_url: entry.url || '#',
      website_display: entry.url ? entry.url.replace(/^(https?:\/\/)/, '') : 'N/A',
      username: entry.username,
      password: decrypt(entry.password),
    });
    
    await transporter.sendMail({
      from: `"${shared_by_email}" <${mailerConfig.email}>`,
      to,
      subject,
      html: emailHtml,
    });
    
    // Log the share event in the database
    if (to && shared_by_email && shared_by_user_id) {
      await supabase.from("shared_passwords").insert([
        {
          password_id: entry.id,
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
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shared_by_user_id = searchParams.get('shared_by_user_id');

  let query = supabase.from("shared_passwords").select("*").order("sent_at", { ascending: false });

  if (shared_by_user_id) {
    query = query.eq('shared_by_user_id', shared_by_user_id);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("--- DATABASE QUERY FAILED ---", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, data });
}
