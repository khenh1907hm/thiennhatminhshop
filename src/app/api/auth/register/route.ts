import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Thiếu thông tin bắt buộc", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (exist) {
      return new NextResponse("Email này đã được sử dụng", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ success: true, message: "Đăng ký thành công" }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return new NextResponse("Lỗi máy chủ nội bộ", { status: 500 });
  }
}
