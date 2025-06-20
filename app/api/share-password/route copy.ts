import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { to, subject, text } = await req.json();

  // Directly configure your Gmail SMTP transporter (for demo/testing only)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465
    auth: {
      user: "your@gmail.com", // <-- replace with your Gmail address
      pass: "your_app_password_here", // <-- replace with your Gmail app password
    },
  });

  try {
    await transporter.sendMail({
      from: '"ArkVault" <your@gmail.com>', // <-- replace with your Gmail address
      to,
      subject,
      text,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}
