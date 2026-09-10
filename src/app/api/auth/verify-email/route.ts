import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const token = await prisma.verificationToken.findUnique({ where: { token: code } });
    if (!email || !token || token.identifier !== `email-verification:${email}` || token.expires < new Date()) {
      return NextResponse.json({ error: "Mã xác minh không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }
    await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
    await prisma.verificationToken.delete({ where: { token: code } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email verification failed:", error);
    return NextResponse.json({ error: "Không thể xác minh email" }, { status: 500 });
  }
}
