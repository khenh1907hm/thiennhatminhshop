import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 6) return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });

    const token = await prisma.verificationToken.findUnique({ where: { token: code } });
    if (!email || !token || token.identifier !== `password-reset:${email}` || token.expires < new Date()) {
      return NextResponse.json({ error: "Mã xác nhận không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }
    await prisma.user.update({ where: { email }, data: { password: await bcrypt.hash(password, 12), emailVerified: new Date() } });
    await prisma.verificationToken.delete({ where: { token: code } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json({ error: "Không thể đặt lại mật khẩu" }, { status: 500 });
  }
}
