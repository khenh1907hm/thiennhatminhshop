import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildCodeEmail, sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const user = await prisma.user.findUnique({ where: { email }, select: { email: true } });
    if (user?.email) {
      const code = String(randomInt(100000, 1000000));
      await prisma.verificationToken.deleteMany({ where: { identifier: `password-reset:${email}` } });
      await prisma.verificationToken.create({ data: { identifier: `password-reset:${email}`, token: code, expires: new Date(Date.now() + 10 * 60 * 1000) } });
      await sendEmail({ to: email, subject: "Mã đặt lại mật khẩu Thiên Nhật Minh", html: buildCodeEmail("Đặt lại mật khẩu", code) });
    }
    return NextResponse.json({ success: true, message: "Nếu email tồn tại, mã xác nhận đã được gửi." });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return NextResponse.json({ error: "Không thể gửi mã đặt lại mật khẩu" }, { status: 500 });
  }
}
