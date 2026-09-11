import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { randomInt } from "crypto";
import { sendEmail, buildCodeEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientKey, rateLimitResponse } from "@/lib/rateLimit";
import { isValidEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "register"), 5, 15 * 60 * 1000);
    if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);
    const body = await request.json();
    const { name, password } = body;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!name || !email || !password) {
      return new NextResponse("Thiếu thông tin bắt buộc", { status: 400 });
    }
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) return NextResponse.json({ error: "Họ tên không hợp lệ" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    if (typeof password !== "string" || password.length < 8 || password.length > 128) return NextResponse.json({ error: "Mật khẩu phải từ 8 đến 128 ký tự" }, { status: 400 });
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json({ error: "Hệ thống email chưa được cấu hình" }, { status: 503 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      return new NextResponse("Email này đã được sử dụng", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { name, password: hashedPassword } })
      : await prisma.user.create({ data: { name, email, password: hashedPassword } });

    const code = String(randomInt(100000, 1000000));
    await prisma.verificationToken.deleteMany({ where: { identifier: `email-verification:${email}` } });
    await prisma.verificationToken.create({
      data: { identifier: `email-verification:${email}`, token: code, expires: new Date(Date.now() + 10 * 60 * 1000) },
    });
    try {
      await sendEmail({ to: email, subject: "Mã xác minh tài khoản Thiên Nhật Minh", html: buildCodeEmail("Xác minh email đăng ký", code) });
    } catch (emailError) {
      await prisma.verificationToken.deleteMany({ where: { identifier: `email-verification:${email}` } });
      if (!existing) await prisma.user.delete({ where: { id: user.id } });
      throw emailError;
    }

    return NextResponse.json({ success: true, message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản." }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    const message = error instanceof Error ? error.message : "Lỗi máy chủ nội bộ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
